from rest_framework import serializers
from ..models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    # Read-only fields for frontend display
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    institution_name = serializers.CharField(source='faculty.institution.name', read_only=True)

    class Meta:
        model = Department
        fields = [
            'id',
            'faculty',          # The ID (for writing)
            'faculty_name',     # The Name (for reading)
            'institution_name', # Context
            'name',
            'code',
            'head_of_department',
            'description',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_code(self, value):
        """
        Ensure department code is uppercase.
        """
        return value.upper()