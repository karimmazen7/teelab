import { useEffect, useState } from "react";
import { Link } from "react-router";

import OrderStatusBadge from "../../components/admin/OrderStatusBadge";
import { getOrders } from "../../services/adminService";

const statuses = [
  "new",
  "confirmed",
  "processing",
  "printing",
  "ready",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

const paymentStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
];

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG")} EGP`;

const formatPaymentMethod = (value) => {
  if (value === "cash_on_delivery") {
    return "Cash on Delivery";
  }

  return value ? value.replaceAll("_", " ") : "—";
};

export default function AdminOrders() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    paymentStatus: "all",
    sort: "newest",
    page: 1,
    pageSize: 20,
  });

  const [result, setResult] = useState({
    orders: [],
    count: 0,
    page: 1,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError("");

    const timer = window.setTimeout(() => {
      getOrders(filters)
        .then((response) => {
          if (isMounted) {
            setResult(response);
          }
        })
        .catch((loadError) => {
          console.error("Admin orders page error:", loadError);

          if (isMounted) {
            setError(loadError?.message || "Orders could not be loaded.");
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    }, 250);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            TeeLab administration
          </p>

          <h1 className="mt-2 text-3xl font-black">Orders</h1>
        </div>

        <p className="text-sm text-neutral-500">
          {result.count} {result.count === 1 ? "order" : "orders"}
        </p>
      </div>

      <div className="mt-6 grid gap-3 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
        <input
          type="search"
          placeholder="Order, customer or phone"
          className="border border-neutral-300 bg-white p-3 outline-none transition focus:border-black"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
        />

        <select
          className="border border-neutral-300 bg-white p-3 outline-none transition focus:border-black"
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
        >
          <option value="all">All statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <select
          className="border border-neutral-300 bg-white p-3 outline-none transition focus:border-black"
          value={filters.paymentStatus}
          onChange={(event) =>
            updateFilter("paymentStatus", event.target.value)
          }
        >
          <option value="all">All payments</option>

          {paymentStatuses.map((value) => (
            <option key={value} value={value}>
              {value.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <select
          className="border border-neutral-300 bg-white p-3 outline-none transition focus:border-black"
          value={filters.sort}
          onChange={(event) => updateFilter("sort", event.target.value)}
        >
          <option value="newest">Newest first</option>

          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-5 overflow-x-auto bg-white">
        <table className="min-w-[1250px] w-full text-left text-sm">
          <thead className="border-b border-black bg-neutral-50">
            <tr>
              {[
                "Order",
                "Customer",
                "Phone",
                "Location",
                "Items",
                "Total",
                "Payment",
                "Status",
                "Created",
                "Actions",
              ].map((heading) => (
                <th key={heading} className="whitespace-nowrap p-4 font-bold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!loading &&
              result.orders.map((order) => (
                <tr key={order.id} className="border-b border-neutral-300">
                  <td className="whitespace-nowrap p-4 font-semibold">
                    {order.order_number}
                  </td>

                  <td className="p-4">
                    <p className="font-medium">{order.customer_name || "—"}</p>

                    {order.customer_email && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {order.customer_email}
                      </p>
                    )}
                  </td>

                  <td className="whitespace-nowrap p-4">
                    {order.customer_phone ? (
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="font-medium underline"
                      >
                        {order.customer_phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-4">
                    {[order.area, order.city, order.governorate]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>

                  <td className="p-4">
                    <p className="font-semibold">
                      {Number(order.total_quantity || order.item_count || 0)}
                    </p>

                    {order.has_custom_design && (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Custom
                      </p>
                    )}
                  </td>

                  <td className="whitespace-nowrap p-4 font-semibold">
                    {formatMoney(order.total)}
                  </td>

                  <td className="p-4">
                    <p className="font-medium capitalize">
                      {formatPaymentMethod(order.payment_method)}
                    </p>

                    <p className="mt-1 text-xs capitalize text-neutral-500">
                      {order.payment_status?.replaceAll("_", " ") || "pending"}
                    </p>
                  </td>

                  <td className="p-4">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  <td className="whitespace-nowrap p-4">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-GB")
                      : "—"}
                  </td>

                  <td className="p-4">
                    <Link
                      className="font-semibold underline"
                      to={`/admin/orders/${order.id}`}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {loading && (
          <p className="p-8 text-center text-neutral-500">Loading orders...</p>
        )}

        {!loading && !result.orders.length && (
          <p className="p-8 text-center text-neutral-500">No orders found.</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={filters.page <= 1}
          onClick={() => updateFilter("page", filters.page - 1)}
          className="border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span>
          Page {result.page || filters.page} of {result.totalPages || 1}
        </span>

        <button
          type="button"
          disabled={filters.page >= (result.totalPages || 1)}
          onClick={() => updateFilter("page", filters.page + 1)}
          className="border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  );
}
