from django.urls import path
from .views import InvoiceListView, InvoiceDetailView, ProcessPaymentView, PaymentHistoryView

urlpatterns = [
    path('invoices/', InvoiceListView.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('invoices/<int:invoice_id>/pay/', ProcessPaymentView.as_view(), name='process-payment'),
    path('payments/', PaymentHistoryView.as_view(), name='payment-history'),
]
