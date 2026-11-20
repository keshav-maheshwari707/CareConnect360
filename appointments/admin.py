from django.contrib import admin
from .models import Appointment, Consultation

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'appointment_date', 'appointment_time', 'status', 'created_at')
    list_filter = ('status', 'appointment_date')
    search_fields = ('patient__username', 'doctor__username', 'symptoms')

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment', 'room_name', 'is_active', 'doctor_joined', 'patient_joined')
    search_fields = ('room_name',)
