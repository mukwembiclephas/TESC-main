from rest_framework import viewsets, filters

from ..models import  Vacancy
from ..serializers.staff_serializers import  VacancySerializer
from ..services.staff_services import VacancyService


class VacancyViewSet(viewsets.ModelViewSet):
    queryset = Vacancy.objects.all()
    serializer_class = VacancySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'department', 'faculty']

    def get_queryset(self):
        """
        Filter vacancies by institution ID provided in query params.
        """
        queryset = Vacancy.objects.select_related('institution')
        
        # Filter by Institution
        institution_id = self.request.query_params.get('institution')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
            
        # Filter by Status (Optional)
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset

    def perform_create(self, serializer):
        VacancyService.create_vacancy(serializer.validated_data)