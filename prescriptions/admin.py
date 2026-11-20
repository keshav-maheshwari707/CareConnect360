from django.contrib import admin
from .models import Prescription, PrescriptionMedicine

class PrescriptionMedicineInline(admin.TabularInline):
    model = PrescriptionMedicine
    extra = 1

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'doctor', 'patient', 'diagnosis', 'created_at')
    search_fields = ('doctor__username', 'patient__username', 'diagnosis')
    inlines = [PrescriptionMedicineInline]
