from django.contrib import admin
from .models import EmailTemplate, SentEmail

@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'owner', 'created_at']

@admin.register(SentEmail)
class SentEmailAdmin(admin.ModelAdmin):
    list_display = ['to_email', 'subject', 'status', 'owner', 'sent_at']
