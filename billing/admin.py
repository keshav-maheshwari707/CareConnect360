from django.contrib import admin
from .models import Invoice, Payment

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'patient', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('invoice_number', 'patient__username')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'invoice', 'patient', 'amount', 'payment_method', 'payment_status', 'payment_date')
    list_filter = ('payment_status', 'payment_method')
    search_fields = ('transaction_id', 'patient__username')
