from rest_framework import serializers
from .models import TimeEntry


class TimeEntrySerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.title', read_only=True)
    hours        = serializers.SerializerMethodField()

    class Meta:
        model  = TimeEntry
        fields = ['id', 'project', 'project_name', 'description', 'duration', 'hours', 'date', 'created_at']
        read_only_fields = ['id', 'created_at', 'project_name', 'hours']

    def get_hours(self, obj):
        return round(obj.duration / 60, 2)