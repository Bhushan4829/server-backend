import os
import psycopg2
import openai
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()
# Configure API keys and settings
openai.api_key = os.getenv("OPENAI_API_KEY")
pinecone_api = os.getenv("PINECONE_API_KEY")
pinecone_index = os.getenv("PINECONE_INDEX")  # e.g., "my-index"
# pinecone_env is not used directly in this new client version; details are managed via your API key/config
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# Create a Pinecone client instance
pc = Pinecone(api_key=pinecone_api)

# Check if the index exists; if not, create it.
existing_indexes = [idx.name for idx in pc.list_indexes()]
if pinecone_index not in existing_indexes:
    print(f"Index '{pinecone_index}' does not exist. Creating index...")
    pc.create_index(
        name=pinecone_index,
        dimension=3072,  # text-embedding-ada-002 embeddings have 1536 dimensions
        metric="cosine",  # or "euclidean", as desired
        spec=ServerlessSpec(cloud="aws", region="us-east-1")  # adjust as needed
    )

# Get the index object
index = pc.Index(pinecone_index)

def get_embedding(text):
    """
    Compute an embedding using OpenAI's embedding API.
    """
    response = client.embeddings.create(input=text, model="text-embedding-3-large")
    embedding = response.data[0].embedding
    return embedding

def sync_all_tables_to_pinecone():
    """
    Connect to PostgreSQL using DATABASE_URL, iterate over all tables in the public schema,
    extract text-based columns from each table, compute embeddings, and upsert them into Pinecone.
    """
    conn = None
    try:
        database_url = os.getenv("DATABASE_URL")  # e.g., postgresql://postgres:postgres@localhost:5432/portfolio_db
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Get list of all tables in the public schema.
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = cursor.fetchall()
        
        vectors = []
        for table in tables:
            table_name = table[0]
            print(f"Processing table: {table_name}")
            
            # Get the column names and types for this table.
            query_columns = """
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = %s
            """
            cursor.execute(query_columns, (table_name,))
            columns = cursor.fetchall()
            
            # Filter columns that are text-based.
            text_columns = [col[0] for col in columns if col[1] in ('text', 'character varying', 'varchar')]
            if not text_columns:
                print(f"Skipping table '{table_name}' as no text-based columns were found.")
                continue

            # Retrieve rows from the table. (You might want to add pagination for large tables.)
            query_rows = f"SELECT * FROM {table_name}"
            cursor.execute(query_rows)
            rows = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]

            for i, row in enumerate(rows):
                # Use the "id" column if present; otherwise, create a composite ID.
                record_id = row[colnames.index('id')] if 'id' in colnames else f"{table_name}_{i}"
                # Concatenate values from text columns.
                text_content = " ".join([str(row[colnames.index(col)]) for col in text_columns if row[colnames.index(col)] is not None])
                if not text_content.strip():
                    continue  # Skip empty text
                embedding = get_embedding(text_content)
                metadata = {"table": table_name, "data_text": text_content}
                vectors.append((str(record_id), embedding, metadata))
        
        if vectors:
            index.upsert(vectors=vectors)
            print(f"Upserted {len(vectors)} records into Pinecone.")
        else:
            print("No records found to sync.")
    except Exception as e:
        print("Error during sync:", e)
    finally:
        if conn:
            conn.close()
if __name__ == "__main__":
    sync_all_tables_to_pinecone()