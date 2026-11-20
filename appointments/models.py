import uuid
from django.db import models
from django.conf import settings


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_appointments'
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_appointments'
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    symptoms = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-appointment_date', '-appointment_time']

    def __str__(self):
        return f"Appt #{self.id}: {self.patient.username} with {self.doctor.username} ({self.status})"


class Consultation(models.Model):
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='consultation'
    )
    room_name = models.CharField(max_length=120, unique=True)
    is_active = models.BooleanField(default=True)
    doctor_joined = models.BooleanField(default=False)
    patient_joined = models.BooleanField(default=False)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Room {self.room_name} for Appt #{self.appointment_id}"

    @classmethod
    def generate_room_name(cls, appointment_id):
        return f"CareConnect360-{appointment_id}-{uuid.uuid4().hex[:10]}"
