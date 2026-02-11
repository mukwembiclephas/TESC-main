from django.urls import path
from .views.auth_views import (
    InstitutionAdminLogin,
    UserProfileView
)
from rest_framework_simplejwt.views import TokenRefreshView



urlpatterns = [
    path("login/", InstitutionAdminLogin.as_view(), name="inst-admin-login"),
    path("profile/", UserProfileView.as_view(), name="inst-admin-profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="inst-token-refresh"),
]
