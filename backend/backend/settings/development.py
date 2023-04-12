from .base import *

CORS_ORIGIN_WHITELIST = [
     'http://localhost:3000'
]

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-j8$(6rrh6o*psdda(21-hpqqq#x3a3zp@26n4q_b1)h$icgtw+'

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
