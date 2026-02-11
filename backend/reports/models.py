from django.db import models
import uuid

class GeneratedReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_type = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    date_generated = models.DateField(auto_now_add=True)
    created_by = models.CharField(max_length=100, default="Admin")
    file = models.FileField(upload_to="reports/", null=True, blank=True)

    def __str__(self):
        return self.name