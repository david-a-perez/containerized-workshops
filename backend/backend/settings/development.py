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
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_UR = '/'
