import { TruckIcon, TriangleAlertIcon, CalendarX2Icon, ShoppingCart, IndianRupee, Ban } from 'lucide-react'
import { Card } from '@/components/ui/card'

import ProductInsightsCard from '@/views/dashboards/widgets/widget-product-insights'
import SalesMetricsCard from '@/views/dashboards/charts/chart-sales-metrics'
import StatisticsCard from '@/views/dashboards/statistics/statistics-card-01'
import TotalEarningCard from '@/views/dashboards/widgets/widget-total-earning'
import TransactionDatatable, { type Item } from '@/views/datatables/datatable-transaction'
import AssistantWidget from '@/components/AssistantWidget'

export const dynamic = 'force-dynamic';

export default async function OrdersDashboard() {
  let metrics = null;
  let ordersList = null;
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    
    // Fetch metrics
    const metricsRes = await fetch(`${backendUrl}/api/dashboard`, { cache: 'no-store' });
    if(metricsRes.ok) metrics = await metricsRes.json();
    
    // Fetch all orders
    const ordersRes = await fetch(`${backendUrl}/api/orders`, { cache: 'no-store' });
    if(ordersRes.ok) ordersList = await ordersRes.json();
    
  } catch (e) {
    console.error("Failed to fetch data from backend", e);
  }

  // Fallback to empty if backend is offline
  if (!metrics) {
    metrics = {
      totalRevenue: 0,
      totalOrders: 0,
      statusCounts: { cancelled: 0 },
      topCategory: 'N/A',
      monthlyData: []
    };
  }

  const cancelledOrders = metrics.statusCounts?.cancelled || metrics.statusCounts?.Cancelled || 0;

  // Convert our database records to the 'Item' format expected by the template's TransactionDatatable
  const transactionData: Item[] = (ordersList || []).map((order: any) => ({
    id: String(order.order_id),
    avatar: '/images/avatars/avatar-1.webp', // dummy avatar
    avatarFallback: order.customer_name?.slice(0, 2).toUpperCase() || 'CU',
    name: order.customer_name,
    amount: order.total_inr,
    status: (order.status || '').toLowerCase() === 'delivered' ? 'paid' : 
            (order.status || '').toLowerCase() === 'cancelled' ? 'failed' : 'pending',
    email: `${order.customer_name?.split(' ')[0].toLowerCase()}@example.com`,
    paidBy: (order.payment_method || '').toLowerCase() === 'credit card' ? 'visa' : 'mastercard'
  }));

  const StatisticsCardData = [
    {
      icon: <IndianRupee className='size-4' />,
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      title: 'Total Revenue',
      changePercentage: '+12.5%'
    },
    {
      icon: <ShoppingCart className='size-4' />,
      value: String(metrics.totalOrders),
      title: 'Total Orders',
      changePercentage: '+5.2%'
    },
    {
      icon: <Ban className='size-4' />,
      value: String(cancelledOrders),
      title: 'Cancelled Orders',
      changePercentage: '-2.1%'
    }
  ]

  return (
    <div className='grid grid-cols-2 gap-6 lg:grid-cols-3'>
      {/* Dynamic Statistics Cards */}
      <div className='col-span-full grid gap-6 sm:grid-cols-3 md:max-lg:grid-cols-1'>
        {StatisticsCardData.map((card, index) => (
          <StatisticsCard
            key={index}
            icon={card.icon}
            title={card.title}
            value={card.value}
            changePercentage={card.changePercentage}
          />
        ))}
      </div>

      <div className='grid gap-6 max-xl:col-span-full xl:col-span-3 lg:grid-cols-2'>
        <AssistantWidget />
        <TotalEarningCard
          title={`Top Category: ${metrics.topCategory}`}
          earning={24650}
          trend='up'
          percentage={15}
          comparisonText='Compare to last year ($84,325)'
          earningData={[]}
          className='justify-between gap-5 sm:min-w-0'
        />
      </div>

      {/* We can pass real data into these components if we dive into them, 
          but for now we map our real orders into the table below */}

      <Card className='col-span-full w-full py-0'>
        <div className="p-6 pb-2 border-b">
          <h3 className="text-lg font-medium">Recent Orders from Database</h3>
          <p className="text-sm text-muted-foreground">Showing 60 real orders from our Pandas backend</p>
        </div>
        <TransactionDatatable data={transactionData} />
      </Card>
    </div>
  )
}
