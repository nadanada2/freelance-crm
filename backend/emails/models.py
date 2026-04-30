from django.db import models
from django.contrib.auth.models import User
from clients.models import Client


class EmailTemplate(models.Model):
    """Modèles d'emails réutilisables (devis, relance, facture…)"""
    CATEGORY_CHOICES = [
        ('devis',    'Devis'),
        ('relance',  'Relance'),
        ('facture',  'Facture'),
        ('merci',    'Remerciement'),
        ('autre',    'Autre'),
    ]
    owner    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_templates')
    name     = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='autre')
    subject  = models.CharField(max_length=500)
    body     = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.category})"


class SentEmail(models.Model):
    """Historique de tous les emails envoyés"""
    STATUS_CHOICES = [
        ('sent',   'Envoyé'),
        ('failed', 'Échec'),
    ]
    owner      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_emails')
    client     = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='emails')
    to_email   = models.EmailField()
    subject    = models.CharField(max_length=500)
    body       = models.TextField()
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')
    error_msg  = models.TextField(blank=True)
    template   = models.ForeignKey(EmailTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    sent_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"Email à {self.to_email} — {self.subject[:40]}"
