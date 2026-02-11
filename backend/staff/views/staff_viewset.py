from django.db.models import Count
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser 
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.exceptions import ValidationError

from ..models import Staff
from ..serializers.staff_serializers import StaffSerializer
from ..services.staff_services import StaffService

# Optional Color Map for Charts
COLOR_MAP = {
    'Professor': '#1e293b',
    'Lecturer': '#3b82f6',
    'Assistant': '#10b981',
    'Admin': '#f59e0b',
    'Other': '#64748b',
}

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'employee_id', 'email'] 
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        """
        Filter staff by Institution and Faculty for data isolation.
        """
        queryset = Staff.objects.select_related('institution', 'faculty', 'department')
        
        institution_id = self.request.query_params.get('institution_id') or self.request.query_params.get('institution')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
            
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)

        status_param = self.request.query_params.get('status')
        if status_param:
            if status_param.lower() == 'active':
                queryset = queryset.filter(is_active=True)
            elif status_param.lower() == 'inactive':
                queryset = queryset.filter(is_active=False)
            
        return queryset

    @action(detail=False, methods=['get'], url_path='summary-stats')
    def summary_stats(self, request):
        """
        Returns aggregated staff statistics for dashboard cards and charts.
        """
        queryset = self.get_queryset()
        
        # 1. KPI Totals
        total_staff = queryset.count()
        active_staff = queryset.filter(is_active=True).count()
        inactive_staff = queryset.filter(is_active=False).count()

        # 2. Position Distribution (with Colors)
        position_counts = queryset.values('position').annotate(value=Count('id'))
        position_chart = []
        for item in position_counts:
            pos_key = item['position']
            position_chart.append({
                "name": pos_key,
                "value": item['value'],
                "color": COLOR_MAP.get(pos_key, "#cbd5e1")
            })

        # 3. Faculty Distribution (for Bar Charts)
        faculty_distribution = (
            queryset.values('faculty__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        faculty_chart = [
            {
                "name": item['faculty__name'] or "General/Admin",
                "value": item['count']
            } for item in faculty_distribution
        ]

        return Response({
            "kpis": {
                "total": total_staff,
                "active": active_staff,
                "inactive": inactive_staff,
                "active_rate": round((active_staff / total_staff * 100), 1) if total_staff > 0 else 0
            },
            "charts": {
                "positions": position_chart,
                "faculties": faculty_chart
            }
        })

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
        StaffService.create_staff(serializer.validated_data)

    def perform_update(self, serializer):
        StaffService.update_staff(serializer.instance, serializer.validated_data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            StaffService.delete_staff(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['post'], url_path='bulk_upload')
    def bulk_upload(self, request):
        file_obj = request.FILES.get('file')
        institution_id = request.data.get('institution_id')

        if not file_obj:
            return Response({"detail": "File is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not institution_id:
            if hasattr(request.user, 'institution'):
                institution_id = request.user.institution.id
            else:
                return Response({"detail": "Institution ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            count = StaffService.bulk_create_from_file(file_obj, institution_id)
            return Response(
                {"message": f"Successfully imported {count} staff members."}, 
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(e.message_dict if hasattr(e, 'message_dict') else {"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)