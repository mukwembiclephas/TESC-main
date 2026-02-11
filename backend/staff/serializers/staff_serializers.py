from rest_framework import serializers
from ..models import Staff, Vacancy

class StaffSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    institution_type = serializers.CharField(source='institution.type', read_only=True)  # <-- NEW
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    full_name = serializers.CharField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Staff
        fields = [
            'id',
            'user',
            'institution',
            'institution_name',
            'institution_type',  # <-- NEW
            'faculty',
            'faculty_name',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'employee_id',
            'position',
            'department',
            'department_name',
            'qualification',
            'specialization',
            'date_joined',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'full_name', 'institution_name', 'institution_type']

    def validate_employee_id(self, value):
        qs = Staff.objects.filter(employee_id=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This Employee ID is already in use.")
        return value


class VacancySerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Vacancy
        fields = [
            'id', 
            'institution', 
            'institution_name',
            'title', 
            'faculty', 
            'faculty_name',
            'department', 
            'department_name',
            'quantity', 
            'deadline', 
            'description', 
            'status', 
            'created_at'
        ]
        read_only_fields = ['created_at', 'status']

    def create(self, validated_data):
        validated_data['status'] = 'Open'
        return super().create(validated_data)