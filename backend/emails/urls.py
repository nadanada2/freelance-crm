from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmailTemplateViewSet, SentEmailViewSet, send_email_view

router = DefaultRouter()
router.register(r'email-templates', EmailTemplateViewSet, basename='email-template')
router.register(r'sent-emails',     SentEmailViewSet,     basename='sent-email')

urlpatterns = [
    path('', include(router.urls)),
    path('send-email/', send_email_view, name='send-email'),
]
