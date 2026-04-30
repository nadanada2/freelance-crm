from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from projects.models import Project


class TimeEntry(models.Model):
    owner       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='time_entries')
    project     = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='time_entries')
    description = models.CharField(max_length=255, blank=True)
    duration    = models.PositiveIntegerField(help_text="Durée en minutes")
    date        = models.DateField(default=timezone.now)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.project.title} — {self.duration} min"