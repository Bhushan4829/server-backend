import pandas as pd
from sqlalchemy import create_engine
# Path to the CSV file
# csv_file_path = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQMgTJZHoKjf1Rb6eQ4hzY-sfOZHJb6qxQTMZnvT7SYQ8IasB8NeA7fKetDVgLg0gxYiuTbd-FjXl9R/pub?gid=0&single=true&output=csv'
# data = pd.read_csv(csv_file_path)

# column_mapping = {
#     'Id': 'id',
#     'Title': 'title',
#     'Description': 'description',
#     'Technologies': 'technologies',
#     'Github_Link': 'github_link',
#     'Medium_Link': 'medium_link',
#     'Deployment_Link': 'deployment_link',
#     'Document_Link': 'document_link',
#     'Report_Link': 'report_link'
# }
# data.rename(columns=column_mapping, inplace=True)
# print(data.columns)
# # Replace the below string with your connection details
# # database_url = "postgresql://postgres:postgres@localhost:5432/portfolio_db"
# # engine = create_engine(database_url)

# # # Insert data into the database
# # data.to_sql('projects', con=engine, if_exists='append', index=False)
# from sqlalchemy import create_engine

# def upsert(engine, table_name, df, unique_columns):
#     """
#     Upsert rows from a DataFrame to a PostgreSQL table using raw SQL.

#     :param engine: SQLAlchemy engine object
#     :param table_name: Name of the table in the database
#     :param df: DataFrame containing the data to insert
#     :param unique_columns: List or string of column names that are used for identifying duplicate rows
#     """
#     # Create a list of columns
#     columns = ', '.join(df.columns)
#     # Create a list of values placeholders
#     values = ', '.join(['%s' for _ in df.columns])
#     # Create a list of columns for the ON CONFLICT clause
#     update_columns = ', '.join([f"{col} = EXCLUDED.{col}" for col in df.columns if col not in unique_columns])

#     # Create the SQL statement
#     sql = f"""
#     INSERT INTO {table_name} ({columns})
#     VALUES ({values})
#     ON CONFLICT ({unique_columns}) DO UPDATE SET
#     {update_columns};
#     """

#     # Execute the SQL statement
#     with engine.connect() as conn:
#         for _, row in df.iterrows():
#             conn.execute(sql, tuple(row))

# # Example usage
# database_url = "postgresql://postgres:postgres@localhost:5432/portfolio_db"
# engine = create_engine(database_url)

# # Assuming 'data' is your DataFrame and it includes 'id' as a unique identifier
# upsert(engine, 'projects', data, 'id')



# Experiende Table: https://docs.google.com/spreadsheets/d/e/2PACX-1vQMgTJZHoKjf1Rb6eQ4hzY-sfOZHJb6qxQTMZnvT7SYQ8IasB8NeA7fKetDVgLg0gxYiuTbd-FjXl9R/pubhtml

# Earlier code starts here
# import pandas as pd
# from sqlalchemy import create_engine, MetaData, Table
# from sqlalchemy.dialects.postgresql import insert
# import hashlib
# # Load your Excel file
# csv_file_exp = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQMgTJZHoKjf1Rb6eQ4hzY-sfOZHJb6qxQTMZnvT7SYQ8IasB8NeA7fKetDVgLg0gxYiuTbd-FjXl9R/pub?output=xlsx'
# data_skills = pd.read_excel(csv_file_exp, sheet_name='Sheet3')
# data_experience = pd.read_excel(csv_file_exp, sheet_name='Sheet2')
# data_certifications = pd.read_excel(csv_file_exp, sheet_name='Sheet4')
# data_projects = pd.read_excel(csv_file_exp, sheet_name='Sheet1')
# print("Data Projects",data_projects)
# print("Data Skills",data_skills)
# print("Data Experience",data_experience)
# print("Data Certifications",data_certifications)
# # Convert 'NaT' to None for date columns in experience and certifications
# data_experience['start_date'] = pd.to_datetime(data_experience['start_date'], errors='coerce')
# data_experience['end_date'] = pd.to_datetime(data_experience['end_date'], errors='coerce')
# data_certifications['issue_date'] = pd.to_datetime(data_certifications['issue_date'], errors='coerce')
# data_certifications['expiration_date'] = pd.to_datetime(data_certifications['expiration_date'], errors='coerce')
# print("Projects Columns",data_projects.columns)
# # Database connection URL
# database_url = "postgresql://postgres:flowexample@localhost:5432/portfolio_db"
# engine = create_engine(database_url)

