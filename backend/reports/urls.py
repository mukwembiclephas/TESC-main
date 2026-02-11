from django.urls import path
from .views import GenerateReportView, DownloadReportView

urlpatterns = [
    path("generate/", GenerateReportView.as_view()),
    path("download/<uuid:report_id>/", DownloadReportView.as_view()),
]