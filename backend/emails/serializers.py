from rest_framework import serializers
from .models import EmailTemplate, SentEmail


class EmailTemplateSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model  = EmailTemplate
        fields = ['id', 'name', 'category', 'category_label', 'subject', 'body', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_label']


class SentEmailSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = SentEmail
        fields = ['id', 'client', 'client_name', 'to_email', 'subject', 'body',
                  'status', 'status_label', 'error_msg', 'template', 'sent_at']
        read_only_fields = ['id', 'sent_at', 'status', 'error_msg', 'client_name', 'status_label']


class SendEmailSerializer(serializers.Serializer):
    """Serializer pour la requête d'envoi d'email"""
    client_id   = serializers.IntegerField(required=False, allow_null=True)
    to_email    = serializers.EmailField()
    subject     = serializers.CharField(max_length=500)
    body        = serializers.CharField()
    template_id = serializers.IntegerField(required=False, allow_null=True)
