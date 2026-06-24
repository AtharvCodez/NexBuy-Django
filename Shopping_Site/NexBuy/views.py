from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.models import Avg
from django.http import JsonResponse
from django.utils import timezone
import json
import uuid
from .models import Product, Review, ContactMessage, PricingPlan, Order, OrderItem

def seed_db():
    if not PricingPlan.objects.exists():
        PricingPlan.objects.create(
            name="Basic User",
            description="For casual browsing and occasional purchases.",
            monthly_price=0.00,
            annual_price=0.00,
            features="Access to all products\nStandard 5-7 day shipping\nBasic email support\nSave items to wishlist"
        )
        PricingPlan.objects.create(
            name="Pro Member",
            description="The complete experience for frequent shoppers.",
            monthly_price=12.99,
            annual_price=10.99,
            is_featured_monthly=True,
            features="Free 2-day shipping\nExclusive member-only deals\nEarly access to new arrivals\nPriority customer support\nHassle-free returns"
        )
        PricingPlan.objects.create(
            name="Enterprise",
            description="Scaled solutions for your entire business.",
            monthly_price=49.99,
            annual_price=41.99,
            features="All Pro Member benefits\nBulk order discounts\nDedicated account manager\nTax-exempt purchasing\nNet 30 payment terms"
        )
    if Product.objects.count() < 288:
        Product.objects.all().delete()
        products_data = [
            # 1. Electronics
            {
                "name": "Pixel 9 Pro",
                "description": "The latest AI-powered smartphone from Google, featuring the new Tensor G4 chip and pro-level cameras.",
                "price": 799.00, "old_price": 999.00, "discount": 20, "bank_offer": "10% Bank Offer", "rating": 4.7,
                "category": "electronics", "tags": "electronics, phone, smartphone, tech, hot",
                "image_url": "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/P9P9PThumbnail_16x9_Opt2_1.width-700.format-webp.webp"
            },
            {
                "name": "Apple Airpods Pro 3",
                "description": "Next-generation spatial audio and adaptive noise cancellation. A truly immersive sound experience.",
                "price": 179.00, "old_price": 199.00, "discount": 10, "rating": 4.9,
                "category": "electronics", "tags": "electronics, audio, headphones, apple, technology",
                "image_url": "https://cdn.mos.cms.futurecdn.net/v2/t:0,l:773,cw:1988,ch:1988,q:80,w:1988/2tb2KWDC5dLHBVm7Tuy8Do.png"
            },
            {
                "name": "Asus Rog Strix G16",
                "description": "Dominate the game with this 16-inch powerhouse, featuring an RTX 4070 and Intel Core i9 processor.",
                "price": 1199.00, "old_price": 1499.00, "discount": 15, "bank_offer": "15% Bank Offer", "rating": 4.2,
                "category": "electronics", "tags": "electronics, laptop, computer, gaming, asus, pc",
                "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXnMe2Xyvx8i_PFsDXRTxiKcupV9X7XFHFVA&s"
            },
            {
                "name": "AirPods Max Pro",
                "description": "Premium wireless headphones with active noise cancellation and spatial audio.",
                "price": 549.00, "old_price": 599.00, "discount": 8, "bank_offer": "5% Bank Offer", "rating": 4.8,
                "category": "electronics", "tags": "electronics, audio, headphones, apple, premium",
                "image_url": "https://idestiny.in/wp-content/uploads/2024/10/airpods-max-select-202409-midnight_FV1.jpeg"
            },
            {
                "name": "4K Action Camera Pro",
                "description": "Ultra HD action camera with dual screen, 20MP resolution, and 130ft waterproof housing.",
                "price": 89.00, "old_price": 99.00, "discount": 10, "rating": 4.5,
                "category": "electronics", "tags": "electronics, camera, action, video, tech",
                "image_url": "https://www.zdnet.com/a/img/resize/6bcf12ee80f0c05763ca7b587a810f279d08e5e8/2023/07/26/220268cc-8dcd-4e89-9a74-d4508ad932cc/gopro-hero11-black.jpg?auto=webp&fit=crop&height=900&width=1200"
            },
            {
                "name": "X-Pro Camera Drone",
                "description": "Professional camera drone with 4K recording, GPS auto-return, and 30-minute flight time.",
                "price": 475.00, "old_price": 500.00, "discount": 5, "rating": 4.3,
                "category": "electronics", "tags": "electronics, drone, camera, tech, aviation",
                "image_url": "https://www.xboom.in/wp-content/uploads/2023/09/3-15-3.jpg"
            },
            # 2. Fashion
            {
                "name": "Men's Premium Leather Jacket",
                "description": "Crafted from 100% genuine lambskin leather, featuring classic biker styling and metallic zippers.",
                "price": 199.00, "old_price": 249.00, "discount": 20, "bank_offer": "10% Bank Offer", "rating": 4.6,
                "category": "fashion", "tags": "fashion, jacket, mens, leather, clothing, premium",
                "image_url": "https://i.ebayimg.com/images/g/D9MAAOSw6n5lDq4B/s-l1200.jpg"
            },
            {
                "name": "Women's Designer Trench Coat",
                "description": "Elegant double-breasted trench coat with a waist belt, waterproof fabric, and modern silhouette.",
                "price": 149.00, "old_price": 189.00, "discount": 21, "rating": 4.8,
                "category": "fashion", "tags": "fashion, coat, womens, designer, clothing",
                "image_url": "https://m.media-amazon.com/images/I/71cAg16-2PL._AC_UY1000_.jpg"
            },
            {
                "name": "Running Shoes Comfort Max",
                "description": "Breathable mesh upper with premium cushioning and responsive sole. Perfect for marathon running.",
                "price": 79.00, "old_price": 99.00, "discount": 20, "rating": 4.4,
                "category": "fashion", "tags": "fashion, shoes, running, athletic, footwear",
                "image_url": "https://contents.mediadecathlon.com/p2618956/k$6103328e1d5334758b9f1d063740ee00/men-running-shoes-run-active-black-bronze.jpg?format=auto&quality=40&f=800x800"
            },
            {
                "name": "Vintage Denim Jacket",
                "description": "Classic wash denim jacket made from organic cotton. Relaxed fit with signature metal buttons.",
                "price": 59.00, "old_price": 69.00, "discount": 14, "rating": 4.5,
                "category": "fashion", "tags": "fashion, jacket, denim, vintage, clothing",
                "image_url": "https://www.denimio.com/media/catalog/product/s/d/sda-d4567-001.jpg"
            },
            {
                "name": "Smart Fit Polo Shirt",
                "description": "Premium piqué polo shirt designed for absolute comfort. Short sleeves with ribbed cuffs.",
                "price": 29.00, "old_price": 39.00, "discount": 25, "rating": 4.3,
                "category": "fashion", "tags": "fashion, shirt, polo, mens, clothing",
                "image_url": "https://n.nordstrommedia.com/id/sr3/f305f8bc-b2cf-4b95-a228-562a0459c384.jpeg?h=365&w=240&dpr=2"
            },
            {
                "name": "Designer Sunglasses",
                "description": "Polarized lenses with classic acetate frame. Complete UV400 protection and scratch-resistant coating.",
                "price": 49.00, "old_price": 59.00, "discount": 16, "rating": 4.7,
                "category": "fashion", "tags": "fashion, sunglasses, accessories, premium",
                "image_url": "https://m.media-amazon.com/images/I/610N2zYh-GL._AC_UY1100_.jpg"
            },
            # 3. Kids Section
            {
                "name": "Kids Learning Tablet",
                "description": "Child-safe learning tablet featuring pre-loaded educational games, parent controls, and a drop-proof bumper.",
                "price": 99.00, "old_price": 129.00, "discount": 23, "bank_offer": "5% Bank Offer", "rating": 4.5,
                "category": "kids", "tags": "kids, tablet, education, learning, electronics",
                "image_url": "https://m.media-amazon.com/images/I/71u+mXh+s2L.jpg"
            },
            {
                "name": "Building Blocks Set (100pcs)",
                "description": "Vibrant plastic building blocks to stimulate motor skills and architectural imagination.",
                "price": 24.00, "old_price": 29.00, "discount": 17, "rating": 4.8,
                "category": "kids", "tags": "kids, toys, blocks, creative",
                "image_url": "https://m.media-amazon.com/images/I/71tQp72LcfL._AC_SL1500_.jpg"
            },
            {
                "name": "Plush Teddy Bear XL",
                "description": "Super soft giant teddy bear (3 feet) made with hypoallergenic filling. Perfect bedtime companion.",
                "price": 39.00, "old_price": 49.00, "discount": 20, "rating": 4.9,
                "category": "kids", "tags": "kids, toys, plush, teddy, gift",
                "image_url": "https://m.media-amazon.com/images/I/61dF8nKqZKL._AC_SL1500_.jpg"
            },
            {
                "name": "Interactive Toy Robot",
                "description": "Smart robot toy that sings, dances, obeys voice commands, and can be programmed via a simple app.",
                "price": 45.00, "old_price": 59.00, "discount": 23, "rating": 4.6,
                "category": "kids", "tags": "kids, toys, robot, interactive",
                "image_url": "https://m.media-amazon.com/images/I/61-H80b0DdL._AC_SL1500_.jpg"
            },
            {
                "name": "Kids Colorful Backpack",
                "description": "Lightweight school bag with multiple compartments, padded straps, and a fun print design.",
                "price": 19.00, "old_price": 24.00, "discount": 20, "rating": 4.4,
                "category": "kids", "tags": "kids, school, backpack, bag",
                "image_url": "https://m.media-amazon.com/images/I/71F2Zt5mveL._AC_SL1500_.jpg"
            },
            {
                "name": "Wooden Train Set",
                "description": "Classic wooden railway set with train cars, tracks, bridges, and decorative figurines.",
                "price": 34.00, "old_price": 39.00, "discount": 12, "rating": 4.7,
                "category": "kids", "tags": "kids, toys, wooden, train",
                "image_url": "https://m.media-amazon.com/images/I/81P6sDkP3FL._AC_SL1500_.jpg"
            },
            # 4. Home Appliances
            {
                "name": "RoboVac S1",
                "description": "Smart Lidar navigation and 4000Pa suction power. Self-emptying station included.",
                "price": 399.00, "old_price": 499.00, "discount": 20, "bank_offer": "10% Bank Offer", "rating": 4.6,
                "category": "home", "tags": "home, vacuum, robot, cleaner, appliance",
                "image_url": "https://5.imimg.com/data5/SELLER/Default/2022/10/AL/CE/NG/33628685/vacum-cleaner.jpg"
            },
            {
                "name": "Smart Air Purifier",
                "description": "True HEPA filter capturing 99.97% of allergens, smoke, and dust. App-connected monitoring.",
                "price": 129.00, "old_price": 149.00, "discount": 13, "rating": 4.7,
                "category": "home", "tags": "home, air, purifier, smart, appliance",
                "image_url": "https://m.media-amazon.com/images/I/71F7X2tK5cL._AC_SL1500_.jpg"
            },
            {
                "name": "Intelligent Thermostat",
                "description": "Save energy with smart scheduling and room sensors. Works with Alexa, Google, and Apple Home.",
                "price": 179.00, "old_price": 199.00, "discount": 10, "rating": 4.5,
                "category": "home", "tags": "home, thermostat, smart, heating, cooling",
                "image_url": "https://m.media-amazon.com/images/I/51M3m74D06L._AC_SL1000_.jpg"
            },
            {
                "name": "Dehumidifier Pro",
                "description": "Removes up to 50 pints of moisture per day. Ideal for basements and large rooms.",
                "price": 189.00, "old_price": 219.00, "discount": 13, "rating": 4.4,
                "category": "home", "tags": "home, dehumidifier, moisture, appliance",
                "image_url": "https://m.media-amazon.com/images/I/61k8wDkR+wL._AC_SL1500_.jpg"
            },
            {
                "name": "Cordless Stick Vacuum",
                "description": "Lightweight cordless vacuum with powerful suction, 40-minute runtime, and multi-surface brush head.",
                "price": 149.00, "old_price": 179.00, "discount": 16, "rating": 4.3,
                "category": "home", "tags": "home, vacuum, cordless, cleaner, appliance",
                "image_url": "https://m.media-amazon.com/images/I/61Z65-FNDOL._AC_SL1500_.jpg"
            },
            {
                "name": "Smart Wi-Fi Fan",
                "description": "Oscillating pedestal fan with quiet brushless motor, 12 speed settings, and smart assistant controls.",
                "price": 89.00, "old_price": 99.00, "discount": 10, "rating": 4.6,
                "category": "home", "tags": "home, fan, smart, cooling, appliance",
                "image_url": "https://m.media-amazon.com/images/I/61oZ+H-d8DL._AC_SL1500_.jpg"
            },
            # 5. Kitchen
            {
                "name": "Smart Coffee Maker",
                "description": "App-controlled automatic drip coffee maker with custom strength and temperature profiles.",
                "price": 135.00, "old_price": 150.00, "discount": 10, "rating": 5.0,
                "category": "kitchen", "tags": "kitchen, coffee, maker, smart, appliance",
                "image_url": "https://www.suranasons.in/cdn/shop/files/61x2BKrHBKL._SL1000.jpg?v=1736500986"
            },
            {
                "name": "Air Fryer Pro XL",
                "description": "Large capacity healthy air fryer with 8 presets and double-basket cooking.",
                "price": 125.00, "old_price": 150.00, "discount": 15, "rating": 4.8,
                "category": "kitchen", "tags": "kitchen, airfryer, fryer, healthy, appliance",
                "image_url": "https://www.wonderchef.com/cdn/shop/files/Image-1_f1f90c1c-06f1-413d-8ff6-1da7de0fff8c.jpg?v=1757414567&width=600"
            },
            {
                "name": "Smart Espresso Machine",
                "description": "Barista-quality coffee at home. App-controlled with 20-bar pressure for the perfect brew.",
                "price": 349.00, "old_price": 399.00, "discount": 12, "bank_offer": "5% Bank Offer", "rating": 5.0,
                "category": "kitchen", "tags": "kitchen, espresso, coffee, barista, appliance",
                "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTodLFqR1i14ViT7690pnIlqxbwNSmLbTkvTQ&s"
            },
            {
                "name": "Precision Blender 1000W",
                "description": "High-speed blender with touch screen controls, ideal for smoothies, purees, and crushing ice.",
                "price": 79.00, "old_price": 89.00, "discount": 11, "rating": 4.6,
                "category": "kitchen", "tags": "kitchen, blender, mixer, appliance",
                "image_url": "https://m.media-amazon.com/images/I/71u1+i22Y6L._AC_SL1500_.jpg"
            },
            {
                "name": "Multi-Cooker Instant Pot",
                "description": "7-in-1 electric pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.",
                "price": 89.00, "old_price": 99.00, "discount": 10, "rating": 4.7,
                "category": "kitchen", "tags": "kitchen, cooker, instantpot, appliance",
                "image_url": "https://m.media-amazon.com/images/I/71WtwEvY8SL._AC_SL1500_.jpg"
            },
            {
                "name": "Stainless Steel Knife Set",
                "description": "Premium 15-piece kitchen knife block set with built-in sharpener, made from high-carbon German steel.",
                "price": 69.00, "old_price": 79.00, "discount": 12, "rating": 4.9,
                "category": "kitchen", "tags": "kitchen, knives, cutlery, chef",
                "image_url": "https://m.media-amazon.com/images/I/81A+gTf3k2L._AC_SL1500_.jpg"
            },
            # 6. Groceries
            {
                "name": "Organic Arabica Coffee Beans",
                "description": "Single-origin, dark roast whole bean coffee sourced from fair-trade organic cooperatives.",
                "price": 14.00, "old_price": 17.00, "discount": 17, "rating": 4.8,
                "category": "groceries", "tags": "groceries, coffee, beans, organic, food",
                "image_url": "https://m.media-amazon.com/images/I/81xU9d1K0DL._SL1500_.jpg"
            },
            {
                "name": "Premium Extra Virgin Olive Oil",
                "description": "Cold-pressed extra virgin olive oil from Greek olives, perfect for salads and cooking.",
                "price": 18.00, "old_price": 22.00, "discount": 18, "rating": 4.9,
                "category": "groceries", "tags": "groceries, oliveoil, organic, food, cooking",
                "image_url": "https://m.media-amazon.com/images/I/71u9sW4zRFL._SL1500_.jpg"
            },
            {
                "name": "Himalayan Pink Salt (1kg)",
                "description": "Coarse-grain organic Himalayan pink salt, mineral-rich and unrefined.",
                "price": 8.00, "old_price": 9.99, "discount": 19, "rating": 4.7,
                "category": "groceries", "tags": "groceries, salt, seasoning, food",
                "image_url": "https://m.media-amazon.com/images/I/71JcR4VfbpL._SL1500_.jpg"
            },
            {
                "name": "Assorted Organic Herbal Tea",
                "description": "Variety pack of 40 tea bags featuring Chamomile, Peppermint, Green Tea, and Earl Grey.",
                "price": 12.00, "old_price": 14.00, "discount": 14, "rating": 4.6,
                "category": "groceries", "tags": "groceries, tea, organic, herbal, beverage",
                "image_url": "https://m.media-amazon.com/images/I/81y5Zp8QJGL._SL1500_.jpg"
            },
            {
                "name": "Natural Wildflower Honey",
                "description": "Pure, raw, unfiltered honey harvested from organic wildflower fields.",
                "price": 10.00, "old_price": 12.00, "discount": 16, "rating": 4.8,
                "category": "groceries", "tags": "groceries, honey, natural, sweetener, food",
                "image_url": "https://m.media-amazon.com/images/I/71fL9+j6UdL._SL1500_.jpg"
            },
            {
                "name": "Mixed Nuts & Dried Fruits Pack",
                "description": "A healthy blend of organic almonds, walnuts, cashews, raisins, and dried cranberries.",
                "price": 15.00, "old_price": 18.00, "discount": 16, "rating": 4.5,
                "category": "groceries", "tags": "groceries, nuts, driedfruits, snack, healthy",
                "image_url": "https://m.media-amazon.com/images/I/81tX4Yh-uDL._SL1500_.jpg"
            },
            # 7. Health
            {
                "name": "Pro Eco Yoga Mat",
                "description": "High-density eco-friendly TPE yoga mat, featuring a non-slip textured alignment line system.",
                "price": 69.00, "old_price": 79.00, "discount": 12, "rating": 4.9,
                "category": "health", "tags": "health, yoga, mat, fitness, exercise, eco",
                "image_url": "https://iklstore.com/wp-content/uploads/2023/10/41qB-OiHs9L._AC_UF8941000_QL80_.jpg"
            },
            {
                "name": "Adjustable Dumbbells Pair",
                "description": "Pair of adjustable weights (5 to 52.5 lbs) with quick dial selection mechanisms.",
                "price": 289.00, "old_price": 329.00, "discount": 12, "rating": 4.8,
                "category": "health", "tags": "health, dumbbells, fitness, weight, exercise",
                "image_url": "https://m.media-amazon.com/images/I/71u9sW4zRFL._AC_SL1500_.jpg"
            },
            {
                "name": "Smart Fitness Tracker Band",
                "description": "Monitors heart rate, sleep quality, active steps, and sports modes. Water-resistant color screen.",
                "price": 49.00, "old_price": 59.00, "discount": 16, "rating": 4.4,
                "category": "health", "tags": "health, fitness, tracker, band, watch, tech",
                "image_url": "https://m.media-amazon.com/images/I/61k+M75iVXL._AC_SL1500_.jpg"
            },
            {
                "name": "Whey Protein Isolate (1kg)",
                "description": "Ultra-filtered vanilla flavor whey protein, delivering 25g protein and 5.5g BCAAs per serving.",
                "price": 39.00, "old_price": 45.00, "discount": 13, "rating": 4.7,
                "category": "health", "tags": "health, protein, whey, supplement, fitness",
                "image_url": "https://m.media-amazon.com/images/I/71Z+R+28TQL._AC_SL1500_.jpg"
            },
            {
                "name": "Organic Multivitamin Capsules",
                "description": "Full spectrum daily multivitamin containing essential vitamins and minerals for energy and immunity.",
                "price": 19.00, "old_price": 24.00, "discount": 20, "rating": 4.6,
                "category": "health", "tags": "health, vitamins, supplement, organic",
                "image_url": "https://m.media-amazon.com/images/I/71F7X2tK5cL._AC_SL1500_.jpg"
            },
            {
                "name": "Deep Tissue Massage Gun",
                "description": "Quiet brushless motor massage gun with 6 speeds and 4 interchangeable applicator heads.",
                "price": 79.00, "old_price": 99.00, "discount": 20, "rating": 4.8,
                "category": "health", "tags": "health, massage, gun, recovery, fitness",
                "image_url": "https://m.media-amazon.com/images/I/71k8wDkR+wL._AC_SL1500_.jpg"
            },
            # 8. Gaming
            {
                "name": "Ergo-Gaming Chair",
                "description": "Premium ergonomic chair with 4D armrests and memory foam support for long gaming sessions.",
                "price": 269.00, "old_price": 299.00, "discount": 10, "rating": 4.4,
                "category": "gaming", "tags": "gaming, chair, ergo, furniture, comfort",
                "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzQacn-NIvRDQHMw1zyjdIQEHguHa6bEoNvg&s"
            },
            {
                "name": "Mechanical Gaming Keyboard",
                "description": "Anodized aluminum plate, tactile brown mechanical switches, and customizable RGB backlighting.",
                "price": 89.00, "old_price": 99.00, "discount": 10, "rating": 4.7,
                "category": "gaming", "tags": "gaming, keyboard, mechanical, rgb",
                "image_url": "https://m.media-amazon.com/images/I/81tX4Yh-uDL._AC_SL1500_.jpg"
            },
            {
                "name": "Wireless RGB Gaming Mouse",
                "description": "Ultra-lightweight gaming mouse with 25K DPI sensor, 70-hour battery life, and RGB scroll wheel.",
                "price": 59.00, "old_price": 69.00, "discount": 14, "rating": 4.6,
                "category": "gaming", "tags": "gaming, mouse, wireless, rgb",
                "image_url": "https://m.media-amazon.com/images/I/61k+M75iVXL._AC_SL1500_.jpg"
            },
            {
                "name": "Playstation 5 Controller DualSense",
                "description": "Immersive haptic feedback, dynamic adaptive triggers, and built-in microphone in a classic design.",
                "price": 69.00, "old_price": 75.00, "discount": 8, "rating": 4.9,
                "category": "gaming", "tags": "gaming, ps5, controller, playstation",
                "image_url": "https://m.media-amazon.com/images/I/61Z65-FNDOL._AC_SL1500_.jpg"
            },
            {
                "name": "Pro Gaming Headset (RGB)",
                "description": "7.1 surround sound audio, noise-canceling detachable mic, and signature memory foam comfort.",
                "price": 49.00, "old_price": 59.00, "discount": 16, "rating": 4.5,
                "category": "gaming", "tags": "gaming, headset, audio, rgb",
                "image_url": "https://m.media-amazon.com/images/I/61-H80b0DdL._AC_SL1500_.jpg"
            },
            {
                "name": "Curved Ultrawide Gaming Monitor 34\"",
                "description": "WQHD resolution, 144Hz refresh rate, 1ms response time, and HDR400 for stunning gaming details.",
                "price": 389.00, "old_price": 449.00, "discount": 13, "rating": 4.8,
                "category": "gaming", "tags": "gaming, monitor, screen, ultrawide, curved",
                "image_url": "https://m.media-amazon.com/images/I/71u+mXh+s2L._AC_SL1500_.jpg"
            }
        ]
        expanded_products = []
        prefixes = ["Elite", "Pro", "Ultra", "Max", "Supreme", "Classic", "Premium", "NextGen", "Smart", "Eco"]
        
        by_category = {}
        for p in products_data:
            cat = p["category"]
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(p)
            
        for cat, items in by_category.items():
            for idx in range(36):
                base_item = items[idx % len(items)]
                variant_num = (idx // len(items)) + 1
                prefix = prefixes[idx % len(prefixes)]
                
                if variant_num > 1:
                    name = f"{prefix} {base_item['name']} V{variant_num}"
                else:
                    name = f"{prefix} {base_item['name']}"
                
                price = round(base_item['price'] * (0.85 + 0.05 * (idx % 7)), 2)
                old_price = round(price * 1.25, 2)
                discount = base_item.get('discount', 10)
                rating = round(min(5.0, 3.8 + 0.1 * (idx % 13)), 1)
                
                expanded_products.append({
                    "name": name,
                    "description": f"{base_item['description']} This premium version offers enhanced performance, durability, and features.",
                    "price": price,
                    "old_price": old_price,
                    "discount": discount,
                    "bank_offer": base_item.get('bank_offer') if idx % 3 == 0 else None,
                    "rating": rating,
                    "category": cat,
                    "tags": base_item['tags'] + f", {prefix.lower()}",
                    "image_url": base_item['image_url']
                })

        for p_data in expanded_products:
            Product.objects.create(**p_data)

    if not Review.objects.exists():
        Review.objects.create(
            name="Alex S.",
            title="Blazing fast delivery!",
            text="I was shocked at how quickly my new laptop arrived. Ordered it on Monday, and it was at my door by Tuesday afternoon. NexBuy's delivery speed is unmatched.",
            rating=5
        )
        Review.objects.create(
            name="Jenna P.",
            title="This is a game-changer!",
            text="The AI assistant helped me find the *perfect* gift in under 5 minutes. It understood exactly what I was looking for. This is the future of online shopping.",
            rating=5
        )
        Review.objects.create(
            name="Mike K.",
            title="Great prices and solid support.",
            text="Found a camera drone here for $50 less than on Amazon. Had a question about the battery, and customer support got back to me in an hour. Highly recommend.",
            rating=4
        )
        Review.objects.create(
            name="David R.",
            title="NexBuy Pro is worth every penny.",
            text="I signed up for the Pro membership for the free 2-day shipping, but the exclusive deals are what kept me. I've already saved over $200 this year.",
            rating=5
        )
        Review.objects.create(
            name="Lisa W.",
            title="Finally found my go-to fashion store.",
            text="The fashion selection is surprisingly good. Everything is well-organized, and the 'shop the look' feature is genuinely useful. The return process was also painless.",
            rating=4
        )
        Review.objects.create(
            name="Chloe T.",
            title="The mobile app is flawless.",
            text="I do 90% of my shopping on my phone, and the NexBuy app is just so clean and fast. Checkout is just two taps. Love it.",
            rating=5
        )


def index_view(request):
    seed_db()
    plans = PricingPlan.objects.all().order_by('monthly_price')
    return render(request, 'NexBuy/index.html', {'plans': plans})


def product_view(request):
    seed_db()
    category = request.GET.get('category', 'electronics').lower()
    
    # Filter products where category matches OR tags contains the category string
    from django.db.models import Q
    products = Product.objects.filter(
        Q(category=category) | Q(tags__icontains=category)
    ).order_by('-rating')
    
    return render(request, 'NexBuy/product.html', {
        'products': products,
        'current_category': category
    })


def testimonial_view(request):
    seed_db()
    if request.method == 'POST':
        name = request.POST.get('name')
        title = request.POST.get('title')
        rating = request.POST.get('rating', '5')
        text = request.POST.get('text')
        
        try:
            rating_val = int(rating)
        except ValueError:
            rating_val = 5

        Review.objects.create(
            name=name,
            title=title,
            rating=rating_val,
            text=text
        )
        messages.success(request, "Review submitted successfully!")
        return redirect('testimonial')

    reviews = Review.objects.all().order_by('-created_at')
    
    # Calculate stats
    total_reviews = reviews.count()
    avg_rating_val = reviews.aggregate(Avg('rating'))['rating__avg']
    avg_rating = round(avg_rating_val, 1) if avg_rating_val else 5.0
    
    # Stars distribution (5 to 1)
    distribution = {}
    for r in range(5, 0, -1):
        count = reviews.filter(rating=r).count()
        percentage = int((count / total_reviews) * 100) if total_reviews > 0 else 0
        distribution[r] = percentage

    return render(request, 'NexBuy/testimonial.html', {
        'reviews': reviews,
        'total_reviews': total_reviews,
        'avg_rating': avg_rating,
        'distribution': distribution
    })


def contact_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')

        # Auto generate summary
        if len(message) > 120:
            summary = message[:120] + "..."
        else:
            summary = message

        ContactMessage.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message,
            summary=summary
        )
        messages.success(request, "Message sent successfully!")
        return redirect('contact')

    complaints = ContactMessage.objects.all().order_by('-created_at')
    return render(request, 'NexBuy/Contact.html', {'complaints': complaints})


