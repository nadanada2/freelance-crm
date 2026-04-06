from django.db import models
from django.contrib.auth.models import User
from clients.models import Client


class Project(models.Model):

    STATUS_CHOICES = [
        ('lead',      'Lead'),
        ('en_cours',  'En cours'),
        ('termine',   'Terminé'),
        ('annule',    'Annulé'),
    ]

    owner       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    client      = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects')
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='lead')
    budget      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    start_date  = models.DateField(null=True, blank=True)
    end_date    = models.DateField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']