import os
from pathlib import Path
from dotenv import load_dotenv
import datetime

# 📦 Cargar variables desde .env
load_dotenv()

# 📂 Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# ⚙️ Configuración básica
SECRET_KEY = os.getenv("SECRET_KEY", "clave_insegura_dev")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# 🧩 Aplicaciones instaladas
INSTALLED_APPS = [
    "corsheaders",  # 👈 Importante: antes que Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "api",
    "eventos",
    "perfil",
]

# 🧱 Middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # 👈 Debe ir arriba de todo
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# 🌐 CORS configuración
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://72.60.154.196",
    "http://neoproyect.com",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = ["*"]

# 🚫 Evita redirecciones HTTPS forzadas (necesario si estás usando HTTP)
SECURE_SSL_REDIRECT = False

# ⚙️ Orígenes confiables CSRF
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://72.60.154.196",
    "http://neoproyect.com",
]

# 🧭 URLs
ROOT_URLCONF = "backend.urls"

# 🎨 Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# 🚀 WSGI
WSGI_APPLICATION = "backend.wsgi.application"

# 🗄️ Base de datos MySQL
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {"charset": "utf8mb4"},
    }
}

# 🖼️ Archivos estáticos y multimedia
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# 🔐 Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.BasicAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ]
}
JWT_AUTH = {
    'JWT_EXPIRATION_DELTA': datetime.timedelta(days=7),
    'JWT_ALGORITHM': 'HS256',
}