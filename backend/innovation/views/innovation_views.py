from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError

from innovation.models import Project, InnovationHub
from academic.models import Institution,Facility

from ..serializers.innovation_serializers import InnovationSerializer
from ..services.innovation_services import (
    InnovationService,
    InnovationAnalyticsService,
)
class InnovationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Innovations.
    """
    queryset = Project.objects.all()
    serializer_class = InnovationSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'team_name', 'sector']

    def get_queryset(self):
        """
        Filter innovations by Institution, Category, or Stage.
        """
        queryset = Project.objects.select_related('institution')
        
        # Filter by Institution
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)

        sector = self.request.query_params.get('sector')
        if sector:
            queryset = queryset.filter(sector=sector)

        stage = self.request.query_params.get('stage')
        if stage:
            queryset = queryset.filter(stage=stage)
            
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except DjangoValidationError as e:
             return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        InnovationService.create_innovation(serializer.validated_data)

    def perform_update(self, serializer):
        try:
            InnovationService.update_innovation(serializer.instance, serializer.validated_data)
        except DjangoValidationError as e:
            from rest_framework import serializers
            raise serializers.ValidationError({"detail": str(e)})

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            InnovationService.delete_innovation(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def dashboard_innovation_stats(request):
    data = {
        "total_projects": Project.objects.count(),
        "innovation_hubs":Facility.objects.filter(facility_type='Innovation').count(),  # matches FACILITY_TYPES
        "active_institutions": Institution.objects.filter(
            projects__isnull=False
        ).distinct().count(),

        "ideation": Project.objects.filter(stage='ideation').count(),
        "prototype": Project.objects.filter(stage='prototype').count(),
        "incubation": Project.objects.filter(stage='incubation').count(),
        "market_ready": Project.objects.filter(stage='market_ready').count(),
        "scaling": Project.objects.filter(stage='scaling').count(),
        "industrial": Project.objects.filter(stage='industrial').count(),
    }
    return Response(data)


@api_view(["GET"])
def detailed_project_tracking(request):
    """
    Returns detailed innovation project tracking for dashboard tables.
    """
    data = InnovationAnalyticsService.get_detailed_projects()
    return Response(data)

