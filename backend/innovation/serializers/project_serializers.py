from rest_framework import serializers
from ..models import InnovationHub, Project, ResearchGrant, Partnership
from academic.models import Institution

class InnovationHubSerializer(serializers.ModelSerializer):
    class Meta:
        model = InnovationHub
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    # Add read-only fields for display purposes
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)
    hub_name = serializers.CharField(source='hub.name', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'institution', 'hub', 'hub_name', 'name', 'team_name', 
            'sector', 'sector_display', 'location_category', 'stage', 
            'stage_display', 'problem_statement', 'proposed_solution', 
            'revenue_generated', 'funding_acquired', 'jobs_created', 
            'created_at', 'updated_at'
        ]

class ResearchGrantSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = ResearchGrant
        fields = ['id', 'institution', 'project', 'project_name', 'donor', 'amount', 'date_awarded']

class PartnershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partnership
        fields = '__all__'