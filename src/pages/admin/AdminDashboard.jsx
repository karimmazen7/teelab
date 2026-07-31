import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getDashboardStats } from "../../services/adminService";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-EG");

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;

const statusCards = [
  {
    key: "total_orders",
    label: "Total orders",
    color: "#8b5cf6",
  },
  {
    key: "new_orders",
    label: "New orders",
    color: "#0ea5e9",
  },
  {
    key: "confirmed_orders",
    label: "Confirmed orders",
    color: "#14b8a6",
  },
  {
    key: "processing_orders",
    label: "Processing / Printing",
    color: "#f59e0b",
  },
  {
    key: "delivery_orders",
    label: "Ready for delivery",
    color: "#6366f1",
  },
  {
    key: "delivered_orders",
    label: "Delivered orders",
    color: "#22c55e",
  },
  {
    key: "cancelled_orders",
    label: "Cancelled orders",
    color: "#ef4444",
  },
];

function TrendBadge({ positive = true, value = "0%" }) {
  return (
    <span
      className={`text-xs font-semibold ${
        positive ? "text-emerald-600" : "text-red-500"
      }`}
    >
      {positive ? "↑" : "↓"} {value}
    </span>
  );
}

function MiniChart({ color = "#8b5cf6", variant = 1 }) {
  const paths = {
    1: "M0 78 L18 75 L34 73 L49 76 L64 70 L81 72 L96 22 L111 75 L128 71 L145 69 L160 74 L177 18 L194 71 L220 67",
    2: "M0 70 L20 67 L38 55 L56 73 L74 42 L92 62 L110 38 L128 68 L146 52 L164 69 L182 30 L200 52 L220 43",
    3: "M0 65 L20 66 L40 62 L60 25 L80 69 L100 64 L120 32 L140 70 L160 68 L180 45 L200 65 L220 58",
    4: "M0 72 L25 70 L45 35 L65 68 L85 52 L105 59 L125 40 L145 65 L165 56 L185 63 L205 45 L220 48",
  };

  return (
    <div className="mt-5">
      <svg
        viewBox="0 0 220 90"
        className="h-24 w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[18, 36, 54, 72].map((line) => (
          <line
            key={line}
            x1="0"
            x2="220"
            y1={line}
            y2={line}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        ))}

        <path
          d={paths[variant]}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2"
          opacity="0.8"
          transform="translate(0 -5)"
        />

        <path
          d={paths[variant]}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="flex justify-between text-[10px] text-neutral-400">
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>Now</span>
      </div>

      <div className="mt-3 flex justify-end gap-4 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-neutral-300" />
          Yesterday
        </span>

        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ backgroundColor: color }}
          />
          Today
        </span>
      </div>
    </div>
  );
}

function AnalyticsCard({
  title,
  value,
  trend,
  description,
  color = "#8b5cf6",
  variant = 1,
  reportLink = "/admin/orders",
}) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-semibold text-neutral-700">{title}</h2>

            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-200 text-[9px] font-bold text-neutral-500">
              i
            </span>
          </div>

          <p className="mt-2 text-2xl font-medium tracking-tight text-neutral-800">
            {value}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Link
            to={reportLink}
            className="text-[11px] font-medium text-cyan-700 hover:underline"
          >
            View report
          </Link>

          {trend && <TrendBadge value={trend} />}
        </div>
      </div>

      {description && (
        <p className="mt-2 text-xs text-neutral-400">{description}</p>
      )}

      <MiniChart color={color} variant={variant} />
    </article>
  );
}

