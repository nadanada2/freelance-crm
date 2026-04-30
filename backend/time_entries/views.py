from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import TimeEntry
from .serializers import TimeEntrySerializer


class TimeEntryViewSet(viewsets.ModelViewSet):
    serializer_class   = TimeEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = TimeEntry.objects.filter(owner=self.request.user)
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        total_min = qs.aggregate(t=Sum('duration'))['t'] or 0
        by_project = (
            qs.values('project__id', 'project__title')
              .annotate(total=Sum('duration'))
              .order_by('-total')
        )
        return Response({
            'total_minutes': total_min,
            'total_hours':   round(total_min / 60, 2),
            'by_project': [
                {
                    'project_id':    p['project__id'],
                    'project_name':  p['project__title'],
                    'total_minutes': p['total'],
                    'total_hours':   round(p['total'] / 60, 2),
                }
                for p in by_project
            ]
        })