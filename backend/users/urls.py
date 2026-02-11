# accounts/urls.py
from django.urls import path, include
from .views.user_views import UserRegistrationView, UserProfileView
from .views.settings_views import RoleViewSet, DepartmentViewSet, UserViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter
from .serializers.auth_serializers import CustomTokenObtainPairSerializer

router = DefaultRouter()

router.register(r'roles', RoleViewSet, basename='role')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    # Signup
    path('register/', UserRegistrationView.as_view(), name='user_register'),

    # Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),

    # JWT Token Endpoints
    path('token/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'), # Login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
]