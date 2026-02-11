from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse, Http404

from .services import ReportService
from .models import GeneratedReport
from .serializers import GeneratedReportSerializer

class GenerateReportView(APIView):
    def post(self, request):
        report = ReportService.generate_report(request.data)
        serializer = GeneratedReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DownloadReportView(APIView):
    def get(self, request, report_id):
        try:
            report = GeneratedReport.objects.get(id=report_id)
        except GeneratedReport.DoesNotExist:
            raise Http404("Report not found")

        if not report.file:
            raise Http404("File missing")

        return FileResponse(open(report.file.path, "rb"), content_type='application/pdf')