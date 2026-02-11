# academic/repositories.py

from ..models import Student, Institution,  Facility
from django.db import transaction
from faculties.models import Program

class BaseRepository:
    """
    A base repository for common query methods.
    """
    def __init__(self, model):
        self.model = model

    def get_all(self):
        return self.model.objects.all()

    def get_by_id(self, pk):
        try:
            return self.model.objects.get(pk=pk)
        except self.model.DoesNotExist:
            return None

class InstitutionRepository(BaseRepository):
    def __init__(self):
        super().__init__(Institution)

class ProgramRepository(BaseRepository):
    def __init__(self):
        super().__init__(Program)
    
    def get_by_institution_id(self, institution_id):
        return self.model.objects.filter(institution_id=institution_id)

class FacilityRepository(BaseRepository):
    def __init__(self):
        super().__init__(Facility)

class StudentRepository(BaseRepository):
    def __init__(self):
        super().__init__(Student)
    
    def get_by_national_id(self, national_id):
        return self.model.objects.filter(national_id=national_id).first()
    
    def check_student_id_exists(self, student_id):
        return self.model.objects.filter(student_id=student_id).exists()
    
    @transaction.atomic
    def create_student(self, data):
        """
        Creates a new student instance.
        'data' is a dictionary of validated serializer data.
        """
        # We pop related fields to handle them explicitly
        institution = data.pop('institution')
        program = data.pop('program')
        
        student = self.model.objects.create(
            institution=institution,
            program=program,
            **data
        )
        return student