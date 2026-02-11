from jsonschema import ValidationError
from rest_framework import viewsets, status, filters, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Count, Q, Sum, F, DecimalField
from django.db.models.functions import Coalesce
from collections import OrderedDict

from ..models import Student
from ..serializers.student_serializers import StudentSerializer
from ..services.student_services import StudentService
from ..services.analysis_services import AnalysisService

COLOR_MAP = {
    'Financial': '#f87171',
    'Academic': '#60a5fa',
    'Medical': '#34d399',
    'Personal': '#fbbf24',
    'Transfer': '#a78bfa',
    'Other': '#cbd5e1',
}
class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Students.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'student_id', 'national_id']
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        """
        Optimize queries and calculate financial balances in one database call.
        """
        queryset = Student.objects.select_related('institution', 'program')

        institution_param = self.request.query_params.get('institution')
        if institution_param:
            queryset = queryset.filter(institution_id=institution_param)

        program_id = self.request.query_params.get('program_id') or self.request.query_params.get('program')
        if program_id:
            queryset = queryset.filter(program_id=program_id)

        return queryset.annotate(
            semester_fee=Coalesce(
                F('program__semester_fee'),
                0,
                output_field=DecimalField()
            ),
            total_paid=Coalesce(
                Sum('payments__amount'),
                0,
                output_field=DecimalField()
            )
        )

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
        StudentService.create_student(serializer.validated_data)

    def perform_update(self, serializer):
        try:
            StudentService.update_student(serializer.instance, serializer.validated_data)
        except DjangoValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, 'message_dict') else str(e)
            )

    def destroy(self, _request, *args, **kwargs):
        instance = self.get_object()
        try:
            StudentService.delete_student(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='bulk_upload')
    def bulk_upload(self, request):
        file_obj = request.FILES.get('file')
        institution_id = request.data.get('institution_id')

        if not file_obj:
            return Response({"detail": "File is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not institution_id and hasattr(request.user, 'institution'):
            institution_id = request.user.institution.id

        try:
            count = StudentService.bulk_create_from_file(file_obj, institution_id)
            return Response(
                {"message": f"Successfully enrolled {count} students."},
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            error_data = {}
            if hasattr(e, 'message_dict') and e.message_dict:
                error_data = e.message_dict
            elif hasattr(e, 'messages'):
                error_data = {"detail": "Validation error", "errors": e.messages}
            else:
                error_data = {"detail": str(e)}
            return Response(error_data, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='graduation-stats')
    def graduation_stats(self, request):
        """
        Aggregates graduation statistics by Year and Program.
        """
        institution_id = request.query_params.get('institution_id')

        queryset = Student.objects.filter(
            institution_id=institution_id,
            status='Graduated'
        ).values('graduation_year', 'program__name', 'program__level').annotate(
            total_graduates=Count('id'),
            distinctions=Count('id', filter=Q(final_grade='Distinction')),
            credits=Count('id', filter=Q(final_grade='Credit')),
            passes=Count('id', filter=Q(final_grade='Pass'))
        ).order_by('-graduation_year')

        return Response(queryset)

    @action(detail=False, methods=['get'], url_path='special-stats')
    def special_stats(self, request):
        institution_id = request.query_params.get('institution_id')
        data = AnalysisService.get_special_enrollment_stats(institution_id)
        return Response(data)

    @action(detail=False, methods=['get'], url_path='financial-stats')
    def financial_stats(self, request):
        institution_id = request.query_params.get('institution_id')
        data = AnalysisService.get_financial_stats(institution_id)
        return Response(data)

    @action(detail=False, methods=['get'], url_path='dropout-stats')
    def dropout_stats(self, request):
        """
        Returns aggregated dropout statistics for stats cards and charts.
        """
        institution_id = request.query_params.get('institution_id')
        queryset = Student.objects.filter(status='Dropout')
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)

        reason_counts = queryset.values('dropout_reason').annotate(value=Count('id'))

        all_reasons = Student.DROPOUT_REASONS
        chart_data = []
        total_dropouts = 0

        for code, label in all_reasons:
            count_obj = next((x for x in reason_counts if x['dropout_reason'] == code), None)
            count = count_obj['value'] if count_obj else 0
            chart_data.append({
                "name": label,
                "value": count,
                "color": COLOR_MAP.get(code, "#cbd5e1")
            })
            total_dropouts += count

        primary_cause = max(chart_data, key=lambda x: x['value']) if chart_data else None

        return Response({
            "total_dropouts": total_dropouts,
            "chart_data": chart_data,
            "primary_cause": primary_cause['name'] if primary_cause else None
        })
