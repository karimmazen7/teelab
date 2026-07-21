import { useEffect, useState } from "react";

import { getCustomers } from "../../services/adminService";

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG")} EGP`;

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-GB");
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getCustomers({
          search,
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

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            TeeLab administration
          </p>

          <h1 className="mt-2 text-3xl font-black">Customers</h1>

          <p className="mt-2 text-neutral-500">
            Customer contact details and order history.
          </p>
        </div>

        <p className="text-sm text-neutral-500">
          {customers.length} {customers.length === 1 ? "customer" : "customers"}
        </p>
      </div>

      <div className="mt-6 bg-white p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customer, phone or email"
          className="w-full border border-neutral-300 p-3 outline-none focus:border-black md:max-w-md"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-6 overflow-x-auto bg-white">
        <table className="min-w-[1000px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black bg-neutral-50">
              {[
                "Customer",
                "Phone",
                "Email",
                "Orders",
                "Total spent",
                "Last order",
                "Governorate",
                "City",
              ].map((heading) => (
                <th key={heading} className="whitespace-nowrap p-4 font-bold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!loading &&
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-neutral-200">
                  <td className="p-4">
                    <p className="font-semibold">{customer.full_name || "—"}</p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Joined {formatDate(customer.created_at)}
                    </p>
                  </td>

                  <td className="whitespace-nowrap p-4">
                    {customer.phone ? (
                      <a
                        href={`tel:${customer.phone}`}
                        className="font-medium underline"
                      >
                        {customer.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-4">
                    {customer.email ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="break-all font-medium underline"
                      >
                        {customer.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-4 font-semibold">
                    {Number(customer.total_orders || 0)}
                  </td>

                  <td className="whitespace-nowrap p-4 font-semibold">
                    {formatMoney(customer.total_spent)}
                  </td>

                  <td className="whitespace-nowrap p-4">
                    {formatDate(customer.last_order_at)}
                  </td>

                  <td className="p-4">{customer.latest_governorate || "—"}</td>

                  <td className="p-4">{customer.latest_city || "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {loading && (
          <p className="p-8 text-center text-neutral-500">
            Loading customers...
          </p>
        )}

        {!loading && !customers.length && (
          <p className="p-8 text-center text-neutral-500">
            No customers found.
          </p>
        )}
      </div>
    </section>
  );
}
