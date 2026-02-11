from datetime import datetime
from .models import GeneratedReport
from .pdf_utils import generate_pdf_file

class ReportService:

    @staticmethod
    def generate_report(data: dict):
        report_type = data.get("report_type")
        institution = data.get("institution")
        date_from = data.get("date_from")
        date_to = data.get("date_to")

        # Create an entry in DB
        report_name = f"{report_type.upper()} Report - {datetime.today().strftime('%Y-%m-%d')}"
        
        report = GeneratedReport.objects.create(
            report_type=report_type,
            name=report_name,
            created_by="Admin"
        )

        # Generate PDF file
        file_path = generate_pdf_file(
            report_id=str(report.id),
            report_name=report_name,
            report_type=report_type,
            institution=institution,
            date_from=date_from,
            date_to=date_to
        )

        report.file = file_path
        report.save()

        return report