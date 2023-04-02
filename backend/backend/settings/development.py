from .base import *

CORS_ORIGIN_WHITELIST = [
     'http://localhost:3000'
]

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# TODO: change to React URL
LOGIN_REDIRECT_URL = 'http://localhost:3000/'
LOGOUT_REDIRECT_UR = 'http://localhost:3000/'


CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:3000',
]
