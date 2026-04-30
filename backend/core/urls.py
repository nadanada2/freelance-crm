from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/',        admin.site.urls),
    path('api/',          include('users.urls')),
    #path('api/',          include('clients.urls')),
    path('api/',          include('projects.urls')),
    path('api/',          include('invoices.urls')),
    path('api/',   include('clients.urls_interaction')),
    path('api/',   include('time_entries.urls')),
    path('api/',   include('emails.urls')),
]


