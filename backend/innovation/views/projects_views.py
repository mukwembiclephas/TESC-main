from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import InnovationHub, Project, ResearchGrant, Partnership
from ..serializers.project_serializers import (
    InnovationHubSerializer, 
    ProjectSerializer, 
    ResearchGrantSerializer, 
    PartnershipSerializer
)

class BaseInnovationViewSet(viewsets.ModelViewSet):
    """
    Base viewset that filters by 'institution_id' if provided in query params.
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    def get_queryset(self):
        queryset = super().get_queryset()
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            return queryset.filter(institution_id=institution_id)
        return queryset

class InnovationHubViewSet(BaseInnovationViewSet):
    queryset = InnovationHub.objects.all()
    serializer_class = InnovationHubSerializer

class ProjectViewSet(BaseInnovationViewSet):
    queryset = Project.objects.all().select_related('hub')
    serializer_class = ProjectSerializer
    search_fields = ['name', 'team_name', 'sector']
    filterset_fields = ['stage', 'sector']

class ResearchGrantViewSet(BaseInnovationViewSet):
    queryset = ResearchGrant.objects.all().select_related('project')
    serializer_class = ResearchGrantSerializer
    search_fields = ['donor', 'project__name']

class PartnershipViewSet(BaseInnovationViewSet):
    queryset = Partnership.objects.all()
    serializer_class = PartnershipSerializer
    search_fields = ['partner_name', 'focus_area']