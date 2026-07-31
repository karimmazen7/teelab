import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

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
  `${Number(value || 0).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;

const formatPaymentMethod = (value) => {
  if (value === "cash_on_delivery") {
    return "Cash on Delivery";
  }

  return value ? value.replaceAll("_", " ") : "—";
};

const formatDate = (value) => {
  if (!value) {
    return {
      date: "—",
      time: "",
    };
  }

  const parsedDate = new Date(value);

  return {
    date: parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: parsedDate.toLocaleTimeString("en-EG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M14 5h5v5" />
      <path d="m19 5-8 8" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function LoadingRows() {
  return Array.from({ length: 6 }).map((_, index) => (
    <tr key={index} className="animate-pulse border-b border-neutral-100">
      {Array.from({ length: 10 }).map((__, cellIndex) => (
        <td key={cellIndex} className="px-4 py-5">
          <div
            className={`h-3 rounded bg-neutral-100 ${
              cellIndex === 1 ? "w-28" : "w-16"
            }`}
          />
        </td>
      ))}
    </tr>
  ));
}

function EmptyOrders() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path d="M6 7.5h12l1 13H5l1-13Z" />
          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </svg>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-neutral-800">
        No orders found
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-500">
        Try changing your search or removing some filters.
      </p>
    </div>
  );
}

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = searchParams.get("status");
  const initialPaymentStatus = searchParams.get("paymentStatus");

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: statuses.includes(initialStatus) ? initialStatus : "all",
    paymentStatus: paymentStatuses.includes(initialPaymentStatus)
      ? initialPaymentStatus
      : "all",
    sort: searchParams.get("sort") === "oldest" ? "oldest" : "newest",
    page: Math.max(Number(searchParams.get("page")) || 1, 1),
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (filters.search.trim()) {
      nextParams.set("search", filters.search.trim());
    }

    if (filters.status !== "all") {
      nextParams.set("status", filters.status);
    }

    if (filters.paymentStatus !== "all") {
      nextParams.set("paymentStatus", filters.paymentStatus);
    }

    if (filters.sort !== "newest") {
      nextParams.set("sort", filters.sort);
    }

    if (filters.page > 1) {
      nextParams.set("page", String(filters.page));
    }

    setSearchParams(nextParams, { replace: true });
  }, [filters, setSearchParams]);

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

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      paymentStatus: "all",
      sort: "newest",
      page: 1,
      pageSize: 20,
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.status !== "all") count += 1;
    if (filters.paymentStatus !== "all") count += 1;
    if (filters.sort !== "newest") count += 1;

    return count;
  }, [filters]);

  const firstVisibleOrder =
    result.count > 0 ? (filters.page - 1) * filters.pageSize + 1 : 0;

  const lastVisibleOrder = Math.min(
    filters.page * filters.pageSize,
    result.count,
  );

  return (
    <section className="min-h-screen bg-[#f6f6f7] p-4 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-500">
              TeeLab Administration
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
              Orders
            </h1>

            <p className="mt-1 text-xs text-neutral-500">
              Manage and track customer orders.
            </p>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm">
            {result.count.toLocaleString("en-EG")}{" "}
            {result.count === 1 ? "order" : "orders"}
          </div>
        </header>

        <div className="mt-5 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-64 flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                  <SearchIcon />
                </span>

                <input
                  type="search"
                  placeholder="Search orders, customers or phone numbers"
                  className="h-9 w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 text-xs text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
                  value={filters.search}
                  onChange={(event) =>
                    updateFilter("search", event.target.value)
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                className={`flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition ${
                  filtersOpen || activeFilterCount > 0
                    ? "border-neutral-500 bg-neutral-100 text-neutral-900"
                    : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <FilterIcon />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-800 px-1 text-[9px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <select
                aria-label="Sort orders"
                className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-600 outline-none transition focus:border-neutral-600"
                value={filters.sort}
                onChange={(event) => updateFilter("sort", event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            {filtersOpen && (
              <div className="mt-3 grid gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
                <label>
                  <span className="mb-1.5 block text-[11px] font-medium text-neutral-600">
                    Order status
                  </span>

                  <select
                    className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-xs capitalize text-neutral-700 outline-none focus:border-neutral-600"
                    value={filters.status}
                    onChange={(event) =>
                      updateFilter("status", event.target.value)
                    }
                  >
                    <option value="all">All statuses</option>

                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-[11px] font-medium text-neutral-600">
                    Payment status
                  </span>

                  <select
                    className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-xs capitalize text-neutral-700 outline-none focus:border-neutral-600"
                    value={filters.paymentStatus}
                    onChange={(event) =>
                      updateFilter("paymentStatus", event.target.value)
                    }
                  >
                    <option value="all">All payments</option>

                    {paymentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-9 w-full rounded-md border border-neutral-300 bg-white px-4 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 lg:w-auto"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}

            {(filters.status !== "all" || filters.paymentStatus !== "all") && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {filters.status !== "all" && (
                  <button
                    type="button"
                    onClick={() => updateFilter("status", "all")}
                    className="rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium capitalize text-neutral-700 transition hover:bg-neutral-200"
                  >
                    Status: {filters.status.replaceAll("_", " ")} ×
                  </button>
                )}

                {filters.paymentStatus !== "all" && (
                  <button
                    type="button"
                    onClick={() => updateFilter("paymentStatus", "all")}
                    className="rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-medium capitalize text-neutral-700 transition hover:bg-neutral-200"
                  >
                    Payment: {filters.paymentStatus.replaceAll("_", " ")} ×
                  </button>
                )}
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="m-4 rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700"
            >
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#fafafa]">
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
                    "",
                  ].map((heading, index) => (
                    <th
                      key={`${heading}-${index}`}
                      className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-neutral-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading && <LoadingRows />}

                {!loading &&
                  result.orders.map((order) => {
                    const createdAt = formatDate(order.created_at);
                    const location =
                      [order.area, order.city, order.governorate]
                        .filter(Boolean)
                        .join(", ") || "—";

                    return (
                      <tr
                        key={order.id}
                        className="group border-b border-neutral-100 transition last:border-b-0 hover:bg-[#fafafa]"
                      >
                        <td className="whitespace-nowrap px-4 py-4">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="text-xs font-semibold text-neutral-900 hover:underline"
                          >
                            {order.order_number || "—"}
                          </Link>
                        </td>

                        <td className="px-4 py-4">
                          <p className="max-w-44 truncate text-xs font-medium text-neutral-800">
                            {order.customer_name || "—"}
                          </p>

                          {order.customer_email && (
                            <p className="mt-1 max-w-44 truncate text-[11px] text-neutral-400">
                              {order.customer_email}
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {order.customer_phone ? (
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
                            >
                              {order.customer_phone}
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <p
                            title={location}
                            className="max-w-44 truncate text-xs text-neutral-600"
                          >
                            {location}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-neutral-700">
                              {Number(
                                order.total_quantity || order.item_count || 0,
                              )}
                            </span>

                            {order.has_custom_design && (
                              <span className="rounded-full bg-violet-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-violet-700">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-neutral-900">
                          {formatMoney(order.total)}
                        </td>

                        <td className="px-4 py-4">
                          <p className="whitespace-nowrap text-xs font-medium text-neutral-700">
                            {formatPaymentMethod(order.payment_method)}
                          </p>

                          <p
                            className={`mt-1 text-[10px] font-medium capitalize ${
                              order.payment_status === "paid"
                                ? "text-emerald-600"
                                : order.payment_status === "failed"
                                  ? "text-red-500"
                                  : "text-neutral-400"
                            }`}
                          >
                            {order.payment_status?.replaceAll("_", " ") ||
                              "pending"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <p className="text-xs font-medium text-neutral-600">
                            {createdAt.date}
                          </p>

                          {createdAt.time && (
                            <p className="mt-1 text-[10px] text-neutral-400">
                              {createdAt.time}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            aria-label={`Open order ${order.order_number}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900"
                          >
                            <OpenIcon />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {!loading && !result.orders.length && <EmptyOrders />}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 px-4 py-3">
            <p className="text-[11px] text-neutral-500">
              {result.count > 0
                ? `Showing ${firstVisibleOrder}–${lastVisibleOrder} of ${result.count} orders`
                : "0 orders"}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={filters.page <= 1 || loading}
                onClick={() => updateFilter("page", filters.page - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon />
              </button>

              <span className="min-w-24 text-center text-[11px] font-medium text-neutral-600">
                Page {result.page || filters.page} of {result.totalPages || 1}
              </span>

              <button
                type="button"
                aria-label="Next page"
                disabled={filters.page >= (result.totalPages || 1) || loading}
                onClick={() => updateFilter("page", filters.page + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
