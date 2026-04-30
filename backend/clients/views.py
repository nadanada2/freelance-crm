from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Client
from .serializers import ClientSerializer
from .models import Interaction
from .serializers_interaction import InteractionSerializer


class ClientViewSet(viewsets.ModelViewSet):
    serializer_class   = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Chaque user voit uniquement SES clients
        return Client.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Lie automatiquement le client à l'user connecté
        serializer.save(owner=self.request.user)




class InteractionViewSet(viewsets.ModelViewSet):
    serializer_class   = InteractionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Interaction.objects.filter(owner=self.request.user)
        client_id = self.request.query_params.get('client')
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)        