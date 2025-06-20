# import os
# import psycopg2
# import openai
# from pinecone import Pinecone, ServerlessSpec
# from dotenv import load_dotenv
# from openai import OpenAI
# import time
# import pandas as pd
# import hashlib
# # Load environment variables
# load_dotenv()

# # API keys
# openai.api_key = os.getenv("OPENAI_API_KEY")
# pinecone_api = os.getenv("PINECONE_API_KEY")
# pinecone_index = os.getenv("PINECONE_INDEX")
# database_url = os.getenv("DATABASE_URL")

# # Initialize OpenAI and Pinecone clients
# client = OpenAI(api_key=openai.api_key)
# pc = Pinecone(api_key=pinecone_api)

# # ✅ Delete and Recreate Pinecone Index to Avoid Discrepancies
# # if pinecone_index in [idx.name for idx in pc.list_indexes()]:
# #     print(f"⚠️ Deleting existing index '{pinecone_index}' to prevent conflicts...")
# #     pc.delete_index(pinecone_index)
# #     time.sleep(2)  # Allow Pinecone to process deletion

# # print(f"🛠️ Creating a fresh index '{pinecone_index}'...")
# # pc.create_index(
# #     name=pinecone_index,
# #     dimension=3072,  # Match embedding model
# #     metric="cosine",
# #     spec=ServerlessSpec(cloud="aws", region="us-east-1")
# # )
# # time.sleep(5)  # Ensure index is ready

# # Get the Pinecone index
# index = pc.Index(pinecone_index)


# def get_embedding(text):
#     """
#     Compute an embedding using OpenAI's embedding API.
#     """
#     try:
#         response = client.embeddings.create(input=[text], model="text-embedding-3-large")
#         return response.data[0].embedding
#     except Exception as e:
#         print(f"❌ Error computing embedding: {e}")
#         return None

# def compute_row_hash_from_values(values):
#     text = "|".join(str(v) for v in values if v is not None)
#     return hashlib.md5(text.encode()).hexdigest()

# def sync_category_data(table_name):
#     """
#     Fetch missing data from PostgreSQL for a specific category, compute embeddings, and push them into Pinecone.
#     """
#     conn = None
#     try:
#         conn = psycopg2.connect(database_url)
#         cursor = conn.cursor()

#         print(f"\n🔄 Processing table: {table_name}")

#         cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '{table_name}'")
#         text_columns = [col[0] for col in cursor.fetchall()]

#         if not text_columns:
#             print(f"⚠️ Skipping '{table_name}' - No text-based columns found.")
#             return

#         cursor.execute(f"SELECT * FROM {table_name}")
#         rows = cursor.fetchall()
#         colnames = [desc[0] for desc in cursor.description]

#         vectors = []
#         batch_size = 10  # ✅ Process in batches for stability

#         for i, row in enumerate(rows):
#             # ✅ Make ID unique across tables
#             record_id = f"{table_name}_{row[colnames.index('id')]}" if 'id' in colnames else f"{table_name}_{i}"

#             text_content = " | ".join(
#                 [str(row[colnames.index(col)]) for col in text_columns if row[colnames.index(col)] is not None]
#             ).strip()

#             if not text_content:
#                 print(f"⚠️ Skipping empty record for table {table_name} (ID: {record_id})")
#                 continue  
#             row_hash = compute_row_hash_from_values([row[colnames.index(col)] for col in text_columns])
#             embedding = get_embedding(text_content)
#             if embedding is None:
#                 print(f"❌ Skipping embedding failure for record: {record_id} in table {table_name}")
#                 continue  

#             metadata = {"category": table_name, "data_text": text_content,"hash": row_hash}
#             vectors.append({"id": record_id, "values": embedding, "metadata": metadata})

#             print(f"✅ Prepared for Upsert - ID={record_id}, Table={table_name}")

#             # ✅ Commit every `batch_size` records
#             if len(vectors) >= batch_size:
#                 print("\n🔄 Committing batch Upsert to Pinecone...")
#                 index.upsert(vectors)
#                 vectors = []  # Reset batch

#         # ✅ Final upsert for remaining records
#         if vectors:
#             print("\n🔄 Final Upsert for remaining records...")
#             index.upsert(vectors)

#         print(f"\n✅ Successfully processed category: {table_name}")

#     except Exception as e:
#         print(f"\n❌ Error processing {table_name}: {e}")
#     finally:
#         if conn:
#             conn.close()


# def sync_all_data():
#     """
#     Sync all tables category-wise to Pinecone.
#     """
#     categories = ["projects", "experience", "certifications", "content", "skills"]
    
#     for category in categories:
#         sync_category_data(category)

#     print("\n✅ All categories synced successfully!")

# def upsert_interview_qa(csv_path):
#     df = pd.read_csv(csv_path)
#     vectors = []
    
