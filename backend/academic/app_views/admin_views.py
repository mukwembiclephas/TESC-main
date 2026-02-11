from rest_framework import serializers, views
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from ..models import Institution, Student

from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils.timezone import now
from faculties.models import Program
from academic.models import FeeStructure
# --- SERIALIZERS ---

class InstitutionOverviewSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField(read_only=True)
    program_count = serializers.IntegerField(read_only=True)
    utilization = serializers.SerializerMethodField()

    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'type', 'location', 
            'capacity', 'status', 'student_count', 
            'program_count', 'utilization'
        ]

    def get_utilization(self, obj):
        if obj.capacity and obj.capacity > 0:
            return round((obj.student_count / obj.capacity) * 100, 1)
        return 0

# --- VIEWS ---

class DashboardStatsView(views.APIView):
    """
    Returns aggregated statistics for the top cards.
    """
    def get(self, request):
        current_year = timezone.now().year
        
        # 1. Key Metrics
        total_students = Student.objects.count()
        active_institutions = Institution.objects.filter(status='Active').count()
        
        # optimized count for graduates in current year
        graduates_current_year = Student.objects.filter(
            status='Graduated', 
            updated_at__year=current_year
        ).count()

        # Calculate Completion Rate (Simplified logic: Graduates / (Graduates + Dropouts/Failures))
        # For this example, we'll use a placeholder logic or real calculation if data permits
        # Assuming 'Active' + 'Graduated' base for now.
        total_outcomes = Student.objects.filter(status__in=['Graduated', 'Suspended']).count()
        completion_rate = 0
        if total_outcomes > 0:
            completion_rate = (Student.objects.filter(status='Graduated').count() / total_outcomes) * 100

        # 2. Institution Breakdown (Students per type)
        students_by_type = Student.objects.values('institution__type').annotate(
            count=Count('id')
        )
        
        breakdown = {item['institution__type']: item['count'] for item in students_by_type}

        data = {
            "total_students": total_students,
            "active_institutions": active_institutions,
            "graduates_year": graduates_current_year,
            "completion_rate": round(completion_rate, 1),
            "breakdown": {
                "teachers_colleges": breakdown.get('Teachers College', 0),
                "polytechnics": breakdown.get('Polytechnic', 0),
                "industrial_training": breakdown.get('Industrial Training', 0),
            }
        }
        return Response(data)

class EnrollmentTrendsView(views.APIView):
    """
    Returns enrollment data grouped by year and institution type for the chart.
    """
    def get(self, request):
        # Fetch last 5 years
        start_year = timezone.now().year - 5
        
        # Aggregate query: Group by Year AND Type
        data = Student.objects.filter(enrollment_year__gte=start_year).values(
            'enrollment_year', 'institution__type'
        ).annotate(count=Count('id')).order_by('enrollment_year')

        # Transform for Recharts: [{year: "2023", "Polytechnic": 120, ...}, ...]
        formatted_data = {}
        
        for entry in data:
            year = entry['enrollment_year']
            itype = entry['institution__type']
            count = entry['count']
            
            if year not in formatted_data:
                formatted_data[year] = {"year": str(year)}
            
            formatted_data[year][itype] = count

        return Response(list(formatted_data.values()))

class InstitutionOverviewView(views.APIView):
    """
    Returns list of institutions with calculated utilization.
    """
    def get(self, request):
        # Annotate counts in DB to avoid N+1 queries
        # student_count=Count('students', filter=Q(students__status='Active'))
        student_count=Student.objects.count()
        print(student_count)
        institutions = Institution.objects.annotate(
    student_count=Count(
        'students',
        filter=Q(students__status='Active'),
        distinct=True
    ),
    program_count=Count(
        'faculties__departments__programs',
        distinct=True
    )
).order_by('-student_count')[:10]


        print(institutions)

        serializer = InstitutionOverviewSerializer(institutions, many=True)
        return Response(serializer.data)