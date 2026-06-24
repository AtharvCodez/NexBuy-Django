from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from NexBuy import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Root mapping
    path('', views.index_view, name='index'),
    path('index.html', views.index_view, name='index_html'),
    
    # Products mapping
    path('Product.html', views.product_view, name='product_html'),
    path('product.html', views.product_view, name='product'),
    
    # Testimonials mapping
    path('testimonial.html', views.testimonial_view, name='testimonial'),
    
    # Contact mapping
    path('Contact.html', views.contact_view, name='contact_html'),
    path('contact.html', views.contact_view, name='contact'),
    
    # About us mapping
    path('aboutUs.html', views.aboutus_view, name='aboutus_html'),
    path('aboutus.html', views.aboutus_view, name='aboutus'),
    
    # Auth mapping
    path('sign_In.html', views.sign_in_view, name='sign_in_html'),
    path('sign_in.html', views.sign_in_view, name='sign_in'),
    path('logout/', views.logout_view, name='logout'),
    
    # Complaint mapping
    path('complaint/<int:pk>/', views.complaint_detail_view, name='complaint_detail'),
    
    # Subscription mapping
    path('subscription.html', views.subscription_view, name='subscription'),
    
    # Order Success mapping
    path('order_success.html', views.order_success_view, name='order_success'),
    
    # Profile mapping
    path('profile/', views.profile_view, name='profile'),
    
    # New orders & returns mapping
    path('orders/', views.orders_view, name='orders'),
    path('place-order/', views.place_order_view, name='place_order'),
    path('return-order/<int:order_id>/', views.return_order_view, name='return_order'),
    
    # New settings & change password mapping
    path('settings/', views.settings_view, name='settings'),
    path('change-password/', views.change_password_view, name='change_password'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
