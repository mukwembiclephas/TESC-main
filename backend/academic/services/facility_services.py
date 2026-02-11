from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Facility

class FacilityService:
    @staticmethod
    def create_facility(validated_data):
        try:
            with transaction.atomic():
                facility = Facility.objects.create(**validated_data)
                return facility
        except Exception as e:
            raise ValidationError(f"Error creating facility: {str(e)}")

    @staticmethod
    def update_facility(instance, validated_data):
        try:
            with transaction.atomic():
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()
                return instance
        except Exception as e:
            raise ValidationError(f"Error updating facility: {str(e)}")

    @staticmethod
    def delete_facility(instance):
        try:
            instance.delete()
        except Exception as e:
            raise ValidationError(f"Error deleting facility: {str(e)}")