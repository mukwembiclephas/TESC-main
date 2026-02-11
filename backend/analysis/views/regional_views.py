# analysis/views.py
from django.db.models import Count, F
from rest_framework.views import APIView
from rest_framework.response import Response
from academic.models import Institution, Student
from django.db import models

class RegionalAnalysisView(APIView):
    def get(self, request):
        # 1. Get ALL institutions and their specific locations
        # We group by ID to ensure every single institution is a unique row
        institutions = Institution.objects.annotate(
            student_count=Count('students'), # Assumes 'students' is the related_name in Student model
            hubs_count=Count('id', filter=models.Q(has_innovation_hub=True))
        ).values(
            'name', 
            'province', 
            'location', 
            'student_count', 
            'has_innovation_hub'
        ).order_by('-student_count')

        chart_data = []
        total_students = 0
        provinces_set = set()

        for inst in institutions:
            chart_data.append({
                "province": inst['province'],
                "location": inst['location'] or "Unknown",
                "institution_name": inst['name'],
                "students": inst['student_count'],
                "institutions": 1,
                "hubs": 1 if inst['has_innovation_hub'] else 0
            })
            total_students += inst['student_count']
            provinces_set.add(inst['province'])

        # 2. Calculate Top Enrollment Location
        top_loc = chart_data[0]['location'] if chart_data else "N/A"

        return Response({
            "stats": {
                "provinces_covered": len(provinces_set),
                "top_enrollment": top_loc,
                "total_enrollment": total_students,
                "total_institutions": institutions.count(),
            },
            "chart_data": chart_data
        })