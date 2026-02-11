# academic/views.py
from django.db import transaction
from rest_framework import viewsets, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.db.models import Count
from ..models import Institution, Facility
from faculties.models import Program
from ..serializers.academic_serializers import (
    InstitutionSerializer, ProgramSerializer, FacilitySerializer,
    StudentWriteSerializer, StudentReadSerializer
)
from ..services.academic_services import (
     ProgramService, FacilityService, StudentService
)
from instauth.models import InstitutionAdmin
from users.models import CustomUser


class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    # simple enough not to need a service/repo layer, but we can use it
    # for consistency.
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = FacilityService()

    def get_queryset(self):
        return self.service.get_all_facilities()

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            # 1. Save the Institution first to get the ID and Name
            institution = serializer.save()

            email = getattr(institution, 'email', None) or self.request.data.get('email')

            if not email:
                raise serializers.ValidationError(
                    {"email": "An institutional email is required for registration."}
                )

            # 3. Check if a user with this email already exists
            if CustomUser.objects.filter(email=email).exists():
                raise serializers.ValidationError(
                    {"email": "A user with this email already exists."}
                )

            # 4. Create the User Account
            default_password = 'tesc@123'
            
            # We use the email as the username to ensure it's unique and matches the login flow
            user = CustomUser.objects.create_user(
                username=email, 
                email=email,
                password=default_password,
                first_name=institution.name,
                is_staff=True # Adjust permissions as needed
            )

            # 5. Link User to Institution via InstitutionAdmin
            InstitutionAdmin.objects.create(
                user=user,
                institution=institution
            )

            # 6. Store credentials to return them in the response
            self.admin_credentials = {
                "email": email,
                "password": default_password,
                "note": "Please change this password immediately on first login."
            }

    def create(self, request, *args, **kwargs):
        # We wrap the standard create logic to inject the credentials into the response
        try:
            response = super().create(request, *args, **kwargs)
            
            # If creds were generated successfully, add them to the response
            if hasattr(self, "admin_credentials"):
                response.data["admin_credentials"] = self.admin_credentials
                
            return response
            
        except serializers.ValidationError as e:
            # Pass validation errors (like duplicate email) straight to the frontend
            raise e
        except Exception as e:
            # Handle unexpected errors
            # print(e) # For debugging
            raise serializers.ValidationError(
                {"detail": "Failed to register institution. Please check the data and try again."}
            )
    def get_queryset(self):
        """
        Annotate institutions with staff count and program count.
        """
        return Institution.objects.annotate(
            program_count=Count('faculties__departments__programs', distinct=True),   
            student_count=Count('students', distinct=True),
            staff_count=Count('staff_members', distinct=True)
        )

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = ProgramService()
    
    # We can add custom actions to filter
    @action(detail=True, methods=['get'])
    def by_institution(self, request, pk=None):
        """
        Get all programs for a specific institution.
        URL: /api/institutions/<institution_pk>/programs/
        """
        # This logic is a bit wrong for a nested route,
        # Let's override get_queryset instead.
        pass

    def get_queryset(self):
        """
        Optionally filter programs by institution_id query param.
        e.g., /api/programs/?institution_id=1
        """
        queryset = super().get_queryset()
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            return self.service.get_programs_for_institution(institution_id)
        return queryset

class StudentViewSet(viewsets.ModelViewSet):
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = StudentService()

    def get_queryset(self):
        return self.service.get_all_students()

    def get_serializer_class(self):
        """
        Use StudentWriteSerializer for write actions (create, update)
        and StudentReadSerializer for read actions (list, retrieve).
        """
        if self.action in ['create', 'update', 'partial_update']:
            return StudentWriteSerializer
        return StudentReadSerializer

    def create(self, request, *args, **kwargs):
        """
        Override the default create method to use our service.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Pass validated data to the service
        try:
            student = self.service.create_student(serializer.validated_data)
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

        # Return the created object using the Read serializer
        read_serializer = StudentReadSerializer(student)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        # ... you would override update similarly,
        # calling a self.service.update_student(...) method
        return super().update(request, *args, **kwargs)