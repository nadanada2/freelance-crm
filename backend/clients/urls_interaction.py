from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, InteractionViewSet

router = DefaultRouter()
router.register(r'clients',      ClientViewSet,      basename='client')
router.register(r'interactions', InteractionViewSet, basename='interaction')

urlpatterns = router.urls