from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from .models import User, Category, SubCategory, Expense, Income, ChatMessage

class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')
    list_filter = ('is_active', 'role')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'role')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    filter_horizontal = ()

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')

class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'user', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description')

class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('user', 'expense_amount', 'category', 'subcategory', 'transaction_datetime')
    list_filter = ('category', 'transaction_datetime')
    search_fields = ('expense_note',)

class IncomeAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'everymonth_payment_date', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('description',)

class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'content_preview', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('content',)
    
    def content_preview(self, obj):
        # Return first 50 characters of content as preview
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    
    content_preview.short_description = 'Content Preview'

admin.site.register(User, UserAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(SubCategory, SubCategoryAdmin)
admin.site.register(Expense, ExpenseAdmin)
admin.site.register(Income, IncomeAdmin)
admin.site.register(ChatMessage, ChatMessageAdmin)
admin.site.unregister(Group)  # We don't need Django's built-in Group model
