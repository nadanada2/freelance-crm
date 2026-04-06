from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    projects_count = serializers.SerializerMethodField()

    class Meta:
        model  = Client
        fields = [
            'id', 'name', 'email', 'phone',
            'company', 'address', 'notes',
            'created_at', 'projects_count'
        ]
        read_only_fields = ['id', 'created_at']

    def get_projects_count(self, obj):
        return obj.projects.count()