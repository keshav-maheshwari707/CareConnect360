from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/prescriptions/', include('prescriptions.urls')),
    path('api/communication/', include('communication.urls')),
    path('api/billing/', include('billing.urls')),
]
