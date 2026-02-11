# academic/services/analysis_services.py
from django.db.models import Sum, Count
from ..models import Student, Payment, FeeStructure

class AnalysisService:
    @staticmethod
    def get_special_enrollment_stats(institution_id=None):
        # Build dynamic filter
        filters = {}
        if institution_id:
            filters['institution_id'] = institution_id
            
        students = Student.objects.filter(**filters)
        
        # Aggregate Data
        disability_data = students.exclude(disability_type='None').values('disability_type').annotate(
            value=Count('id')
        )
        
        work_data = students.filter(is_work_for_fees=True).values('work_area').annotate(
            students=Count('id'),
            hours=Sum('hours_pledged')
        )

        return {
            "special_students": list(disability_data),
            "work_for_fees": list(work_data),
            "counts": {
                "iseop": students.filter(is_iseop=True).count(),
                "work_for_fees": students.filter(is_work_for_fees=True).count(),
                "disabled": students.exclude(disability_type='None').count()
            }
        }

    @staticmethod
    def get_financial_stats(institution_id=None):
        filters = {}
        if institution_id:
            filters['institution_id'] = institution_id
            
        # 1. Total Collected (from all payments)
        total_collected = Payment.objects.filter(
            **({'student__institution_id': institution_id} if institution_id else {})
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # 2. Expected Revenue (ONLY for Active students, per semester)
        # We look at the semester_fee defined for the program each active student is in
        active_students = Student.objects.filter(status='Active', **filters)
        
        expected_semester_revenue = active_students.aggregate(
            total=Sum('program__fees__semester_fee')
        )['total'] or 0

        # 3. Stats Calculation
        compliance = (total_collected / expected_semester_revenue * 100) if expected_semester_revenue > 0 else 0

        return {
            "stats": {
                "totalCollectedYTD": total_collected,
                "totalPending": max(0, expected_semester_revenue - total_collected),
                "complianceRate": round(compliance, 1),
                "studentsWithPending": active_students.count() # Count of active students
            },
            "fee_structure": FeeStructure.objects.filter(
                **({'program__department__faculty__institution_id': institution_id} if institution_id else {})
            ).values('program_id', 'program__name', 'semester_fee')[:10]
        }