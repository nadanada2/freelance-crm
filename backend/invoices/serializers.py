from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    client_name  = serializers.CharField(source='client.name',   read_only=True)
    project_name = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model  = Invoice
        fields = [
            'id', 'invoice_number', 'amount', 'status',
            'issued_date', 'due_date', 'notes',
            'client', 'client_name',
            'project', 'project_name',
            'created_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'created_at']