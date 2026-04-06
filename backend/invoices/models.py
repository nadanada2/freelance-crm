from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from clients.models import Client
from projects.models import Project


class Invoice(models.Model):

    STATUS_CHOICES = [
        ('brouillon',  'Brouillon'),
        ('envoye',     'Envoyé'),
        ('paye',       'Payé'),
        ('en_retard',  'En retard'),
    ]

    owner          = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')
    client         = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='invoices')
    project        = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    amount         = models.DecimalField(max_digits=10, decimal_places=2)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='brouillon')
    issued_date    = models.DateField(default=timezone.now)
    due_date       = models.DateField(null=True, blank=True)
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Génère automatiquement le numéro de facture
        if not self.invoice_number:
            year = timezone.now().year
            last = Invoice.objects.filter(
                owner=self.owner,
                invoice_number__startswith=f'FAC-{year}-'
            ).count()
            self.invoice_number = f'FAC-{year}-{str(last + 1).zfill(3)}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoice_number

    class Meta:
        ordering = ['-created_at']