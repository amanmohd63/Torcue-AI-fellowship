import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingCart, IndianRupee, Ban, Tag, LayoutDashboard } from 'lucide-react';
import Chatbot from './Chatbot';
import Logo from './Logo';
import './App.css';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/dashboard`);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading Dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="loading-screen">Failed to load dashboard. Ensure the backend is running.</div>;
  }

  const { totalRevenue, totalOrders, monthlyData, statusCounts, topCategory } = dashboardData;
  const cancelledOrders = statusCounts['cancelled'] || statusCounts['Cancelled'] || 0;

  return (
    <div className="app-layout">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Logo />
          <h1>StoreDash</h1>
        </div>
        <div className="nav-links">
          <div className="nav-item active"><LayoutDashboard size={20} /> Dashboard</div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h2>Overview</h2>
          <p>Welcome back! Here's what's happening with your store.</p>
        </header>

        {/* Top Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon blue"><IndianRupee size={24} /></div>
            <div className="metric-info">
              <p>Total Revenue</p>
              <h3>₹{totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon green"><ShoppingCart size={24} /></div>
            <div className="metric-info">
              <p>Total Orders</p>
              <h3>{totalOrders}</h3>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon red"><Ban size={24} /></div>
            <div className="metric-info">
              <p>Cancelled Orders</p>
              <h3>{cancelledOrders}</h3>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon purple"><Tag size={24} /></div>
            <div className="metric-info">
              <p>Top Category</p>
              <h3>{topCategory}</h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card">
            <h3>Revenue Overview (Monthly)</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      {/* Chatbot Pop-up Widget */}
      <Chatbot />
    </div>
  );
}

export default App;
