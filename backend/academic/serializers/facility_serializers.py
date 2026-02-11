from rest_framework import serializers
from ..models import Facility

class FacilitySerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model = Facility
        fields = [
            'id',
            'institution',
            'institution_name',
            'name',
            'facility_type',
            'building',
            'capacity',
            'current_usage',
            'status',
            'description',
            'equipment',
            'manager',
            'contact_number',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']