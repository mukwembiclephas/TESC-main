from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.exceptions import ValidationError as DjangoValidationError

from .serializers.department_serializer import DepartmentSerializer

from .serializers.program_serializers import ProgramSerializer
from .services.program_services import ProgramService
from .models import Department, Faculty, Program
from .serializers.faculty_serializer import FacultySerializer
from .services.faculty_services import FacultyService

class FacultyViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing faculties.
    """
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

    def get_queryset(self):
        """
        Optionally restricts the returned faculties to a given institution.
        """
        # Removed .prefetch_related('departments') to prevent crash if model is missing
        queryset = Faculty.objects.select_related('institution')
        institution_id = self.request.query_params.get('institution')
        
        if institution_id is not None:
            queryset = queryset.filter(institution_id=institution_id)
            
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except DjangoValidationError as e:
             return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        FacultyService.create_faculty(serializer.validated_data)

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            FacultyService.delete_faculty(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, _request):
        total = self.get_queryset().count()
        active = self.get_queryset().filter(status='Active').count()
        return Response({
            "total_faculties": total,
            "active_faculties": active
        })
        
# faculties/views.py

class ProgramViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing programs.
    """
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

    def get_queryset(self):
        """
        Filter programs by Department, Faculty, or Institution.
        """
        # OPTIMIZATION: Updated select_related path
        # Old: 'faculty', 'faculty__institution'
        # New: 'department', 'department__faculty', 'department__faculty__institution'
        queryset = Program.objects.select_related(
            'department', 
            'department__faculty', 
            'department__faculty__institution'
        )
        
        # 1. Filter by Department (Direct link)
        department_id = self.request.query_params.get('department_id')
        if department_id:
            queryset = queryset.filter(department_id=department_id)

        # 2. Filter by Faculty (Through Department)
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            # FIX: Use department__faculty_id instead of faculty_id
            queryset = queryset.filter(department__faculty_id=faculty_id)
            
        # 3. Filter by Institution (Through Department -> Faculty)
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            # FIX: Use department__faculty__institution_id
            queryset = queryset.filter(department__faculty__institution_id=institution_id)
            
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except DjangoValidationError as e:
             return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        ProgramService.create_program(serializer.validated_data)

    def perform_update(self, serializer):
        ProgramService.update_program(serializer.instance, serializer.validated_data)

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            ProgramService.delete_program(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# faculties/views.py

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        # Optimize query
        queryset = Department.objects.select_related('faculty', 'faculty__institution')
        
        # 1. Filter by Faculty (existing)
        faculty_id = self.request.query_params.get('faculty')
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)

        # 2. Filter by Institution (NEW & CRITICAL)
        # This allows fetching "All departments in this institution"
        institution_id = self.request.query_params.get('institution')
        if institution_id:
            queryset = queryset.filter(faculty__institution_id=institution_id)
            
        return queryset
