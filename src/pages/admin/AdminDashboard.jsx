import { useEffect, useState } from "react";
import { Link } from "react-router";

import { getDashboardStats } from "../../services/adminService";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-EG");

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;

const statCards = [
  {
    key: "total_orders",
    label: "Total Orders",
  },
  {
    key: "new_orders",
    label: "New",
  },
  {
    key: "confirmed_orders",
    label: "Confirmed",
  },
  {
    key: "processing_orders",
    label: "Processing / Printing",
  },
  {
    key: "delivery_orders",
    label: "Ready for Delivery",
  },
  {
    key: "delivered_orders",
    label: "Delivered",
  },
  {
    key: "cancelled_orders",
    label: "Cancelled",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const response = await getDashboardStats();

        if (mounted) {
          setStats(response);
        }
      } catch (dashboardError) {
        console.error("Admin dashboard error:", dashboardError);

        if (mounted) {
          setError(
            dashboardError?.message ||
              "Dashboard statistics could not be loaded.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-300 border-t-black" />

          <p className="mt-4 text-neutral-500">Loading dashboard...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          TeeLab Administration
        </p>

        <h1 className="mt-2 text-3xl font-black">Dashboard</h1>

        <div
          role="alert"
          className="mt-6 border border-red-200 bg-red-50 p-5 text-red-700"
        >
          {error}
        </div>
      </section>
    );
  }

  const dashboardStats = stats || {};

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            TeeLab Administration
          </p>

          <h1 className="mt-2 text-3xl font-black">Dashboard</h1>

          <p className="mt-2 text-neutral-500">
            Overview of your TeeLab orders and revenue.
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="border border-black bg-white px-5 py-3 font-semibold transition hover:bg-black hover:text-white"
        >
          View All Orders
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label }) => (
          <article key={key} className="border border-neutral-200 bg-white p-6">
            <p className="text-sm font-medium text-neutral-500">{label}</p>

            <p className="mt-3 text-4xl font-black">
              {formatNumber(dashboardStats[key])}
            </p>
          </article>
        ))}

        <article className="border border-neutral-200 bg-white p-6">
          <p className="text-sm font-medium text-neutral-500">
            Today&apos;s Revenue
          </p>

          <p className="mt-3 text-3xl font-black">
            {formatMoney(dashboardStats.today_revenue)}
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="border border-neutral-200 bg-white p-6">
          <p className="text-sm font-medium text-neutral-500">Total Revenue</p>

          <p className="mt-3 text-3xl font-black">
            {formatMoney(dashboardStats.total_revenue)}
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Revenue from all non-cancelled orders.
          </p>
        </article>

        <article className="border border-neutral-200 bg-white p-6">
          <p className="text-sm font-medium text-neutral-500">
            Delivered Revenue
          </p>

          <p className="mt-3 text-3xl font-black">
            {formatMoney(dashboardStats.delivered_revenue)}
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Revenue from delivered orders only.
          </p>
        </article>

        <article className="border border-neutral-200 bg-white p-6">
          <p className="text-sm font-medium text-neutral-500">
            Revenue This Month
          </p>

          <p className="mt-3 text-3xl font-black">
            {formatMoney(dashboardStats.month_revenue)}
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Revenue since the beginning of this month.
          </p>
        </article>
      </div>

      <div className="mt-6 border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Orders requiring attention</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Review new and active orders from the orders page.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/orders?status=new"
              className="border border-black px-5 py-3 text-sm font-semibold"
            >
              New Orders: {formatNumber(dashboardStats.new_orders)}
            </Link>

            <Link
              to="/admin/orders"
              className="bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Manage Orders
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
