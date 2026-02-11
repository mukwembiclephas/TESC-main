# academic/services.py

from ..repositories.academic_repo import StudentRepository, InstitutionRepository, ProgramRepository, FacilityRepository
from rest_framework.exceptions import ValidationError

class StudentService:
    def __init__(self):
        # We inject the repository
        self.repository = StudentRepository()

    def get_all_students(self):
        return self.repository.get_all()

    def get_student_by_id(self, pk):
        return self.repository.get_by_id(pk)

    def create_student(self, data):
        """
        Business logic for creating a new student.
        """
        # --- Business Rule Example ---
        if self.repository.check_student_id_exists(data['student_id']):
            raise ValidationError(
                {'student_id': 'A student with this ID already exists.'}
            )
        
        # --- Business Rule Example ---
        if data.get('national_id'):
            if self.repository.get_by_national_id(data['national_id']):
                raise ValidationError(
                    {'national_id': 'This National ID is already registered.'}
                )
        
        # --- (Future) Business Logic ---
        # 1. Create the User account in your auth app
        #    user = user_service.create_user(email, first_name, last_name)
        # 2. Link the user to the student
        #    data['user'] = user
        # 3. Send a welcome email
        #    email_service.send_welcome_email(user.email)
        # -------------------------------
        
        # Call the repository to create the object
        student = self.repository.create_student(data)
        return student

# We can create services for other models as they get more complex
class InstitutionService:
    def __init__(self):
        self.repository = InstitutionRepository()

    def get_all_institutions(self):
        return self.repository.get_all()

class ProgramService:
    def __init__(self):
        self.repository = ProgramRepository()
    
    def get_programs_for_institution(self, institution_id):
        return self.repository.get_by_institution_id(institution_id)

class FacilityService:
    def __init__(self):
        self.repository = FacilityRepository()

    def get_all_facilities(self):
        return self.repository.get_all()