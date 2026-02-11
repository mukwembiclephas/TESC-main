from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FacultyViewSet, ProgramViewSet, DepartmentViewSet

router = DefaultRouter()
router.register(r'faculties', FacultyViewSet, basename='faculty')
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'departments', DepartmentViewSet, basename='departments')

urlpatterns = [
    path('', include(router.urls)),
]