#     for idx, row in df.iterrows():
#         question = str(row['Question']).strip()
#         answer = str(row['Answer']).strip()
#         category = "interview_qa"  # 🔁 Common category for all
        
#         if not question or not answer or answer.lower() == "nan":
#             continue
        
#         combined_text = f"Q: {question}\nA: {answer}"
#         embedding = client.embeddings.create(input=[combined_text], model="text-embedding-3-large").data[0].embedding
        
#         record_id = f"qa_{idx}"
#         metadata = {
#             "category": category,
#             "data_text": combined_text
#         }
#         vectors.append({"id": record_id, "values": embedding, "metadata": metadata})

#     if vectors:
#         print(f"🔄 Upserting {len(vectors)} interview QAs to Pinecone...")
#         index.upsert(vectors)
#         print("✅ Interview QAs upserted.")
#     else:
#         print("⚠️ No valid QA pairs found.")

# # Run once:
# # upsert_interview_qa("interview_questions_cleaned.csv")

# def verify_pinecone_data():
#     """
#     Fetch stored data from Pinecone and verify all records exist.
#     """
#     print("\n🔍 Fetching ALL stored records from Pinecone...\n")
#     time.sleep(5)  # Allow Pinecone to process data

#     stored_categories = set()
    
#     # ✅ Check each category separately
#     categories = ["projects", "experience", "certifications", "content", "skills"]
    
#     for category in categories:
#         print(f"\n🔎 Checking stored records for: {category}")
#         query_result = index.query(vector=[0] * 3072, top_k=50, include_metadata=True, filter={"category": category})

#         if not query_result.get("matches"):
#             print(f"⚠️ No records found for {category}!")
#         else:
#             for match in query_result["matches"]:
#                 metadata = match["metadata"]
#                 stored_categories.add(metadata.get("category", "unknown"))
#                 print(f"📌 Found in Pinecone: {metadata}")

#     print(f"\n✅ Stored Categories in Pinecone: {', '.join(stored_categories)}")
#     missing_categories = set(categories) - stored_categories
#     if missing_categories:
#         print(f"❌ Missing in Pinecone: {', '.join(missing_categories)}")


# if __name__ == "__main__":
#     # print("🔄 Syncing missing data to Pinecone...")
#     # sync_all_data()

#     # print("\n✅ Verification Step: Checking if data is stored correctly...")
#     # verify_pinecone_data()
#     upsert_interview_qa("interview_questions_cleaned.csv")
# #During the development of my Emotional Intelligence Integration with Pepper Robot project, I encountered a significant challenge that required a change in approach. The project aimed to create an emotionally intelligent chatbot for caregiver support, integrating advanced language models with the Pepper robot for a multimodal communication experience. Initially, I used a 4-ensemble model comprising Llama, Falcon, and two instances of Phi2, but hosting the model on free CPU-based services like Google Colab resulted in slower response times. Additionally, integrating the chatbot with the Pepper robot was technically challenging due to the robot's SDK limitations, which only supported Python 2.7.

# #To address these challenges, I employed creative solutions, including using subprocesses to execute modern Python code, exploring alternative hosting options to improve response times, and refining the chatbot's architecture to optimize the ensemble model and integration with the Pepper robot. By adapting my approach, I successfully integrated the emotionally intelligent chatbot with the Pepper robot, achieving a 30% reduction in response time and a 25% improvement in overall system efficiency. This experience taught me the importance of agility in project development, creative problem-solving, and continuous evaluation and optimization. The project's outcome demonstrated the feasibility of using AI to enhance emotional interactions in caregiving contexts and set a foundation for future research into the broader application of AI in emotional support roles.

# Updated Code:

import os
import psycopg2
import openai
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from openai import OpenAI
import time
import pandas as pd
import hashlib

# Load environment variables
load_dotenv()

# API keys
openai.api_key = os.getenv("OPENAI_API_KEY")
pinecone_api = os.getenv("PINECONE_API_KEY")
pinecone_index = os.getenv("PINECONE_INDEX")
database_url = os.getenv("DATABASE_URL")

# Initialize clients
client = OpenAI(api_key=openai.api_key)
pc = Pinecone(api_key=pinecone_api)
index = pc.Index(pinecone_index)

def get_embedding(text):
    """Compute an embedding using OpenAI's embedding API."""
    try:
        response = client.embeddings.create(input=[text], model="text-embedding-3-large")
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ Error computing embedding: {e}")
        return None

def compute_row_hash_from_values(values):
    """Generate consistent hash from row values."""
    text = "|".join(str(v) for v in values if v is not None)
    return hashlib.md5(text.encode()).hexdigest()

def get_existing_pinecone_hash(record_id):
    """Check if record exists in Pinecone and return its hash if found."""
    try:
        result = index.fetch(ids=[record_id])
        if record_id in result['vectors']:
            return result['vectors'][record_id]['metadata'].get('hash')
    except Exception as e:
        print(f"⚠️ Error checking Pinecone for {record_id}: {e}")
    return None

