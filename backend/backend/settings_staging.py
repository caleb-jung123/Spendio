from .settings import *
import os

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']
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


