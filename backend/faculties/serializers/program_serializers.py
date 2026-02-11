from rest_framework import serializers
from ..models import Program

class ProgramSerializer(serializers.ModelSerializer):
    # Helpful to see the faculty name in responses, not just the ID
    department_name = serializers.CharField(source='department.name', read_only=True)
    faculty_name = serializers.CharField(source='department.faculty.name', read_only=True)
    institution_name = serializers.CharField(source='department.faculty.institution.name', read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 
            'department', 
            'department_name',
            'faculty_name',     # Optional: Show faculty name via department
            'institution_name', # Optional: Show institution name via department
            'name', 
            'code', 
            'duration', 
            'level', 
            'description', 
            'coordinator', 
            'student_capacity', 
            'modules', 
            'entry_requirements', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_code(self, value):
        """
        Ensure code is uppercase for consistency.
        """
        return value.upper()