function StatusList({ stats }) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold text-neutral-700">
          Orders by status
        </h2>

        <Link
          to="/admin/orders"
          className="text-[11px] font-medium text-cyan-700 hover:underline"
        >
          View report
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        {statusCards.slice(1).map(({ key, label, color }) => {
          const total = Number(stats.total_orders || 0);
          const value = Number(stats[key] || 0);
          const percentage = total > 0 ? (value / total) * 100 : 0;

          return (
            <Link
              key={key}
              to={`/admin/orders?status=${key.replace("_orders", "")}`}
              className="block"
            >
              <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
                <span className="font-medium text-neutral-600">{label}</span>

                <span className="font-semibold text-neutral-800">
                  {formatNumber(value)}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.max(percentage, value > 0 ? 4 : 0)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </article>
  );
}

function RevenueBreakdown({ stats }) {
  const rows = [
    {
      label: "Today's revenue",
      value: stats.today_revenue,
      color: "bg-cyan-500",
    },
    {
      label: "This month",
      value: stats.month_revenue,
      color: "bg-violet-500",
    },
    {
      label: "Delivered revenue",
      value: stats.delivered_revenue,
      color: "bg-emerald-500",
    },
    {
      label: "Total revenue",
      value: stats.total_revenue,
      color: "bg-neutral-800",
    },
  ];

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-neutral-700">
          Revenue summary
        </h2>

        <Link
          to="/admin/orders"
          className="text-[11px] font-medium text-cyan-700 hover:underline"
        >
          View report
        </Link>
      </div>

      <div className="mt-5 divide-y divide-neutral-100">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-sm ${row.color}`} />

              <span className="text-xs text-neutral-600">{row.label}</span>
            </div>

            <span className="text-xs font-semibold text-neutral-800">
              {formatMoney(row.value)}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function AttentionCard({ stats }) {
  const attentionOrders =
    Number(stats.new_orders || 0) +
    Number(stats.confirmed_orders || 0) +
    Number(stats.processing_orders || 0);

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-neutral-700">
          Orders requiring attention
        </h2>

        <Link
          to="/admin/orders"
          className="text-[11px] font-medium text-cyan-700 hover:underline"
        >
          Manage
        </Link>
      </div>

      <p className="mt-4 text-3xl font-medium text-neutral-800">
        {formatNumber(attentionOrders)}
      </p>

      <p className="mt-1 text-xs text-neutral-400">
        New, confirmed and processing orders
      </p>

      <div className="mt-5 space-y-3">
        {[
          {
            label: "New orders",
            value: stats.new_orders,
            color: "bg-sky-500",
            status: "new",
          },
          {
            label: "Confirmed",
            value: stats.confirmed_orders,
            color: "bg-teal-500",
            status: "confirmed",
          },
          {
            label: "Processing",
            value: stats.processing_orders,
            color: "bg-amber-500",
            status: "processing",
          },
        ].map((item) => (
          <Link
            key={item.label}
            to={`/admin/orders?status=${item.status}`}
            className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2.5 transition hover:bg-neutral-100"
          >
            <span className="flex items-center gap-2 text-xs text-neutral-600">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              {item.label}
            </span>

            <span className="text-xs font-bold text-neutral-800">
              {formatNumber(item.value)}
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}

function LoadingDashboard() {
  return (
    <section className="min-h-screen bg-[#f6f6f7] p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px] animate-pulse">
        <div className="h-8 w-64 rounded bg-neutral-200" />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="h-72 rounded-lg border border-neutral-200 bg-white p-5"
            >
              <div className="h-3 w-32 rounded bg-neutral-200" />
              <div className="mt-4 h-7 w-24 rounded bg-neutral-200" />
              <div className="mt-8 h-32 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
    return <LoadingDashboard />;
  }

  if (error) {
    return (
      <section className="min-h-screen bg-[#f6f6f7] p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            TeeLab Administration
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
            Overview dashboard
          </h1>

          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}
          </div>
        </div>
      </section>
    );
  }

  const dashboardStats = stats || {};

  return (
    <section className="min-h-screen bg-[#f6f6f7] p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-500">
              TeeLab Administration
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
              Overview dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm">
              Today
            </div>

            <Link
              to="/admin/orders"
              className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black"
            >
              View all orders
            </Link>
          </div>
        </header>

        <div className="mt-5 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-4">
            <AnalyticsCard
              title="Total revenue"
              value={formatMoney(dashboardStats.total_revenue)}
              trend="3.2%"
              description="Revenue from all non-cancelled orders"
              color="#8b5cf6"
              variant={1}
            />

            <AnalyticsCard
              title="Total orders"
              value={formatNumber(dashboardStats.total_orders)}
              trend="9.2%"
              description="Orders over time"
              color="#8b5cf6"
              variant={3}
            />

            <StatusList stats={dashboardStats} />
          </div>

          <div className="space-y-4">
            <AnalyticsCard
              title="Today's revenue"
              value={formatMoney(dashboardStats.today_revenue)}
              trend="9.6%"
              description="Sales generated today"
              color="#14b8a6"
              variant={2}
            />

            <AnalyticsCard
              title="Revenue this month"
              value={formatMoney(dashboardStats.month_revenue)}
              trend="3.6%"
              description="Revenue since the beginning of this month"
              color="#8b5cf6"
              variant={4}
            />

            <AttentionCard stats={dashboardStats} />
          </div>

          <div className="space-y-4 md:col-span-2 xl:col-span-1">
            <AnalyticsCard
              title="Delivered revenue"
              value={formatMoney(dashboardStats.delivered_revenue)}
              trend="2.6%"
              description="Revenue from delivered orders only"
              color="#14b8a6"
              variant={2}
            />

            <AnalyticsCard
              title="Delivered orders"
              value={formatNumber(dashboardStats.delivered_orders)}
              trend="6.7%"
              description="Successfully completed orders"
              color="#8b5cf6"
              variant={4}
            />

            <RevenueBreakdown stats={dashboardStats} />

            <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-semibold text-neutral-700">
                Quick actions
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  to="/admin/orders?status=new"
                  className="rounded-md border border-neutral-200 px-3 py-3 text-center text-xs font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  New orders
                </Link>

                <Link
                  to="/admin/orders"
                  className="rounded-md bg-neutral-900 px-3 py-3 text-center text-xs font-semibold text-white transition hover:bg-black"
                >
                  Manage orders
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
