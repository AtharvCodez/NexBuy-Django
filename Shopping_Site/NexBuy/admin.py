from django.contrib import admin
from .models import Product, Review, ContactMessage, PricingPlan, UserProfile

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'tags', 'price', 'old_price', 'rating')
    list_filter = ('category', 'rating')
    search_fields = ('name', 'description', 'tags')
    ordering = ('name',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('name', 'title', 'text')
    ordering = ('-created_at',)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'summary', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'subject', 'message', 'summary')
    ordering = ('-created_at',)

@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'monthly_price', 'annual_price', 'is_featured_monthly', 'is_featured_annual')
    search_fields = ('name', 'description')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'profile_picture')
    search_fields = ('user__username', 'user__email')

