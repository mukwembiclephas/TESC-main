from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Faculty

class FacultyService:
    @staticmethod
    def get_faculties_for_institution(institution_id):
        """
        Retrieve all faculties belonging to a specific institution.
        """
        return Faculty.objects.filter(institution_id=institution_id).select_related('institution')

    @staticmethod
    def create_faculty(data):
        """
        Create a new faculty.
        """
        # The 'data' dictionary already contains the 'institution' as a Model Object
        # (validated and converted by the Serializer).
        # We can pass it directly to create().
        with transaction.atomic():
            faculty = Faculty.objects.create(**data)
            return faculty

    @staticmethod
    def update_faculty(faculty_instance, data):
        """
        Update an existing faculty.
        """
        with transaction.atomic():
            for key, value in data.items():
                setattr(faculty_instance, key, value)
            faculty_instance.save()
            return faculty_instance

    @staticmethod
    def delete_faculty(faculty_instance):
        """
        Delete a faculty. 
        """
        # Prevent deletion if departments exist
        if faculty_instance.departments.exists():
             raise ValidationError("Cannot delete faculty that has active departments.")
        
        faculty_instance.delete()