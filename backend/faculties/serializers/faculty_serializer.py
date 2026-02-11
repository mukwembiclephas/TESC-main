from rest_framework import serializers
from ..models import Faculty


class FacultySerializer(serializers.ModelSerializer):
    # Read-only fields for frontend display
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    departments_count = serializers.IntegerField(source='departments.count', read_only=True)
    
    class Meta:
        model = Faculty
        fields = [
            'id', 
            'institution', 
            'institution_name',
            'name', 
            'dean', 
            'location', 
            'email', 
            'description', 
            'status',
            'departments_count', # Helpful for the dashboard card stats
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_name(self, value):
        """
        Check that the faculty name is unique within the specific institution.
        Note: This requires access to the institution from the initial data.
        """
        request = self.context.get('request')
        institution_id = self.initial_data.get('institution')
        
        # If this is an update, exclude current instance
        qs = Faculty.objects.filter(name__iexact=value, institution_id=institution_id)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
            
        if qs.exists():
            raise serializers.ValidationError("A faculty with this name already exists in this institution.")
        return value
    
