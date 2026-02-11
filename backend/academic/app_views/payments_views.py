# academic/views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from decimal import Decimal

from django.db.models import Sum, F
from django.db.models.functions import TruncMonth
from django.utils.timezone import now

from ..models import Payment, Student
from academic.models import FeeStructure
from faculties.models import Program


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    # serializer_class = PaymentSerializer

    # ------------------------------------------------------------------
    # RECORD PAYMENT
    # ------------------------------------------------------------------
    @action(detail=False, methods=['post'], url_path='record-payment')
    def record_payment(self, request):
        student_id = request.data.get('student_id')
        amount_val = request.data.get('amount')
        date_paid = request.data.get('date_paid')
        reference = request.data.get('reference', '')

        if not all([student_id, amount_val, date_paid]):
            return Response({"detail": "Missing required fields."}, status=400)

        try:
            amount = Decimal(str(amount_val))
            if amount <= 0:
                return Response(
                    {"detail": "Amount must be greater than zero."},
                    status=400
                )
        except Exception:
            return Response({"detail": "Invalid amount format."}, status=400)

        try:
            student = Student.objects.get(student_id=student_id)

            payment = Payment.objects.create(
                student=student,
                amount=amount,
                date_paid=date_paid,
                reference=reference
            )

            return Response(
                {
                    "status": "success",
                    "message": f"Payment of ${amount} recorded for {student.full_name}",
                    "payment_id": payment.id
                },
                status=status.HTTP_201_CREATED
            )

        except Student.DoesNotExist:
            return Response(
                {"detail": f"Student with ID {student_id} not found."},
                status=404
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=500)

    # ------------------------------------------------------------------
    # RECENT ACTIVITY
    # ------------------------------------------------------------------
    @action(detail=False, methods=['get'], url_path='recent-activity')
    def recent_activity(self, request):
        inst_id = request.query_params.get('institution_id')
        if not inst_id:
            return Response({"detail": "Institution ID required"}, status=400)

        payments = (
            Payment.objects
            .filter(student__institution_id=inst_id)
            .order_by('-created_at')[:10]
        )

        data = [
            {
                "id": p.id,
                "student_name": p.student.full_name,
                "student_id": p.student.student_id,
                "amount": float(p.amount),
                "date": p.date_paid,
                "ref": p.reference
            }
            for p in payments
        ]

        return Response(data)

    # ------------------------------------------------------------------
    # UPDATE PROGRAM FEES
    # ------------------------------------------------------------------
    @action(detail=False, methods=['post'], url_path='update-program-fees')
    def update_program_fees(self, request):
        program_id = request.data.get('program_id')
        new_fee = request.data.get('semester_fee')

        if not program_id:
            return Response({"detail": "program_id is required"}, status=400)

        try:
            program = Program.objects.get(id=program_id)

            fee, _ = FeeStructure.objects.get_or_create(program=program)
            fee.semester_fee = new_fee
            fee.save()

            return Response(
                {
                    "status": "success",
                    "message": f"Updated {program.name} to {new_fee}"
                },
                status=status.HTTP_200_OK
            )

        except Program.DoesNotExist:
            return Response({"detail": "Program not found"}, status=404)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)

    # ------------------------------------------------------------------
    # FINANCE DASHBOARD (CORRECTED ANALYTICS)
    # ------------------------------------------------------------------
    @action(detail=False, methods=['get'], url_path='finance')
    def finance_dashboard(self, request):
        year = now().year

        # -------------------------------------------------
        # TOTAL COLLECTED (YTD)
        # -------------------------------------------------
        total_collected = (
            Payment.objects
            .filter(date_paid__year=year)
            .aggregate(total=Sum('amount'))['total'] or Decimal('0')
        )

        # -------------------------------------------------
        # EXPECTED FEES (ALL STUDENTS)
        # -------------------------------------------------
        students = Student.objects.select_related('program')

        total_expected = Decimal('0')
        students_with_pending = 0

        for student in students:
            if not student.program or not student.program.semester_fee:
                continue

            expected = student.program.semester_fee * 2  # annual
            paid = (
                Payment.objects
                .filter(student=student, date_paid__year=year)
                .aggregate(total=Sum('amount'))['total'] or Decimal('0')
            )

            total_expected += expected

            if paid < expected:
                students_with_pending += 1

        total_pending = total_expected - total_collected

        # -------------------------------------------------
        # COMPLIANCE RATE
        # -------------------------------------------------
        total_students = students.count()
        compliance_rate = (
            ((total_students - students_with_pending) / total_students) * 100
            if total_students else 0
        )

        # -------------------------------------------------
        # MONTHLY COLLECTION DATA
        # -------------------------------------------------
        monthly = (
            Payment.objects
            .filter(date_paid__year=year)
            .annotate(month=TruncMonth('date_paid'))
            .values('month')
            .annotate(collected=Sum('amount'))
            .order_by('month')
        )

        payment_data = [
            {
                "month": m["month"].strftime("%b"),
                "Collected": float(m["collected"]),
                "Target": 0
            }
            for m in monthly
        ]

        # -------------------------------------------------
        # FEE STRUCTURE
        # -------------------------------------------------
        fees = FeeStructure.objects.select_related('program')
        fee_structure = [
            {
                "name": f.program.name,
                "annual_fee": float(f.semester_fee * 2)
            }
            for f in fees
        ]

        return Response(
            {
                "stats": {
                    "totalPending": float(total_pending),
                    "complianceRate": round(compliance_rate, 1),
                    "studentsWithPending": students_with_pending,
                    "totalCollectedYTD": float(total_collected),
                },
                "fee_structure": fee_structure,
                "payment_data": payment_data,
                "top_pending": []
            }
        )
