from rest_framework import serializers
from .models import Interaction


class InteractionSerializer(serializers.ModelSerializer):
    type_label = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model  = Interaction
        fields = ['id', 'client', 'type', 'type_label', 'content', 'date', 'created_at']
        read_only_fields = ['id', 'created_at', 'type_label']