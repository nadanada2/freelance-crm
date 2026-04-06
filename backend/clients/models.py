from django.db import models
from django.contrib.auth.models import User


class Client(models.Model):
    owner      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients')
    name       = models.CharField(max_length=200)
    email      = models.EmailField(blank=True)
    phone      = models.CharField(max_length=30, blank=True)
    company    = models.CharField(max_length=200, blank=True)
    address    = models.TextField(blank=True)
    notes      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']