def complaint_detail_view(request, pk):
    from django.shortcuts import get_object_or_404
    complaint = get_object_or_404(ContactMessage, pk=pk)
    
    if not complaint.summary:
        if len(complaint.message) > 120:
            complaint.summary = complaint.message[:120] + "..."
        else:
            complaint.summary = complaint.message
        complaint.save()
        
    return render(request, 'NexBuy/complaint_detail.html', {'complaint': complaint})


def sign_in_view(request):
    error = None
    if request.method == 'POST':
        action = request.POST.get('action') # 'login' or 'signup'
        next_url = request.GET.get('next') or request.POST.get('next')
        
        if action == 'login':
            email = request.POST.get('email')
            password = request.POST.get('password')
            
            # Authenticate using email as username
            user = User.objects.filter(email=email).first()
            if user:
                authenticated_user = authenticate(username=user.username, password=password)
                if authenticated_user:
                    login(request, authenticated_user)
                    if next_url:
                        return redirect(next_url)
                    return redirect('index')
            
            error = "Invalid email or password."
            
        elif action == 'signup':
            name = request.POST.get('name')
            email = request.POST.get('email')
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm-password')
            
            if password != confirm_password:
                error = "Passwords do not match."
            elif User.objects.filter(email=email).exists():
                error = "A user with this email already exists."
            else:
                user = User.objects.create_user(username=email, email=email, password=password)
                user.first_name = name
                user.save()
                
                # Auto-login after registration
                login(request, user)
                if next_url:
                    return redirect(next_url)
                return redirect('index')
                
    return render(request, 'NexBuy/sign_In.html', {'error': error})