# # Reflect the existing tables from the database
# metadata = MetaData()
# metadata.reflect(bind=engine)
# def compute_row_hash(row, exclude_keys=["id"]):
#     relevant_data = [str(v) for k, v in row.items() if k not in exclude_keys]
#     row_string = "|".join(relevant_data)
#     return hashlib.md5(row_string.encode()).hexdigest()
# skills_table = metadata.tables['skills']
# experience_table = metadata.tables['experience']
# certifications_table = metadata.tables['certifications']
# project_table = metadata.tables['projects']
# import hashlib

# def compute_row_hash(row, exclude_keys=["id"]):
#     relevant_data = [str(v) for k, v in row.items() if k not in exclude_keys]
#     row_string = "|".join(relevant_data)
#     return hashlib.md5(row_string.encode()).hexdigest()

# def upsert_data(table, df, primary_keys):
#     with engine.connect() as conn:
#         transaction = conn.begin()
#         try:
#             for index, row in df.iterrows():
#                 row_dict = {k: None if pd.isna(v) else v for k, v in row.items()}
#                 row_hash = compute_row_hash(row_dict)
#                 row_dict["content_hash"] = row_hash  # Add the hash to insert/update

#                 # Check existing hash
#                 id_val = row_dict['id']
#                 query = table.select().where(table.c.id == id_val)
#                 existing = conn.execute(query).fetchone()

#                 if existing and existing.get("content_hash") == row_hash:
#                     print(f"⏩ Skipping unchanged record ID={id_val}")
#                     continue

#                 insert_stmt = insert(table).values(**row_dict)
#                 on_conflict_stmt = insert_stmt.on_conflict_do_update(
#                     index_elements=primary_keys,
#                     set_={k: v for k, v in row_dict.items() if k not in primary_keys}
#                 )
#                 conn.execute(on_conflict_stmt)
#             transaction.commit()
#         except Exception as e:
#             print("❌ Error during database operation:", e)
#             transaction.rollback()



# # Execute the upsert for each table
# upsert_data(skills_table, data_skills, ['id'])
# upsert_data(experience_table, data_experience, ['id'])
# upsert_data(certifications_table, data_certifications, ['id'])
# upsert_data(project_table, data_projects, ['id'])

# Earlier Code ends here

# Example project data structure
# projects_info = [
#     {
#         'title': 'GDP Prediction using XGBoost',
#         'github_link': 'https://github.com/Bhushan4829/GDP_Prediction_using_xgboost',
#         'medium_links': [],
#         'deployment_link': 'https://gdp-prediction-app.onrender.com/',
#         'report_link': 'D:/MS/project_report/GDP_Prediction_using_XgBoost.pdf'
#     }
#     {
        
#         'title': 'MedilinkAI- An AI powered healthcare Portal',
#         'github_link': 'https://github.com/Bhushan4829/GDP_Prediction_using_xgboost',
#         'medium_links': [],
#         'deployment_link': 'https://gdp-prediction-app.onrender.com/',
#         'report_link': 'D:/MS/project_report/GDP_Prediction_using_XgBoost.pdf'
#     }
# ]

# New code:
import pandas as pd
from sqlalchemy import create_engine, MetaData, Table, text
from sqlalchemy.dialects.postgresql import insert
import hashlib
import os
from datetime import datetime
from sqlalchemy import Integer
from dotenv import load_dotenv
import numpy as np
load_dotenv()

# Configuration
GSHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQMgTJZHoKjf1Rb6eQ4hzY-sfOZHJb6qxQTMZnvT7SYQ8IasB8NeA7fKetDVgLg0gxYiuTbd-FjXl9R/pub?output=xlsx"
DATABASE_URL = os.getenv('DATABASE_URL')

def get_timestamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def log_message(message):
    print(f"[{get_timestamp()}] {message}")

def compute_row_hash(row, exclude_keys=["id"]):
    """Generate consistent hash from row data"""
    relevant_data = [str(v) for k, v in row.items() if k not in exclude_keys and pd.notna(v)]
    return hashlib.md5("|".join(relevant_data).encode()).hexdigest()

def prepare_dataframe(df, date_columns=[]):
    """Clean DataFrame with proper NULL handling for dates"""
    # Convert date columns
    for col in date_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # Replace all NA-like values with None (SQL NULL)
    df = df.replace([pd.NaT, pd.NA, np.nan], None)
    
    return df

