import os
import json
import pandas as pd
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# We need an async client for FastAPI
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load data once
df = pd.read_csv("orders.csv")

# Tools Implementation
def get_order_by_id(order_id: str) -> str:
    """Get the details of a specific order by its ID."""
    result = df[df["order_id"] == order_id]
    if result.empty:
        return json.dumps({"error": f"Order {order_id} not found."})
    return result.to_json(orient="records")

def filter_orders(status: str = None, category: str = None) -> str:
    """Filter orders by status or category and return the count and some details."""
    filtered = df
    if status:
        filtered = filtered[filtered["status"].str.lower() == status.lower()]
    if category:
        filtered = filtered[filtered["category"].str.lower() == category.lower()]
    
    if filtered.empty:
        return json.dumps({"message": "No orders found matching criteria."})
    
    summary = {
        "count": len(filtered),
        "total_revenue_inr": int(filtered["total_inr"].sum()),
        "sample_orders": filtered.head(5).to_dict(orient="records")
    }
    return json.dumps(summary)

def calculate_revenue(category: str = None, month: int = None) -> str:
    """Calculate total revenue, optionally filtered by category or month (1-12)."""
    filtered = df.copy()
    filtered['order_date'] = pd.to_datetime(filtered['order_date'])
    
    if category:
        filtered = filtered[filtered["category"].str.lower() == category.lower()]
    if month:
        filtered = filtered[filtered["order_date"].dt.month == month]
        
    revenue = int(filtered["total_inr"].sum())
    return json.dumps({
        "category": category,
        "month": month,
        "total_revenue_inr": revenue,
        "order_count": len(filtered)
    })

def get_top_customer() -> str:
    """Find out which customer has spent the most."""
    customer_spending = df.groupby("customer_name")["total_inr"].sum().reset_index()
    top_customer = customer_spending.sort_values(by="total_inr", ascending=False).iloc[0]
    return json.dumps({
        "customer_name": top_customer["customer_name"],
        "total_spent_inr": int(top_customer["total_inr"])
    })

# Tools definitions for OpenAI
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_order_by_id",
            "description": "Get details of a specific order using its order_id (e.g., ORD-1025).",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string", "description": "The order ID to look up."}
                },
                "required": ["order_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "filter_orders",
            "description": "Filter orders by status (e.g., Cancelled, Delivered) or category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "description": "Status to filter by."},
                    "category": {"type": "string", "description": "Category to filter by."}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_revenue",
            "description": "Calculate total revenue. Optionally filter by category and/or month (1-12).",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "Product category (e.g., Electronics, Home)."},
                    "month": {"type": "integer", "description": "Month as an integer (e.g., 8 for August)."}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_customer",
            "description": "Find which customer has spent the most in total.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    }
]

available_functions = {
    "get_order_by_id": get_order_by_id,
    "filter_orders": filter_orders,
    "calculate_revenue": calculate_revenue,
    "get_top_customer": get_top_customer,
}

system_prompt = """You are the Order Assistant, an AI that helps users with their e-commerce store queries.
You have access to a dataset of 60 orders from June to September 2026.
Use the provided tools to fetch order data and calculate metrics.
Always answer politely and concisely. If a tool returns an error or no data, inform the user clearly.
"""

async def chat_with_agent(messages: list) -> str:
    # Ensure system prompt is present
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, {"role": "system", "content": system_prompt})
        
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )
    except Exception as e:
        return f"Error connecting to AI: {str(e)}"
        
    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    if tool_calls:
        messages.append(response_message)
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_to_call = available_functions.get(function_name)
            if function_to_call:
                function_args = json.loads(tool_call.function.arguments)
                function_response = function_to_call(**function_args)
                messages.append(
                    {
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": function_response,
                    }
                )
        
        # Second call to get the final answer
        try:
            second_response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
            )
            return second_response.choices[0].message.content
        except Exception as e:
            return f"Error during tool evaluation: {str(e)}"

    return response_message.content