def logout_view(request):
    logout(request)
    return redirect('index')


def aboutus_view(request):
    return render(request, 'NexBuy/aboutus.html')


from django.contrib.auth.decorators import login_required

@login_required(login_url='sign_in')
def subscription_view(request):
    return render(request, 'NexBuy/subscription.html')


@login_required(login_url='sign_in')
def order_success_view(request):
    return render(request, 'NexBuy/order_success.html')

@login_required
def profile_view(request):
    user = request.user
    profile = user.profile
    
    if request.method == 'POST':
        name = request.POST.get('name')
        if name is not None:
            user.first_name = name
            user.save()
            
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()
            
        messages.success(request, "Profile updated successfully!")
        return redirect('profile')
        
    return render(request, 'NexBuy/profile.html')


@login_required(login_url='sign_in')
def place_order_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            payment_mode = data.get('payment_mode', 'Credit/Debit Card')
            items = data.get('items', [])
            
            if not items:
                return JsonResponse({'status': 'error', 'message': 'No items in cart'}, status=400)
            
            total_rupees = 0
            total_dollars = 0
            for item in items:
                qty = int(item.get('quantity', 1))
                price = float(item.get('price', 0))
                currency = item.get('currency', '₹')
                if currency == '$':
                    total_dollars += price * qty
                else:
                    total_rupees += price * qty
                    
            order_number = f"NB-{uuid.uuid4().hex[:8].upper()}"
            order = Order.objects.create(
                user=request.user,
                order_number=order_number,
                payment_mode=payment_mode,
                total_rupees=total_rupees,
                total_dollars=total_dollars,
                status='placed'
            )
            
            for item in items:
                OrderItem.objects.create(
                    order=order,
                    product_name=item.get('name'),
                    price=item.get('price', 0),
                    currency=item.get('currency', '₹'),
                    quantity=item.get('quantity', 1),
                    image_url=item.get('image', '')
                )
                
            return JsonResponse({'status': 'success', 'order_number': order_number})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=405)


