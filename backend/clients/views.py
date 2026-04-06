from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    serializer_class   = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Chaque user voit uniquement SES clients
        return Client.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Lie automatiquement le client à l'user connecté
        serializer.save(owner=self.request.user)