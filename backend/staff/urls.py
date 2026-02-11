from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.staff_viewset import StaffViewSet
from .views.vacancy_viewset import VacancyViewSet

router = DefaultRouter()
router.register(r'members', StaffViewSet, basename='staff')
router.register(r'vacancies', VacancyViewSet, basename='staff-vacancies') # <--- NEW

urlpatterns = [
    path('', include(router.urls)),
]