@login_required(login_url='sign_in')
def orders_view(request):
    orders = request.user.orders.all().order_by('-created_at')
    return render(request, 'NexBuy/orders.html', {'orders': orders})


@login_required(login_url='sign_in')
def return_order_view(request, order_id):
    if request.method == 'POST':
        from django.shortcuts import get_object_or_404
        order = get_object_or_404(Order, pk=order_id, user=request.user)
        reason = request.POST.get('reason', 'Other')
        comments = request.POST.get('comments', '')
        
        order.status = 'returning'
        order.return_reason = f"{reason}: {comments}".strip()
        order.return_date = timezone.now()
        order.save()
        
        messages.success(request, f"Return request for order {order.order_number} submitted successfully!")
        return redirect('orders')
    return redirect('orders')


@login_required(login_url='sign_in')
def settings_view(request):
    user = request.user
    profile = user.profile
    
    if request.method == 'POST':
        name = request.POST.get('name')
        phone = request.POST.get('phone_number')
        street = request.POST.get('street_address')
        city = request.POST.get('city')
        state = request.POST.get('state')
        zip_code = request.POST.get('zip_code')
        country = request.POST.get('country', 'India')
        email_notif = request.POST.get('email_notifications') == 'on'
        lang = request.POST.get('preferred_language', 'English')
        
        if name:
            user.first_name = name
            user.save()
            
        profile.phone_number = phone
        profile.street_address = street
        profile.city = city
        profile.state = state
        profile.zip_code = zip_code
        profile.country = country
        profile.email_notifications = email_notif
        profile.preferred_language = lang
        
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
            
        profile.save()
        messages.success(request, "Settings updated successfully!")
        return redirect('settings')
        
    return render(request, 'NexBuy/settings.html', {'profile': profile})


@login_required(login_url='sign_in')
def change_password_view(request):
    from django.contrib.auth import update_session_auth_hash
    from django.contrib.auth.forms import PasswordChangeForm
    
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            messages.success(request, 'Your password was successfully updated!')
            return redirect('settings')
        else:
            error_msg = "Please correct the error below."
            for field, errors in form.errors.items():
                error_msg = f"{errors[0]}"
                break
            messages.error(request, error_msg)
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'NexBuy/change_password.html', {'form': form})

