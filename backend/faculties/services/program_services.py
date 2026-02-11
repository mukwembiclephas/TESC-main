from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Program

class ProgramService:
    @staticmethod
    def create_program(validated_data):
        """
        Creates a new Program instance.
        """
        try:
            with transaction.atomic():
                # Since validated_data comes from the serializer, foreign keys 
                # and data types are already checked.
                program = Program.objects.create(**validated_data)
                return program
        except Exception as e:
            # Re-raise as a Django ValidationError so the ViewSet catches it
            raise ValidationError(f"Error creating program: {str(e)}")

    @staticmethod
    def update_program(instance, validated_data):
        """
        Updates an existing Program instance.
        """
        try:
            with transaction.atomic():
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()
                return instance
        except Exception as e:
            raise ValidationError(f"Error updating program: {str(e)}")

    @staticmethod
    def delete_program(instance):
        """
        Deletes a Program instance.
        """
        try:
            # logic to check if students are enrolled could go here
            # e.g., if instance.students.exists(): raise ValidationError(...)
            
            instance.delete()
        except Exception as e:
            raise ValidationError(f"Error deleting program: {str(e)}")