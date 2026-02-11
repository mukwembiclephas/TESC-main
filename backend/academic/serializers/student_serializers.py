from rest_framework import serializers
from ..models import Student
from django.db.models import Sum

class StudentSerializer(serializers.ModelSerializer):
    # Read-only fields for frontend display
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    full_name = serializers.CharField(read_only=True)
    
    semester_fee = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    date_of_birth = serializers.DateField(
        input_formats=['%m/%d/%Y', '%Y-%m-%d', 'iso-8601'], 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = Student
        fields = [
            'id',
            'user', # Optional: link to Auth User
            'student_id',
            'national_id',
            'first_name',
            'last_name',
            'full_name',
            'gender',
            'date_of_birth',
            'enrollment_year',
            'status',
            "dropout_reason",
            'institution',
            'institution_name',
            'program',
            'program_name',
            'created_at',
            'updated_at',
            'is_iseop', 'is_work_for_fees', 'work_area', 
            'hours_pledged', 'disability_type','semester_fee' ,'total_paid'
        ]
        read_only_fields = ['created_at', 'updated_at', 'full_name']

    def validate_national_id(self, value):
        """
        Check if national ID is unique, excluding the current instance during updates.
        """
        qs = Student.objects.filter(national_id=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        
        if qs.exists():
            raise serializers.ValidationError("A student with this National ID already exists.")
        return value
    