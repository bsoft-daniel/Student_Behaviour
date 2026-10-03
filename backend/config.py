import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'st_martins_flask_secret_key_2026_sec_matriculation_school')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'st_martins_jwt_super_secret_key_2026_sec_matriculation_school')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Database configuration
    # Connected to XAMPP MySQL / MariaDB (Database name: sbms)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://root:@127.0.0.1:3306/sbms'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    CORS_HEADERS = 'Content-Type'
    JSON_SORT_KEYS = False

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, '..', 'database', 'test_school.db')}"

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
