# institutions/serializers.py (or in accounts/serializers.py)
from rest_framework import serializers
from ..models import Institution

class InstitutionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name']