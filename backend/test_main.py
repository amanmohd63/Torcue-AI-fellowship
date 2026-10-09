import pytest
from fastapi.testclient import TestClient
from main import app
from agent import get_order_by_id, filter_orders, calculate_revenue, get_top_customer

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Order Assistant API is running."}

def test_chat_empty_messages():
    response = client.post("/chat", json={"messages": []})
    assert response.status_code == 400

def test_chat_invalid_messages():
    response = client.post("/chat", json={"messages": [{"role": "user"}]})
    assert response.status_code == 400

# Testing Tool Functions locally
def test_get_order_by_id_not_found():
    res = get_order_by_id("INVALID-ID")
    assert "error" in res

def test_filter_orders():
    res = filter_orders(status="Cancelled")
    assert "count" in res or "message" in res
    
def test_calculate_revenue():
    res = calculate_revenue(category="Electronics", month=8)
    assert "total_revenue_inr" in res

def test_get_top_customer():
    res = get_top_customer()
    assert "customer_name" in res
