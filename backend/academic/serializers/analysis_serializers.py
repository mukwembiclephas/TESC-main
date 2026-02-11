# academic/serializers/analysis_serializers.py
from rest_framework import serializers

class FinancialStatsSerializer(serializers.Serializer):
    stats = serializers.DictField()
    fee_structure = serializers.ListField()
    payment_data = serializers.ListField() # Monthly breakdown logic here