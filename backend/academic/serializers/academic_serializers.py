# academic/serializers.py

from rest_framework import serializers
from ..models import Institution, Facility, Student
from faculties.models import Program

class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = ['id', 'name']

class InstitutionSerializer(serializers.ModelSerializer):
    # For reading, show nested facility objects
    facilities = FacilitySerializer(many=True, read_only=True)
    
    # For writing, accept a list of facility IDs
    facility_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    # Add these two lines
    program_count = serializers.IntegerField(read_only=True)
    student_count = serializers.IntegerField(read_only=True)
    staff_count = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'type', 'location', 'address', 'capacity', 
            'staff', 'status', 'established', 'facilities', 'facility_ids','student_count', 'program_count','staff_count', 
        ]
    def get_staff_count(self, obj):
        return obj.staff_members.count()  # Related name from Staff model
    def create(self, validated_data):
        facility_ids = validated_data.pop('facility_ids', [])
        institution = Institution.objects.create(**validated_data)
        if facility_ids:
            institution.facilities.set(facility_ids)
        return institution

    def update(self, instance, validated_data):
        facility_ids = validated_data.pop('facility_ids', None)
        instance = super().update(instance, validated_data)
        if facility_ids is not None:
            instance.facilities.set(facility_ids)
        return instance

class ProgramSerializer(serializers.ModelSerializer):
    # On read, show the institution's name
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    
    class Meta:
        model = Program
        fields = [
            'id', 'name', 'level', 'institution', 'institution_name'
        ]
        # 'institution' is write-only, 'institution_name' is read-only
        extra_kwargs = {
            'institution': {'write_only': True}
        }

# --- Student Serializers (Read/Write Pattern) ---

class StudentWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating students.
    Accepts primary keys for relations.
    """
    class Meta:
        model = Student
        fields = [
            'student_id', 'national_id', 'first_name', 'last_name', 
            'gender', 'date_of_birth', 'enrollment_year', 'status',
            'institution', 'program'
        ]
        # You could add validation here, e.g., to ensure program
        # belongs to the selected institution.

class StudentReadSerializer(serializers.ModelSerializer):
    """
    Serializer for reading student data.
    Shows nested/string representations for relations.
    """
    institution = serializers.StringRelatedField()
    program = serializers.StringRelatedField()
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'national_id', 'full_name', 'first_name', 'last_name',
            'gender', 'date_of_birth', 'enrollment_year', 'status',
            'institution', 'program', 'created_at'
        ]