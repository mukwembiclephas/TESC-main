import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from django.conf import settings

def generate_pdf_file(report_id, report_name, report_type, institution, date_from, date_to):
    directory = os.path.join(settings.MEDIA_ROOT, "reports")
    os.makedirs(directory, exist_ok=True)

    file_path = os.path.join(directory, f"{report_id}.pdf")

    c = canvas.Canvas(file_path, pagesize=A4)

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, 800, report_name)

    c.setFont("Helvetica", 12)
    c.drawString(50, 760, f"Report Type: {report_type}")
    c.drawString(50, 740, f"Institution: {institution}")
    c.drawString(50, 720, f"Date From: {date_from}")
    c.drawString(50, 700, f"Date To: {date_to}")

    c.drawString(50, 660, "This is a placeholder PDF. Add real content later.")

    c.showPage()
    c.save()

    return f"reports/{report_id}.pdf"