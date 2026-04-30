from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from clients.models import Client
from .models import EmailTemplate, SentEmail
from .serializers import EmailTemplateSerializer, SentEmailSerializer, SendEmailSerializer


class EmailTemplateViewSet(viewsets.ModelViewSet):
    serializer_class   = EmailTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmailTemplate.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class SentEmailViewSet(viewsets.ReadOnlyModelViewSet):
    """Historique des emails envoyés (lecture seule, l'envoi passe par /send/)"""
    serializer_class   = SentEmailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = SentEmail.objects.filter(owner=self.request.user)
        client_id = self.request.query_params.get('client')
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_email_view(request):
    """
    Envoie un vrai email SMTP et enregistre dans l'historique.
    Body: { to_email, subject, body, client_id (opt), template_id (opt) }
    """
    ser = SendEmailSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    data = ser.validated_data
    client = None
    if data.get('client_id'):
        try:
            client = Client.objects.get(id=data['client_id'], owner=request.user)
        except Client.DoesNotExist:
            return Response({'error': 'Client introuvable'}, status=status.HTTP_404_NOT_FOUND)

    template = None
    if data.get('template_id'):
        try:
            template = EmailTemplate.objects.get(id=data['template_id'], owner=request.user)
        except EmailTemplate.DoesNotExist:
            pass

    email_status = 'sent'
    error_msg = ''

    try:
        send_mail(
            subject     = data['subject'],
            message     = data['body'],
            from_email  = settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL,
            recipient_list = [data['to_email']],
            fail_silently = False,
        )
    except Exception as e:
        email_status = 'failed'
        error_msg = str(e)

    sent = SentEmail.objects.create(
        owner     = request.user,
        client    = client,
        to_email  = data['to_email'],
        subject   = data['subject'],
        body      = data['body'],
        status    = email_status,
        error_msg = error_msg,
        template  = template,
    )

    if email_status == 'failed':
        return Response(
            {'error': f'Email non envoyé: {error_msg}', 'id': sent.id},
            status=status.HTTP_502_BAD_GATEWAY
        )

    return Response(SentEmailSerializer(sent).data, status=status.HTTP_201_CREATED)
