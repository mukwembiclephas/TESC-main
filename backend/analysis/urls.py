from django.urls import path, include
from .views.students_views import DropoutAnalysisView
from .views.financial_views import FinancialAnalysisViewSet
from .views.regional_views import RegionalAnalysisView
from .views.innovations_views import HubAnalysisView, StartupAnalysisView, IndustrialAnalysisView, InnovationOverviewView
from .views.admissions_views import AdmissionsAnalysisView
from .stats_views import dashboard_stats,student_distribution,enrollment_trends,student_teacher_ratio
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'finance', FinancialAnalysisViewSet, basename='finance-analysis')


urlpatterns = [
    # This results in: /api/analysis/dropout-analysis/
    path('dropout-analysis/', DropoutAnalysisView.as_view(), name='dropout-analysis'),
    path('regional-stats/', RegionalAnalysisView.as_view(), name='regional-stats'),
    path('hubs/', HubAnalysisView.as_view()),
    path('startups/', StartupAnalysisView.as_view()),
    path('industrial/', IndustrialAnalysisView.as_view()),
    path('innovation-overview/', InnovationOverviewView.as_view(), name='innovation-overview'),
    path('admissions-stats/', AdmissionsAnalysisView.as_view(), name='admissions-stats'),
       path("dashboard/", dashboard_stats, name="dashboard_stats"),
    path("student-distribution/", student_distribution, name="student_distribution"),
    path("dashboard/enrollment-trends/", enrollment_trends, name="enrollment-trends"),
    path("student-teacher-ratio/", student_teacher_ratio, name="student_teacher_ratio"),
path('', include(router.urls)),

]
