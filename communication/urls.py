from django.urls import path
from .views import ConversationListCreateView, ConversationDetailMessagesView

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list-create'),
    path('conversations/<int:pk>/', ConversationDetailMessagesView.as_view(), name='conversation-detail-messages'),
]
