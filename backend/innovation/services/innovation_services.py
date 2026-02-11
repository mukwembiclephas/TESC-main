from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Project
from ..models import InnovationHub
from django.db.models import Count
from academic.models import Facility, Institution

class InnovationService:
    @staticmethod
    def create_innovation(validated_data):
        try:
            with transaction.atomic():
                innovation = Project.objects.create(**validated_data)
                return innovation
        except Exception as e:
            raise ValidationError(f"Error creating innovation: {str(e)}")

    @staticmethod
    def update_innovation(instance, validated_data):
        try:
            with transaction.atomic():
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()
                return instance
        except Exception as e:
            raise ValidationError(f"Error updating innovation: {str(e)}")

    @staticmethod
    def delete_innovation(instance):
        try:
            instance.delete()
        except Exception as e:
            raise ValidationError(f"Error deleting innovation: {str(e)}")
        
class InnovationAnalyticsService:
    @staticmethod
    def get_innovation_stats():
        return {
            "active_institutions": Institution.objects.filter(
                projects__isnull=False
            ).distinct().count(),

            "total_innovations": Project.objects.count(),

            "innovation_hubs": InnovationHub.objects.count(),

            "market_ready_projects": Project.objects.filter(
                stage="market_ready"
            ).count(),
        }

    @staticmethod
    def get_detailed_projects():
        projects = Project.objects.select_related("institution").all().order_by("created_at")

        data = []
        for index, project in enumerate(projects, start=1):
            data.append({
                "id": f"IN{str(index).zfill(3)}",
                "name": project.name,
                "institution": project.institution.name,
                "stage": project.get_stage_display(),
                "status": getattr(project, "status", "N/A"),  # add if your Project model has a status
            })
        return data

