from rest_framework import serializers
from ..models import Project

class InnovationSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'institution',
            'institution_name',
            'title',
            'category',
            'category_display',
            'team_name',
            'department',
            'problem_statement',
            'proposed_solution',
            'team_size',
            'timeline_months',
            'stage',
            'stage_display',
            'status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'status'] 
        # Note: status is read-only on creation usually, changed via specific admin actions