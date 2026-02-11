from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from academic.models import Student 

class DropoutAnalysisView(APIView):
    """
    Endpoint: /api/analysis/dropout-analysis/
    Returns GLOBAL dropout statistics (HQ View).
    """
    def get(self, request):
        # No institution_id required for HQ view. 
        # We want to scan the entire Student table.
        
        # 1. Base Query: Get ALL dropouts from ALL institutions
        qs = Student.objects.filter(
            status__in=['Dropout', 'Withdrawn', 'Inactive']
        )

        total_dropouts = qs.count()

        # 2. Aggregate by Reason (Global)
        by_reason = qs.values('dropout_reason').annotate(count=Count('id')).order_by('-count')

        # 3. Format for Frontend
        chart_data = []
        
        colors = {
            'Financial': 'hsl(var(--destructive))', 
            'Academic': 'hsl(var(--warning))',      
            'Medical': 'hsl(var(--info))',          
            'Personal': 'hsl(var(--accent))',       
            'Transfer': 'hsl(var(--muted))',        
            'Other': 'hsl(var(--secondary))'        
        }

        reason_labels = {
            'Financial': 'Financial Hardship',
            'Academic': 'Academic Failure',
            'Medical': 'Health/Medical',
            'Personal': 'Personal Issues',
            'Transfer': 'Transferred',
            'Other': 'Other Reasons'
        }

        for item in by_reason:
            reason_code = item['dropout_reason'] or 'Other'
            display_name = reason_labels.get(reason_code, reason_code)
            
            chart_data.append({
                "name": display_name,
                "value": item['count'],
                "color": colors.get(reason_code, 'hsl(var(--primary))')
            })

        return Response({
            "total_dropouts": total_dropouts,
            "chart_data": chart_data
        })