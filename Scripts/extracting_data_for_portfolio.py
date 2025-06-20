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
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.dialects.postgresql import insert
import hashlib
import os
from datetime import datetime

# Configuration
GSHEET_URL = os.getenv('GSHEET_URL', 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQMgTJZHoKjf1Rb6eQ4hzY-sfOZHJb6qxQTMZnvT7SYQ8IasB8NeA7fKetDVgLg0gxYiuTbd-FjXl9R/pub?output=xlsx')
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
    """Clean and prepare DataFrame"""
    # Convert date columns
    for col in date_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # Replace NaN with None for SQL
    return df.where(pd.notnull(df), None)

def upsert_data(engine, table, df, primary_keys):
    """Efficient upsert with hash comparison"""
    metadata = MetaData()
    metadata.reflect(bind=engine)
    table_obj = metadata.tables[table]
    
    stats = {'inserted': 0, 'updated': 0, 'skipped': 0}
    
    with engine.connect() as conn:
        for _, row in df.iterrows():
            row_dict = row.to_dict()
            row_hash = compute_row_hash(row_dict)
            row_dict['content_hash'] = row_hash
            
            # Check existing hash
            existing = conn.execute(
                table_obj.select().where(table_obj.c.id == row['id'])
            ).fetchone()
            
            if existing and existing.content_hash == row_hash:
                stats['skipped'] += 1
                continue
            
            stmt = insert(table_obj).values(**row_dict)
            stmt = stmt.on_conflict_do_update(
                index_elements=primary_keys,
                set_={k: v for k, v in row_dict.items() if k not in primary_keys}
            )
            conn.execute(stmt)
            stats['updated' if existing else 'inserted'] += 1
    
    return stats

def main():
    log_message("Starting data extraction from Google Sheets")
    
    try:
        # Load and prepare all datasets
        log_message("Loading data from Google Sheets")
        skills_df = pd.read_excel(GSHEET_URL, sheet_name='Sheet3')
        exp_df = pd.read_excel(GSHEET_URL, sheet_name='Sheet2')
        cert_df = pd.read_excel(GSHEET_URL, sheet_name='Sheet4')
        projects_df = pd.read_excel(GSHEET_URL, sheet_name='Sheet1')
        
        # Prepare data
        exp_df, _ = prepare_dataframe(exp_df, ['start_date', 'end_date'])
        cert_df, _ = prepare_dataframe(cert_df, ['issue_date', 'expiration_date'])
        
        # Database setup
        engine = create_engine(DATABASE_URL)
        
        # Process each table
        tables = {
            'skills': (skills_df, ['id']),
            'experience': (exp_df, ['id']),
            'certifications': (cert_df, ['id']),
            'projects': (projects_df, ['id'])
        }
        
        for table_name, (df, pks) in tables.items():
            log_message(f"Processing {table_name} table")
            stats = upsert_data(engine, table_name, df, pks)
            log_message(
                f"{table_name} stats: "
                f"{stats['inserted']} new, "
                f"{stats['updated']} updated, "
                f"{stats['skipped']} unchanged"
            )
            
    except Exception as e:
        log_message(f"❌ Error: {str(e)}")
        raise

if __name__ == "__main__":
    main()