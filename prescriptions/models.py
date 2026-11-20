from django.db import models
from django.conf import settings
from appointments.models import Appointment


class Prescription(models.Model):
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='prescription',
        null=True,
        blank=True
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='prescriptions_written'
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='prescriptions_received'
    )
    diagnosis = models.TextField()
    general_advice = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Prescription #{self.id} - Dr. {self.doctor.username} for {self.patient.username}"


class PrescriptionMedicine(models.Model):
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name='medicines'
    )
    medicine_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100) # e.g. 500mg
    frequency = models.CharField(max_length=100) # e.g. 1-0-1 or Twice daily
    duration = models.CharField(max_length=100) # e.g. 5 days
    instructions = models.CharField(max_length=255, blank=True) # e.g. After meals

    def __str__(self):
        return f"{self.medicine_name} ({self.dosage}) for Prescription #{self.prescription_id}"
