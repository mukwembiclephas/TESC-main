from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from ..models import Facility
from ..serializers.facility_serializers import FacilitySerializer
from ..services.facility_services import FacilityService

class FacilityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Institution Facilities.
    """
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'building', 'manager', 'description']

    def get_queryset(self):
        """
        Filter facilities by Institution or Type.
        """
        queryset = Facility.objects.select_related('institution')
        
        # Filter by Institution
        institution_id = self.request.query_params.get('institution_id')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)

        # Filter by Facility Type
        f_type = self.request.query_params.get('type')
        if f_type:
            queryset = queryset.filter(facility_type__iexact=f_type)
            
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
        FacilityService.create_facility(serializer.validated_data)

    def perform_update(self, serializer):
        try:
            FacilityService.update_facility(serializer.instance, serializer.validated_data)
        except DjangoValidationError as e:
            from rest_framework import serializers
            raise serializers.ValidationError({"detail": str(e)})

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            FacilityService.delete_facility(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)