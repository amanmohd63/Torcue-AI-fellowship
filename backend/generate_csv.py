import csv
import random
from datetime import datetime, timedelta

columns = ["order_id", "order_date", "customer_name", "city", "product", "category", "quantity", "unit_price_inr", "total_inr", "payment_method", "status"]

categories = {
    "Electronics": [("Laptop", 50000), ("Smartphone", 20000), ("Headphones", 2000), ("Monitor", 8000)],
    "Clothing": [("T-Shirt", 500), ("Jeans", 1500), ("Jacket", 3000), ("Sneakers", 2500)],
    "Home": [("Desk Lamp", 800), ("Office Chair", 4000), ("Coffee Maker", 2500)]
}

cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune"]
payment_methods = ["Credit Card", "UPI", "Debit Card", "Net Banking"]
statuses = ["Delivered", "Delivered", "Delivered", "Cancelled", "Shipped", "Processing"]
names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Saanvi", "Aanya", "Aadhya", "Aaradhya", "Ananya", "Pari", "Diya", "Nandini"]

start_date = datetime(2026, 6, 1)
end_date = datetime(2026, 9, 30)
days_diff = (end_date - start_date).days

data = []
for i in range(1, 61):
    order_id = f"ORD-{1000 + i}"
    random_days = random.randint(0, days_diff)
    order_date = (start_date + timedelta(days=random_days)).strftime("%Y-%m-%d")
    customer_name = random.choice(names)
    city = random.choice(cities)
    
    category = random.choice(list(categories.keys()))
    product, unit_price = random.choice(categories[category])
    
    quantity = random.randint(1, 5)
    total_inr = unit_price * quantity
    payment_method = random.choice(payment_methods)
    status = random.choice(statuses)
    
    data.append([order_id, order_date, customer_name, city, product, category, quantity, unit_price, total_inr, payment_method, status])

with open("orders.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(columns)
    writer.writerows(data)

print("orders.csv generated successfully.")
