import os
import json
import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load data once
df = pd.read_csv("orders.csv")

# Tools Implementation
def get_order_by_id(order_id: str) -> dict:
    """Get the details of a specific order by its ID."""
    result = df[df["order_id"] == order_id]
    if result.empty:
        return {"error": f"Order {order_id} not found."}
    return result.to_dict(orient="records")[0]

def filter_orders(status: str = None, category: str = None) -> dict:
    """Filter orders by status (e.g. Cancelled) or category and return the count and some details."""
    filtered = df
    if status:
        filtered = filtered[filtered["status"].str.lower() == status.lower()]
    if category:
        filtered = filtered[filtered["category"].str.lower() == category.lower()]
    
    if filtered.empty:
        return {"message": "No orders found matching criteria."}
    
    return {
        "count": len(filtered),
        "total_revenue_inr": int(filtered["total_inr"].sum()),
        "sample_orders": filtered.head(5).to_dict(orient="records")
    }

def calculate_revenue(category: str = None, month: int = None) -> dict:
    """Calculate total revenue, optionally filtered by category or month (1-12)."""
    filtered = df.copy()
    filtered['order_date'] = pd.to_datetime(filtered['order_date'])
    
    if category:
        filtered = filtered[filtered["category"].str.lower() == category.lower()]
    if month:
        filtered = filtered[filtered["order_date"].dt.month == month]
        
    return {
        "category": category,
        "month": month,
        "total_revenue_inr": int(filtered["total_inr"].sum()),
        "order_count": len(filtered)
    }

def get_top_customer() -> dict:
    """Find out which customer has spent the most."""
    customer_spending = df.groupby("customer_name")["total_inr"].sum().reset_index()
    top_customer = customer_spending.sort_values(by="total_inr", ascending=False).iloc[0]
    return {
        "customer_name": str(top_customer["customer_name"]),
        "total_spent_inr": int(top_customer["total_inr"])
    }

system_prompt = """You are the Order Assistant, an AI that helps users with their e-commerce store queries.
You have access to a dataset of 60 orders from June to September 2026.
Use the provided tools to fetch order data and calculate metrics.
Always answer politely and concisely. If a tool returns an error or no data, inform the user clearly."""

# Initialize the model with the tools and system prompt
model = genai.GenerativeModel(
    model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    tools=[get_order_by_id, filter_orders, calculate_revenue, get_top_customer],
    system_instruction=system_prompt
)

async def chat_with_agent(messages: list) -> str:
    # Convert frontend messages to Gemini history format
    gemini_history = []
    
    # Extract the last message which is the current prompt
    if not messages:
        return "No messages provided."
        
    current_message = messages[-1]["content"]
    
    # Process history (excluding the current message)
    # also skip system messages if any got passed
    for msg in messages[:-1]:
        if msg.get("role") == "system":
            continue
        role = "model" if msg["role"] == "assistant" else "user"
        gemini_history.append({"role": role, "parts": [msg["content"]]})
        
    try:
        # Start chat with history and enable automatic tool calling
        chat = model.start_chat(
            history=gemini_history,
            enable_automatic_function_calling=True
        )
        
        response = await chat.send_message_async(current_message)
        return response.text
    except Exception as e:
        return f"Error communicating with Gemini: {str(e)}"
