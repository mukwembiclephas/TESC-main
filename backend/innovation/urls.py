from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.innovation_views import InnovationViewSet,dashboard_innovation_stats,detailed_project_tracking
from .views.projects_views import (
    InnovationHubViewSet, 
    ProjectViewSet, 
    ResearchGrantViewSet, 
    PartnershipViewSet
)

router = DefaultRouter()

router.register(r'innovations', InnovationViewSet, basename='innovation')
router.register(r'hubs', InnovationHubViewSet, basename='innovation-hubs')
router.register(r'projects', ProjectViewSet, basename='innovation-projects')
router.register(r'grants', ResearchGrantViewSet, basename='innovation-grants')
router.register(r'partnerships', PartnershipViewSet, basename='innovation-partnerships')

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/stats/", dashboard_innovation_stats, name="dashboard-innovation-stats"),
    path("dashboard/projects/", detailed_project_tracking, name="dashboard-detailed-projects"),
]

