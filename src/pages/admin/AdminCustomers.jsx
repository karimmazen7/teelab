import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { getCustomers } from "../../services/adminService";

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Icon({ type, className = "h-4 w-4" }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    customer: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    order: (
      <>
        <path d="M6 7.5h12l1 13H5l1-13Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    money: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 8.5c-.7-.7-1.7-1-3-1-1.7 0-3 .9-3 2s1 1.8 3 2.3 3 1.2 3 2.7-1.3 2-3 2c-1.3 0-2.4-.4-3-1.2M12 5.5v13" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    external: (
      <>
        <path d="M14 5h5v5" />
        <path d="m19 5-8 8" />
        <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function SummaryCard({ label, value, icon, color }) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-neutral-500">{label}</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
        >
          <Icon type={icon} className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function CustomerAvatar({ name }) {
  const initials = (name || "Customer")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];

  const colorIndex =
    [...(name || "")].reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % colors.length;

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${colors[colorIndex]}`}
    >
      {initials || "C"}
    </div>
  );
}

function LoadingRows() {
  return Array.from({ length: 7 }).map((_, rowIndex) => (
    <tr key={rowIndex} className="animate-pulse border-b border-neutral-100">
      {Array.from({ length: 8 }).map((__, cellIndex) => (
        <td key={cellIndex} className="px-4 py-5">
          <div
            className={`h-3 rounded bg-neutral-100 ${
              cellIndex === 0 ? "w-32" : "w-20"
            }`}
          />
        </td>
      ))}
    </tr>
  ));
}

function EmptyCustomers({ hasSearch, onClear }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-5 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        <Icon type="customer" className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-sm font-semibold text-neutral-800">
        {hasSearch ? "No matching customers" : "No customers yet"}
      </h2>

      <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-500">
        {hasSearch
          ? "Try another name, email address or phone number."
          : "Customers will appear here after they place their first order."}
      </p>

      {hasSearch && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-md border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          Clear search
        </button>
      )}
    </div>
  );
}

export default function AdminCustomers() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (search.trim()) {
      nextParams.set("search", search.trim());
    }

    setSearchParams(nextParams, { replace: true });
  }, [search, setSearchParams]);

  useEffect(() => {
    let mounted = true;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getCustomers({
          search: search.trim(),
        });

        if (mounted) {
          setCustomers(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        console.error("Admin customers error:", loadError);

        if (mounted) {
          setError(loadError?.message || "Customers could not be loaded.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  const summary = useMemo(() => {
    return customers.reduce(
      (result, customer) => {
        const totalOrders = Number(customer.total_orders || 0);
        const totalSpent = Number(customer.total_spent || 0);

        result.totalOrders += totalOrders;
        result.totalRevenue += totalSpent;

        if (totalOrders > 1) {
          result.returningCustomers += 1;
        }

        return result;
      },
      {
        totalOrders: 0,
        totalRevenue: 0,
        returningCustomers: 0,
      },
    );
  }, [customers]);

  const averageCustomerValue =
    customers.length > 0 ? summary.totalRevenue / customers.length : 0;

  return (
    <section className="min-h-screen bg-[#f6f6f7] p-4 pb-12 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-500">
              TeeLab Administration
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
              Customers
            </h1>

            <p className="mt-1 text-xs text-neutral-500">
              View customer contact details and order history.
            </p>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm">
            {customers.length.toLocaleString("en-EG")}{" "}
            {customers.length === 1 ? "customer" : "customers"}
          </div>
        </header>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total customers"
            value={customers.length.toLocaleString("en-EG")}
            icon="customer"
            color="bg-violet-100 text-violet-700"
          />

          <SummaryCard
            label="Customer orders"
            value={summary.totalOrders.toLocaleString("en-EG")}
            icon="order"
            color="bg-blue-100 text-blue-700"
          />

          <SummaryCard
            label="Customer revenue"
            value={formatMoney(summary.totalRevenue)}
            icon="money"
            color="bg-emerald-100 text-emerald-700"
          />

          <SummaryCard
            label="Average customer value"
            value={formatMoney(averageCustomerValue)}
            icon="money"
            color="bg-amber-100 text-amber-700"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 p-3">
            <div className="relative w-full sm:max-w-md">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Icon type="search" />
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customers, phone numbers or emails"
                className="h-9 w-full rounded-md border border-neutral-300 bg-white pl-9 pr-9 text-xs text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-3 text-sm text-neutral-400 transition hover:text-neutral-800"
                >
                  ×
                </button>
              )}
            </div>

            <p className="text-[11px] text-neutral-500">
              {summary.returningCustomers.toLocaleString("en-EG")} returning{" "}
              {summary.returningCustomers === 1 ? "customer" : "customers"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#fafafa]">
                  {[
                    "Customer",
                    "Phone",
                    "Email",
                    "Orders",
                    "Total spent",
                    "Last order",
                    "Location",
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
                  customers.map((customer) => {
                    const location =
                      [customer.latest_city, customer.latest_governorate]
                        .filter(Boolean)
                        .join(", ") || "—";

                    return (
                      <tr
                        key={customer.id}
                        className="group border-b border-neutral-100 transition last:border-b-0 hover:bg-[#fafafa]"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <CustomerAvatar name={customer.full_name} />

                            <div>
                              <p className="max-w-44 truncate text-xs font-semibold text-neutral-900">
                                {customer.full_name || "Unknown customer"}
                              </p>

                              <p className="mt-1 text-[10px] text-neutral-400">
                                Joined {formatDate(customer.created_at)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {customer.phone ? (
                            <a
                              href={`tel:${customer.phone}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition hover:text-neutral-900 hover:underline"
                            >
                              <Icon type="phone" className="h-3.5 w-3.5" />
                              {customer.phone}
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {customer.email ? (
                            <a
                              href={`mailto:${customer.email}`}
                              title={customer.email}
                              className="flex max-w-56 items-center gap-1.5 truncate text-xs font-medium text-neutral-600 transition hover:text-neutral-900 hover:underline"
                            >
                              <Icon
                                type="mail"
                                className="h-3.5 w-3.5 shrink-0"
                              />

                              <span className="truncate">{customer.email}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <Link
                            to={`/admin/orders?search=${encodeURIComponent(
                              customer.phone ||
                                customer.email ||
                                customer.full_name ||
                                "",
                            )}`}
                            className="inline-flex min-w-8 items-center justify-center rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 transition hover:bg-neutral-200"
                          >
                            {Number(customer.total_orders || 0).toLocaleString(
                              "en-EG",
                            )}
                          </Link>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-neutral-900">
                          {formatMoney(customer.total_spent)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-neutral-600">
                          {formatDate(customer.last_order_at)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex max-w-44 items-center gap-1.5 text-xs text-neutral-600">
                            <Icon
                              type="location"
                              className="h-3.5 w-3.5 shrink-0 text-neutral-400"
                            />

                            <span className="truncate" title={location}>
                              {location}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <Link
                            to={`/admin/orders?search=${encodeURIComponent(
                              customer.phone ||
                                customer.email ||
                                customer.full_name ||
                                "",
                            )}`}
                            aria-label={`View ${customer.full_name || "customer"} orders`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900"
                          >
                            <Icon type="external" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {!loading && !customers.length && (
              <EmptyCustomers
                hasSearch={Boolean(search.trim())}
                onClear={() => setSearch("")}
              />
            )}
          </div>

          {!loading && customers.length > 0 && (
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3">
              <p className="text-[11px] text-neutral-500">
                Showing {customers.length.toLocaleString("en-EG")}{" "}
                {customers.length === 1 ? "customer" : "customers"}
              </p>

              <p className="text-[11px] text-neutral-400">
                Customer data is calculated from completed orders.
              </p>
            </footer>
          )}
        </div>
      </div>
    </section>
  );
}
