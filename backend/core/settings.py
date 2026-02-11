from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SECURITY CONFIGURATION ---

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")

# Fernet encryption keys (used for encrypted model fields)
FERNET_KEYS = [
    "Sbqj2qYuOQb1dlXwTHOg-ze5a183HK4Cy0GORbTAPh0Y="
    ]

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True


ALLOWED_HOSTS = [
    'tesc.zchpc.ac.zw',
    '127.0.0.1',
    'localhost',
    'tesc-inst.zchpc.ac.zw',
    '10.50.200.35',   # ← FIXED: missing comma
]

# --- APPLICATION DEFINITION ---

INSTALLED_APPS = [
    'corsheaders',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_cryptography",
    

    # Third-party
    "rest_framework",
    'rest_framework_simplejwt',
    'django_filters',

    # Local Apps
    "users",
    "academic",
    'instauth',
    'faculties',
    "staff",
    "reports",
    "analysis",
    "innovation",
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# --- DATABASE ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# --- PASSWORD VALIDATION ---
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- DRF SETTINGS ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

# --- INTERNATIONALIZATION ---
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# --- STATIC FILES ---
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- AUTH MODEL ---
AUTH_USER_MODEL = 'users.CustomUser'

# --- CORS & CSRF CONFIGURATION ---

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8000",
    "http://127.0.0.1",
    "http://localhost:8081",
    "http://localhost",
    "https://tesc-inst.zchpc.ac.zw",
    "https://tesc.zchpc.ac.zw",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost",
    "http://127.0.0.1",
    "http://10.50.200.35",
    "https://tesc.zchpc.ac.zw",
    "https://tesc-inst.zchpc.ac.zw",
]
