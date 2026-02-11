from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Sum, F, Q, DecimalField, ExpressionWrapper
from django.db.models.functions import TruncMonth, Coalesce
from academic.models import Student, Payment, FeeStructure
from faculties.models import Program
from datetime import datetime
from rest_framework.decorators import action

class FinancialAnalysisViewSet(viewsets.ViewSet):
    """
    Unified ViewSet for Global and Institutional Finance Analytics.
    """

    # 1. GLOBAL VIEW (Main System)
    def list(self, request):
        current_year = datetime.now().year
        
        # Targets: Only Active students
        active_students = Student.objects.filter(status='Active')
        
        # Explicitly cast to Decimal to avoid Float errors
        total_expected = active_students.aggregate(
            total=Coalesce(Sum('program__fees__semester_fee'), 0, output_field=DecimalField())
        )['total']
        
        total_collected = Payment.objects.filter(date_paid__year=current_year).aggregate(
            total=Coalesce(Sum('amount'), 0, output_field=DecimalField())
        )['total']

        # Monthly Trends
        monthly_payments = Payment.objects.filter(date_paid__year=current_year)\
            .annotate(month=TruncMonth('date_paid'))\
            .values('month')\
            .annotate(collected=Sum('amount'))\
            .order_by('month')

        payment_data = []
        for entry in monthly_payments:
            payment_data.append({
                "month": entry['month'].strftime('%b'),
                "Collected": float(entry['collected']),
                "Target": float(total_expected) / 6 
            })

        return Response({
            "stats": {
                "totalPending": float(total_expected - total_collected),
                "complianceRate": round((float(total_collected) / float(total_expected) * 100), 1) if total_expected > 0 else 0,
                "studentsWithPending": active_students.count(),
                "totalCollectedYTD": float(total_collected)
            },
            "fee_structure": list(FeeStructure.objects.values('program__name', 'semester_fee').order_by('-semester_fee')[:5]),
            "payment_data": payment_data,
            "top_pending": []
        })

    @action(detail=False, methods=['get'], url_path='dashboard-data')
    def get_institutional_data(self, request):
        inst_id = request.query_params.get('institution_id')
        if not inst_id:
            return Response({"detail": "institution_id required"}, status=400)

        # Base filter for active students
        active_students = Student.objects.filter(institution_id=inst_id, status='Active')
        
        # 1. Stats Calculations
        total_expected = active_students.aggregate(
            total=Coalesce(Sum('program__fees__semester_fee'), 0, output_field=DecimalField())
        )['total']
        
        total_collected = Payment.objects.filter(
            student__institution_id=inst_id
        ).aggregate(
            total=Coalesce(Sum('amount'), 0, output_field=DecimalField())
        )['total']

        # 2. Arrears Calculation
        top_pending_raw = active_students.annotate(
            paid=Coalesce(Sum('payments__amount'), 0, output_field=DecimalField()),
            fee=Coalesce(F('program__fees__semester_fee'), 0, output_field=DecimalField())
        ).annotate(
            balance=ExpressionWrapper(
                F('fee') - F('paid'),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
        ).filter(balance__gt=0).order_by('-balance')[:5]
        
        programs_list = Program.objects.filter(
            department__faculty__institution_id=inst_id
        ).values('id', 'name', 'semester_fee')

        # 3. Fee Structure - Robust lookup
        # This assumes: FeeStructure -> Program -> Department -> Faculty -> Institution
        # ADJUST THIS PATH based on your specific models if it fails
        fee_structure = [
    {
        "program_id": p['id'],
        "program__name": p['name'],
        "semester_fee": float(p['semester_fee'])
    } for p in programs_list
]

        return Response({
            "stats": {
                "totalCollectedYTD": float(total_collected),
                "totalPending": float(max(0, total_expected - total_collected)),
                "complianceRate": round((float(total_collected) / float(total_expected) * 100), 1) if total_expected > 0 else 0,
                "studentsWithPending": active_students.count()
            },
            "top_pending": [
                {"student_id": s.student_id, "full_name": s.full_name, "balance": float(s.balance)} 
                for s in top_pending_raw
            ],
            "fee_structure": list(fee_structure)
        })
        
        
    @action(detail=False, methods=['post'], url_path='update-program-fees')
    def update_program_fees(self, request):
        program_id = request.data.get('program_id')
        # We'll use 'semester_fee' from frontend but save it to 'annual_fee' logic
        # or rename the model field to semester_fee if you prefer.
        fee = request.data.get('semester_fee') 
        
        if not program_id:
            return Response({"detail": "program_id is required"}, status=400)

        try:
            # Directly update the Program model
            program = Program.objects.get(id=program_id)
            program.annual_fee = fee # Or program.semester_fee if you renamed it
            program.save()
            
            return Response({"status": "success", "message": f"Fee for {program.name} updated."})
        except Program.DoesNotExist:
            return Response({"detail": "Program not found"}, status=404)