from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('electronics', 'Electronics'),
        ('fashion', 'Fashion'),
        ('kids', 'Kids Section'),
        ('home', 'Home Appliances'),
        ('kitchen', 'Kitchen'),
        ('groceries', 'Groceries'),
        ('health', 'Health'),
        ('gaming', 'Gaming'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount = models.IntegerField(null=True, blank=True, help_text="Discount percentage (e.g. 20 for -20%)")
    bank_offer = models.CharField(max_length=255, null=True, blank=True, help_text="e.g. 10% Bank Offer")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    image_url = models.CharField(max_length=1000, null=True, blank=True, help_text="Fallback or direct image URL")
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='electronics')
    tags = models.CharField(max_length=255, null=True, blank=True, help_text="Comma-separated tags (e.g. electronics, gaming)")

    def __str__(self):
        return self.name

    def star_list(self):
        full = int(self.rating)
        half = 1 if (self.rating - full) >= 0.5 else 0
        empty = 5 - full - half
        return {
            'full': range(full),
            'half': range(half),
            'empty': range(empty),
            'value': float(self.rating)
        }


class Review(models.Model):
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    rating = models.IntegerField(default=5)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.title}"

    def star_list(self):
        full = max(1, min(5, self.rating))
        empty = 5 - full
        return {
            'full': range(full),
            'empty': range(empty)
        }


class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"


class PricingPlan(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2)
    annual_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_featured_monthly = models.BooleanField(default=False)
    is_featured_annual = models.BooleanField(default=False)
    features = models.TextField(help_text="Enter features, one per line")

    def __str__(self):
        return self.name

    def features_list(self):
        return [f.strip() for f in self.features.split('\n') if f.strip()]


from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    street_address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, default='India')
    email_notifications = models.BooleanField(default=True)
    preferred_language = models.CharField(max_length=50, default='English')

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Order(models.Model):
    STATUS_CHOICES = [
        ('placed', 'Order Placed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('returning', 'Return Requested'),
        ('returned', 'Returned'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    payment_mode = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='placed')
    total_rupees = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    total_dollars = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    
    # Return details
    return_reason = models.TextField(blank=True, null=True)
    return_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Order {self.order_number} by {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='₹')
    quantity = models.IntegerField(default=1)
    image_url = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return f"{self.quantity} x {self.product_name} in Order {self.order.order_number}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)
    instance.profile.save()