def upsert_data(engine, table, df, primary_keys):
    """Type-aware upsert with robust NULL handling and proper transaction management"""
    metadata = MetaData()
    metadata.reflect(bind=engine)
    table_obj = metadata.tables[table]
    
    stats = {'inserted': 0, 'updated': 0, 'skipped': 0}
    
    # Use transaction with proper commit
    with engine.begin() as conn:  # This automatically commits on success
        for _, row in df.iterrows():
            # Convert row to dict with proper NULL handling
            row_dict = {
                k: None if pd.isna(v) else v 
                for k, v in row.to_dict().items()
            }
            
            # Special handling for IDs
            if 'id' in row_dict:
                if isinstance(table_obj.c.id.type, Integer):
                    try:
                        row_dict['id'] = int(float(row_dict['id'])) if row_dict['id'] else None
                    except (ValueError, TypeError):
                        log_message(f"⚠️ Invalid ID for {table}: {row_dict['id']}")
                        continue
                else:
                    row_dict['id'] = str(row_dict['id']) if row_dict['id'] else None
            
            # Skip if ID is invalid
            if row_dict.get('id') is None:
                log_message(f"⚠️ Skipping row with NULL ID in {table}")
                continue
                
            row_hash = compute_row_hash(row_dict)
            row_dict['content_hash'] = row_hash
            
            # Check existing record
            existing = conn.execute(
                table_obj.select().where(table_obj.c.id == row_dict['id'])
            ).fetchone()
            
            if existing and existing.content_hash == row_hash:
                stats['skipped'] += 1
                continue
                
            # Prepare upsert
            try:
                stmt = insert(table_obj).values(**row_dict)
                stmt = stmt.on_conflict_do_update(
                    index_elements=primary_keys,
                    set_={k: v for k, v in row_dict.items() if k not in primary_keys}
                )
                result = conn.execute(stmt)
                stats['updated' if existing else 'inserted'] += 1
                log_message(f"✅ Successfully upserted {table} ID {row_dict['id']}")
            except Exception as e:
                log_message(f"⚠️ Failed to upsert {table} ID {row_dict['id']}: {str(e)}")
                continue
    
    return stats

def verify_data_insertion(engine, table_name):
    """Verify that data was actually inserted"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            count = result.fetchone()[0]
            log_message(f"✅ Verified: {table_name} table has {count} rows")
            return count
    except Exception as e:
        log_message(f"❌ Failed to verify {table_name}: {str(e)}")
        return 0

def main():
    log_message("Starting data extraction from Google Sheets")
    
    try:
        # Test database connection first
        log_message("Testing database connection...")
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            log_message("✅ Database connection successful")
        
        # Load data with type hints
        log_message("Loading data from Google Sheets")
        skills_df = pd.read_excel(GSHEET_URL, sheet_name='Sheet3', dtype={'id': str})
        exp_df = pd.read_excel(GSHEET_URL, sheet_name='Sheet2')
        cert_df = pd.read_excel(GSHEET_URL, sheet_name='Sheet4')
        projects_df = pd.read_excel(GSHEET_URL, sheet_name='Sheet1')
        
        log_message(f"Loaded data - Skills: {len(skills_df)}, Experience: {len(exp_df)}, Certifications: {len(cert_df)}, Projects: {len(projects_df)}")
        
        # Prepare data with proper NULL handling
        exp_df = prepare_dataframe(exp_df, ['start_date', 'end_date'])
        cert_df = prepare_dataframe(cert_df, ['issue_date', 'expiration_date'])
        projects_df = prepare_dataframe(projects_df)
        skills_df = prepare_dataframe(skills_df)
        
        # Process tables with type awareness
        tables = {
            'skills': (skills_df, ['id']),
            'experience': (exp_df, ['id']),
            'certifications': (cert_df, ['id']),
            'projects': (projects_df, ['id'])
        }
        
        for table_name, (df, pks) in tables.items():
            log_message(f"Processing {table_name} table ({len(df)} rows)")
            stats = upsert_data(engine, table_name, df, pks)
            log_message(
                f"{table_name} results: "
                f"{stats['inserted']} inserted, "
                f"{stats['updated']} updated, "
                f"{stats['skipped']} unchanged"
            )
            
            # Verify insertion
            verify_data_insertion(engine, table_name)
            
        log_message("✅ Data extraction completed successfully")
            
    except Exception as e:
        log_message(f"❌ Critical error: {str(e)}")
        import traceback
        log_message(f"Full traceback: {traceback.format_exc()}")
        raise

if __name__ == "__main__":
    main()