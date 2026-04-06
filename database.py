import pymysql
import os
from dotenv import load_dotenv

# ABSOLUTE PATH FIX
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, "db", ".env")

print("Loading ENV from:", env_path)

load_dotenv(env_path)

# DEBUG PRINTS
print("DB_HOST:", os.getenv("DB_HOST"))
print("DB_PORT:", os.getenv("DB_PORT"))
print("DB_USER:", os.getenv("DB_USER"))
print("DB_PASSWORD exists:", bool(os.getenv("DB_PASSWORD")))
print("DB_NAME:", os.getenv("DB_NAME"))

def get_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        cursorclass=pymysql.cursors.DictCursor
    )
