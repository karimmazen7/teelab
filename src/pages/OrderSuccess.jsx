import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import { getPublicOrder } from "../services/orderService";

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;

const formatPaymentMethod = (value) => {
  if (value === "cash_on_delivery") return "Cash on Delivery";
  return value ? value.replaceAll("_", " ") : "Cash on Delivery";
};

function Icon({ type, className = "h-5 w-5" }) {
  const paths = {
    check: <path d="m5 12 4 4L19 6" />,
    copy: (
      <>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    customer: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    payment: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
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
    print: (
      <>
        <path d="M6 9V3h12v6" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v7H6z" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v11h14V10" />
        <path d="M9 21v-7h6v7" />
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

function InformationCard({ title, icon, children }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
          <Icon type={icon} className="h-4 w-4" />
        </div>

        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function DetailRow({ label, value, children }) {
  return (
    <div className="flex items-start justify-between gap-5 py-2">
      <span className="text-xs text-neutral-500">{label}</span>

      <div className="max-w-[65%] text-right text-xs font-medium text-neutral-800">
        {children || value || "—"}
      </div>
    </div>
  );
}

function LoadingConfirmation() {
  return (
    <main className="min-h-screen bg-[#f7f7f7] px-5 py-16">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="mx-auto h-16 w-16 rounded-full bg-neutral-200" />
        <div className="mx-auto mt-6 h-8 w-64 rounded bg-neutral-200" />
        <div className="mx-auto mt-3 h-4 w-96 max-w-full rounded bg-neutral-200" />

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-96 rounded-xl bg-white" />
          <div className="h-72 rounded-xl bg-white" />
        </div>
      </div>
    </main>
  );
}

function ErrorConfirmation({ error }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f7] px-5 py-16">
      <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-semibold text-red-600">
          !
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
          Order confirmation
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          We couldn&apos;t load this order
        </h1>

        <p className="mt-4 text-sm leading-6 text-neutral-600">{error}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-neutral-300 px-5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <Icon type="home" className="h-4 w-4" />
            Go home
          </Link>

          <Link
            to="/products"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-neutral-900 px-5 text-xs font-semibold text-white transition hover:bg-black"
          >
            Continue shopping
            <Icon type="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}

function OrderSuccess() {
  const { orderNumber } = useParams();

  const [order, setOrder] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storageKey = useMemo(
    () => `teelab-order-${orderNumber}`,
    [orderNumber],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!orderNumber) {
        setError("The order number is missing.");
        setLoading(false);
        return;
      }

      try {
        const savedOrder = window.sessionStorage.getItem(storageKey);

        if (!savedOrder) {
          throw new Error(
            "Your secure order confirmation has expired or is unavailable.",
          );
        }

        let parsedOrder;

        try {
          parsedOrder = JSON.parse(savedOrder);
        } catch {
          throw new Error("The saved order confirmation is invalid.");
        }

        if (!parsedOrder?.token) {
          throw new Error("The order confirmation token is missing.");
        }

        if (isMounted) {
          setCustomerName(parsedOrder.customerName || "");
        }

        const result = await getPublicOrder(orderNumber, parsedOrder.token);

        if (isMounted) {
          setOrder(result);
        }
      } catch (loadError) {
        console.error("Order success page error:", loadError);

        if (isMounted) {
          setError(
            loadError?.message || "The order confirmation could not be loaded.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderNumber, storageKey]);

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber || "");
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (copyError) {
      console.error("Could not copy order number:", copyError);
    }
  };

  if (loading) return <LoadingConfirmation />;
  if (error) return <ErrorConfirmation error={error} />;

  const customer = order?.customer || {};
  const address = order?.address || {};
  const items = Array.isArray(order?.items) ? order.items : [];

  const fullAddress =
    [
      address.building_number,
      address.street_name,
      address.area,
      address.city,
      address.governorate,
      address.country,
    ]
      .filter(Boolean)
      .join(", ") || "—";

  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0,
  );

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-5 py-12 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Icon type="check" className="h-8 w-8" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Order confirmed
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Thank you
            {customerName ? `, ${customerName}` : ""}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-600">
            Your order has been received successfully. We&apos;ll contact you
            using your phone number to confirm the delivery details.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-xs text-neutral-500">Order number</span>

            <span className="text-sm font-semibold text-neutral-900">
              {orderNumber}
            </span>

            <button
              type="button"
              onClick={copyOrderNumber}
              className="ml-1 inline-flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500 transition hover:text-black"
            >
              <Icon type="copy" className="h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        <div className="mt-10 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Order items
                  </h2>

                  <p className="mt-1 text-[10px] text-neutral-500">
                    {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                  </p>
                </div>

                <Icon type="order" className="h-5 w-5 text-neutral-400" />
              </header>

              <div className="divide-y divide-neutral-100 px-5 sm:px-6">
                {!items.length && (
                  <p className="py-8 text-center text-xs text-neutral-500">
                    No order items found.
                  </p>
                )}

                {items.map((item, index) => (
                  <article
                    key={item.id || `${item.product_name}-${index}`}
                    className="flex items-start justify-between gap-5 py-5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-neutral-900">
                          {item.product_name || "T-Shirt"}
                        </h3>

                        {item.is_custom && (
                          <span className="rounded-full bg-violet-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-violet-700">
                            Custom
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-xs capitalize text-neutral-500">
                        {item.tshirt_color || "Default"} /{" "}
                        <span className="uppercase">
                          {item.tshirt_size || "One size"}
                        </span>
                      </p>

                      <p className="mt-2 text-[10px] text-neutral-400">
                        Quantity: {item.quantity || 1}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-neutral-900">
                      {formatMoney(
                        item.line_total ??
                          Number(item.unit_price || 0) *
                            Number(item.quantity || 1),
                      )}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <div className="grid gap-5 sm:grid-cols-2">
              <InformationCard title="Customer" icon="customer">
                <DetailRow
                  label="Name"
                  value={customer.full_name || customerName}
                />

                <DetailRow label="Phone">
                  {customer.phone ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="inline-flex items-center gap-1.5 hover:underline"
                    >
                      <Icon type="phone" className="h-3.5 w-3.5" />
                      {customer.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </DetailRow>

                <DetailRow label="Email">
                  {customer.email ? (
                    <a
                      href={`mailto:${customer.email}`}
                      className="inline-flex items-center gap-1.5 break-all hover:underline"
                    >
                      <Icon type="mail" className="h-3.5 w-3.5" />
                      {customer.email}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </DetailRow>
              </InformationCard>

              <InformationCard title="Delivery address" icon="location">
                <p className="text-xs leading-6 text-neutral-700">
                  {fullAddress}
                </p>

                {address.floor_number && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Floor: {address.floor_number}
                  </p>
                )}

                {address.apartment_number && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Apartment: {address.apartment_number}
                  </p>
                )}

                {address.landmark && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Landmark: {address.landmark}
                  </p>
                )}

                {address.delivery_notes && (
                  <div className="mt-3 rounded-md bg-amber-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Delivery note
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      {address.delivery_notes}
                    </p>
                  </div>
                )}
              </InformationCard>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                  <Icon type="payment" className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Order summary
                  </h2>

                  <p className="mt-1 text-[10px] text-neutral-500">
                    {formatPaymentMethod(order?.payment_method)}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <DetailRow
                  label="Subtotal"
                  value={formatMoney(order?.subtotal)}
                />

                <DetailRow label="Delivery">
                  {Number(order?.delivery_fee || 0) === 0
                    ? "Free"
                    : formatMoney(order?.delivery_fee)}
                </DetailRow>

                {Number(order?.discount_amount || 0) > 0 && (
                  <DetailRow
                    label="Discount"
                    value={`− ${formatMoney(order.discount_amount)}`}
                  />
                )}

                <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-4">
                  <span className="text-sm font-semibold text-neutral-900">
                    Total
                  </span>

                  <span className="text-lg font-semibold text-neutral-900">
                    {formatMoney(order?.total)}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-md bg-neutral-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                  What happens next?
                </p>

                <p className="mt-2 text-xs leading-5 text-neutral-600">
                  Our team will call you to confirm your order before preparing
                  it for delivery.
                </p>
              </div>
            </section>

            <div className="grid gap-3">
              <Link
                to="/products"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-neutral-900 px-5 text-xs font-semibold text-white transition hover:bg-black"
              >
                Continue shopping
                <Icon type="arrow" className="h-4 w-4" />
              </Link>

              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                <Icon type="home" className="h-4 w-4" />
                Back to home
              </Link>

              {/* <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-10 items-center justify-center gap-2 text-[11px] font-medium text-neutral-500 transition hover:text-black"
              >
                <Icon type="print" className="h-4 w-4" />
                Print confirmation
              </button> */}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccess;
