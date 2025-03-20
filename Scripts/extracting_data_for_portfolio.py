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

import pandas as pd
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.dialects.postgresql import insert

# Load your Excel file
csv_file_exp = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQMgTJZHoKjf1Rb6eQ4hzY-sfOZHJb6qxQTMZnvT7SYQ8IasB8NeA7fKetDVgLg0gxYiuTbd-FjXl9R/pub?output=xlsx'
data_skills = pd.read_excel(csv_file_exp, sheet_name='Sheet3')
data_experience = pd.read_excel(csv_file_exp, sheet_name='Sheet2')
data_certifications = pd.read_excel(csv_file_exp, sheet_name='Sheet4')
data_projects = pd.read_excel(csv_file_exp, sheet_name='Sheet1')
print("Data Projects",data_projects)
print("Data Skills",data_skills)
print("Data Experience",data_experience)
print("Data Certifications",data_certifications)
# Convert 'NaT' to None for date columns in experience and certifications
data_experience['start_date'] = pd.to_datetime(data_experience['start_date'], errors='coerce')
data_experience['end_date'] = pd.to_datetime(data_experience['end_date'], errors='coerce')
data_certifications['issue_date'] = pd.to_datetime(data_certifications['issue_date'], errors='coerce')
data_certifications['expiration_date'] = pd.to_datetime(data_certifications['expiration_date'], errors='coerce')
print("Projects Columns",data_projects.columns)
# Database connection URL
database_url = "postgresql://postgres:postgres@localhost:5432/portfolio_db"
engine = create_engine(database_url)

# Reflect the existing tables from the database
metadata = MetaData()
metadata.reflect(bind=engine)

skills_table = metadata.tables['skills']
experience_table = metadata.tables['experience']
certifications_table = metadata.tables['certifications']
project_table = metadata.tables['projects']
def upsert_data(table, df, primary_keys):
    with engine.connect() as conn:
        transaction = conn.begin()  # Start transaction
        try:
            for index, row in df.iterrows():
                # Prepare data, setting NaT to None
                row_dict = {k: None if pd.isna(v) else v for k, v in row.items()}
                insert_stmt = insert(table).values(**row_dict)
                on_conflict_stmt = insert_stmt.on_conflict_do_update(
                    index_elements=primary_keys,
                    set_={k: v for k, v in row_dict.items() if k not in primary_keys}
                )
                conn.execute(on_conflict_stmt)
            transaction.commit()  # Commit transaction
        except Exception as e:
            print("Error during database operation:", e)
            transaction.rollback()  # Rollback in case of error


# Execute the upsert for each table
upsert_data(skills_table, data_skills, ['id'])
upsert_data(experience_table, data_experience, ['id'])
upsert_data(certifications_table, data_certifications, ['id'])
upsert_data(project_table, data_projects, ['id'])



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