def sync_category_data(table_name):
    """
    Sync data from PostgreSQL to Pinecone with hash-based change detection.
    Handles both cases: with and without existing hashes.
    """
    conn = None
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        print(f"\n🔄 Processing table: {table_name}")

        # Get text columns
        cursor.execute(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '{table_name}'
        """)
        text_columns = [col[0] for col in cursor.fetchall()]

        if not text_columns:
            print(f"⚠️ Skipping '{table_name}' - No text columns found")
            return

        # Fetch all rows
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        colnames = [desc[0] for desc in cursor.description]

        vectors = []
        batch_size = 50
        stats = {
            'new': 0,
            'changed': 0,
            'unchanged': 0,
            'no_hash': 0  # Tracks records without existing hash
        }

        for i, row in enumerate(rows):
            # Generate unique ID
            record_id = f"{table_name}_{row[colnames.index('id')]}" if 'id' in colnames else f"{table_name}_{i}"

            # Prepare text content and current hash
            text_values = [row[colnames.index(col)] for col in text_columns]
            text_content = " | ".join(str(v) for v in text_values if v is not None).strip()
            
            if not text_content:
                continue

            current_hash = compute_row_hash_from_values(text_values)
            existing_record = None

            try:
                # Fetch existing record (if any)
                fetch_result = index.fetch(ids=[record_id])
                existing_record = fetch_result['vectors'].get(record_id)
            except Exception as e:
                print(f"⚠️ Error checking Pinecone for {record_id}: {e}")

            # Decision logic for processing
            should_process = True
            if existing_record:
                existing_metadata = existing_record.get('metadata', {})
                existing_hash = existing_metadata.get('hash')
                
                if existing_hash:
                    if existing_hash == current_hash:
                        stats['unchanged'] += 1
                        should_process = False
                    else:
                        stats['changed'] += 1
                else:
                    # Record exists but has no hash (legacy record)
                    stats['no_hash'] += 1
                    # We process it to ensure hash gets added
            else:
                stats['new'] += 1

            if not should_process:
                continue

            # Process record (either new, changed, or legacy without hash)
            embedding = get_embedding(text_content)
            if embedding is None:
                continue

            metadata = {
                "category": table_name,
                "data_text": text_content,
                "hash": current_hash  # Will add hash to legacy records too
            }
            vectors.append({
                "id": record_id,
                "values": embedding,
                "metadata": metadata
            })

            # Process batch when full
            if len(vectors) >= batch_size:
                index.upsert(vectors)
                vectors = []

        # Process remaining vectors
        if vectors:
            index.upsert(vectors)

        print(f"""
✅ Completed {table_name}:
   - New records: {stats['new']}
   - Changed records: {stats['changed']}
   - Unchanged records: {stats['unchanged']}
   - Legacy records (no hash): {stats['no_hash']}
   - Total in DB: {len(rows)}
""")

    except Exception as e:
        print(f"\n❌ Error processing {table_name}: {e}")
    finally:
        if conn:
            conn.close()

def sync_all_data():
    """Sync all tables category-wise to Pinecone with hash checking."""
    categories = ["projects", "experience", "certifications", "content", "skills"]
    for category in categories:
        sync_category_data(category)
    print("\n✅ All categories synced with hash verification!")

def upsert_interview_qa(csv_path):
    """Upsert interview Q&A with hash checking."""
    df = pd.read_csv(csv_path)
    vectors = []
    
    for idx, row in df.iterrows():
        question = str(row['Question']).strip()
        answer = str(row['Answer']).strip()
        category = "interview_qa"
        
        if not question or not answer or answer.lower() == "nan":
            continue
        
        combined_text = f"Q: {question}\nA: {answer}"
        current_hash = hashlib.md5(combined_text.encode()).hexdigest()
        record_id = f"qa_{idx}"
        
        # Check if exists with same hash
        existing_hash = get_existing_pinecone_hash(record_id)
        if existing_hash == current_hash:
            continue
        
        embedding = client.embeddings.create(
            input=[combined_text], 
            model="text-embedding-3-large"
        ).data[0].embedding
        
        metadata = {
            "category": category,
            "data_text": combined_text,
            "hash": current_hash
        }
        vectors.append({
            "id": record_id, 
            "values": embedding, 
            "metadata": metadata
        })

    if vectors:
        print(f"🔄 Upserting {len(vectors)} new/changed interview QAs")
        index.upsert(vectors)
        print(f"✅ {len(vectors)} QAs upserted. {len(df)-len(vectors)} unchanged.")
    else:
        print("✅ All QAs are up-to-date in Pinecone.")

if __name__ == "__main__":
    # Example usage:
    sync_all_data()
    # verify_pinecone_data()
    upsert_interview_qa("interview_questions_cleaned.csv")