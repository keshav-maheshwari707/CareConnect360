from django.contrib import admin
from .models import Conversation, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 1

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'created_at', 'updated_at')
    search_fields = ('patient__username', 'doctor__username')
    inlines = [MessageInline]
