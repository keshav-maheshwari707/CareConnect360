
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Doctor'),
        ('PATIENT', 'Patient'),
    ]

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='PATIENT'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.username} ({self.role})" 

    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Doctor'),
        ('PATIENT', 'Patient'),
    ]

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='PATIENT'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class DoctorProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )

    specialization = models.CharField(max_length=100)
    qualification = models.CharField(max_length=150)
    license_number = models.CharField(max_length=50, unique=True)
    experience_years = models.PositiveIntegerField(default=0)
    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    bio = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.user.username}"


class PatientProfile(models.Model):

    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='patient_profile'
    )

    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        blank=True
    )
    blood_group = models.CharField(max_length=5, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return f"Patient: {self.user.username}"
