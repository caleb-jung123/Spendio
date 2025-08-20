from .settings import *
import os
from dotenv import load_dotenv

load_dotenv('.env.staging')

SECRET_KEY=os.getenv("DJANGO_SECRET_KEY")

DEBUG = True

ALLOWED_HOSTS = []
if os.getenv("STAGING_DOMAIN_NAME"):
    ALLOWED_HOSTS.append(os.getenv("STAGING_DOMAIN_NAME"))

CORS_ALLOWED_ORIGINS = []
if os.getenv("STAGING_DOMAIN_NAME"):
    CORS_ALLOWED_ORIGINS.extend([
        f"https://{os.getenv('STAGING_DOMAIN_NAME')}",
    ])

CSRF_TRUSTED_ORIGINS = []
if os.getenv("STAGING_DOMAIN_NAME"):
    CSRF_TRUSTED_ORIGINS.extend([
        f"https://{os.getenv('STAGING_DOMAIN_NAME')}",
    ])


