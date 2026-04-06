from rest_framework import serializers
from .models import Project
from clients.serializers import ClientSerializer


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model  = Project
        fields = [
            'id', 'title', 'description', 'status',
            'budget', 'start_date', 'end_date',
            'client', 'client_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'client_name']