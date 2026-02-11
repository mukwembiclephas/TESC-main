# analysis/views.py
from django.db.models import Count

from rest_framework.views import APIView
from rest_framework.response import Response
from academic.models import Student
from datetime import datetime

class AdmissionsAnalysisView(APIView):
    """
    Endpoint: /api/analysis/admissions-stats/
    Analyzes student enrollments (Admissions).
    """
    def get(self, request):
        current_year = datetime.now().year
        
        # 1. Base Query: All Active Students (Enrolled)
        qs = Student.objects.all()

        # 2. Key Metrics
        total_students = qs.count()
        new_intake = qs.filter(enrollment_year=current_year).count()
        last_year_intake = qs.filter(enrollment_year=current_year - 1).count()
        
        # Growth Calculation
        growth = 0
        if last_year_intake > 0:
            growth = ((new_intake - last_year_intake) / last_year_intake) * 100

        # 3. Enrollment Trend (Last 5 Years)
        # Groups students by enrollment_year
        trend_data = qs.values('enrollment_year')\
                       .annotate(count=Count('id'))\
                       .order_by('enrollment_year')\
                       .filter(enrollment_year__gte=current_year-4)

        # 4. Gender Distribution (Current Intake)
        gender_stats = qs.filter(enrollment_year=current_year)\
                         .values('gender')\
                         .annotate(value=Count('id'))
        
        # 5. Top Programs (Current Intake)
        top_programs = qs.filter(enrollment_year=current_year)\
                         .values('program__name')\
                         .annotate(count=Count('id'))\
                         .order_by('-count')[:5]

        # 6. Recent Admissions Table
        recent_admissions = qs.filter(enrollment_year=current_year)\
                              .select_related('program', 'institution')\
                              .order_by('-created_at')[:10]

        formatted_recent = []
        for s in recent_admissions:
            formatted_recent.append({
                "id": s.student_id,
                "name": f"{s.first_name} {s.last_name}",
                "program": s.program.name if s.program else "N/A",
                "date": s.created_at.date(),
                "status": s.status
            })

        return Response({
            "stats": {
                "total_enrolled": total_students,
                "current_intake": new_intake,
                "growth_rate": round(growth, 1),
                "male_ratio": 0 # Calculated below if needed, or handled by charts
            },
            "trend": list(trend_data),
            "gender_distribution": list(gender_stats),
            "top_programs": list(top_programs),
            "recent_admissions": formatted_recent
        })