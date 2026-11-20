import uuid
from django.db import models
from django.conf import settings
from appointments.models import Appointment


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    ]

    invoice_number = models.CharField(max_length=64, unique=True, blank=True)
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='invoice'
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_invoices'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} - {self.patient.username} - {self.amount} ({self.status})"


class Payment(models.Model):
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('PENDING', 'Pending'),
    ]
    PAYMENT_METHODS = [
        ('CARD', 'Credit / Debit Card'),
        ('UPI', 'UPI / QR'),
        ('NETBANKING', 'Net Banking'),
        ('WALLET', 'Digital Wallet'),
        ('SIMULATED', 'Simulated Sandbox'),
    ]

    transaction_id = models.CharField(max_length=100, unique=True, blank=True)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='SIMULATED')
    payment_status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='SUCCESS')
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_id} - {self.amount} ({self.payment_status})"
