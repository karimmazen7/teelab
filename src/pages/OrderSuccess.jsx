import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { getPublicOrder } from "../services/orderService";

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG")} EGP`;

function OrderSuccess() {
  const { orderNumber } = useParams();

  const [order, setOrder] = useState(null);
  const [customerName, setCustomerName] = useState("");
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
        const savedOrder = sessionStorage.getItem(storageKey);

        if (!savedOrder) {
          throw new Error(
            "Order confirmation data is missing. Please check your orders from the admin dashboard.",
          );
        }

        const parsedOrder = JSON.parse(savedOrder);

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
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderNumber, storageKey]);

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />

          <p className="mt-4 text-sm text-neutral-500">
            Loading your order confirmation...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-5 py-16">
        <div className="w-full max-w-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
            Order confirmation
          </p>

          <h1 className="mt-3 text-3xl font-black">
            We could not load this order
          </h1>

          <p className="mt-4 leading-7 text-red-700">{error}</p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="border border-black px-6 py-3 font-semibold"
            >
              Go Home
            </Link>

            <Link
              to="/products"
              className="bg-black px-6 py-3 font-semibold text-white"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const customer = order?.customer || {};
  const address = order?.address || {};
  const items = Array.isArray(order?.items) ? order.items : [];

  const whatsappNumber =
    import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER || "201000000000";

  const whatsappMessage = encodeURIComponent(
    `Hello TeeLab, I placed order ${orderNumber}.`,
  );

  return (
    <section className="mx-auto min-h-screen max-w-5xl px-5 py-14 lg:px-8">
      <div className="border border-neutral-200 bg-white p-7 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-3xl text-white">
          ✓
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Order confirmed
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Thank you
            {customerName ? `, ${customerName}` : ""}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-neutral-600">
            Your order has been received successfully. TeeLab will contact you
            using the provided phone number to confirm delivery details.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="border border-neutral-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Order number
            </p>

            <p className="mt-2 break-all text-xl font-black">
              {order?.order_number || orderNumber}
            </p>
          </div>

          <div className="border border-neutral-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Status
            </p>

            <p className="mt-2 text-xl font-black capitalize">
              {(order?.status || "new").replaceAll("_", " ")}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="border border-neutral-200 p-6">
            <h2 className="text-xl font-bold">Customer information</h2>

            <div className="mt-5 space-y-3 text-sm">
              <div>
                <p className="text-neutral-500">Name</p>
                <p className="font-semibold">
                  {customer.full_name || customerName || "—"}
                </p>
              </div>

              <div>
                <p className="text-neutral-500">Phone</p>
                <p className="font-semibold">{customer.phone || "—"}</p>
              </div>

              <div>
                <p className="text-neutral-500">Email</p>
                <p className="font-semibold">
                  {customer.email || "Not provided"}
                </p>
              </div>
            </div>
          </section>

          <section className="border border-neutral-200 p-6">
            <h2 className="text-xl font-bold">Delivery address</h2>

            <div className="mt-5 space-y-2 text-sm leading-6">
              <p>
                {[address.building_number, address.street_name, address.area]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>

              <p>
                {[address.city, address.governorate, address.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {address.floor_number && <p>Floor: {address.floor_number}</p>}

              {address.apartment_number && (
                <p>Apartment: {address.apartment_number}</p>
              )}

              {address.landmark && <p>Landmark: {address.landmark}</p>}

              {address.delivery_notes && (
                <p>Delivery notes: {address.delivery_notes}</p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 border border-neutral-200 p-6">
          <h2 className="text-xl font-bold">Order items</h2>

          <div className="mt-5 divide-y divide-neutral-200">
            {items.map((item, index) => (
              <article
                key={item.id || `${item.product_name}-${index}`}
                className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold">
                    {item.product_name || "T-Shirt"}
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">
                    {item.tshirt_color || "Default"} /{" "}
                    {item.tshirt_size || "One Size"} × {item.quantity || 1}
                  </p>

                  {item.is_custom && (
                    <span className="mt-2 inline-block border border-black px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                      Custom design
                    </span>
                  )}
                </div>

                <p className="font-bold">{formatMoney(item.line_total)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 border border-neutral-200 bg-neutral-50 p-6">
          <div className="space-y-3">
            <div className="flex justify-between gap-4">
              <span>Subtotal</span>
              <span>{formatMoney(order?.subtotal)}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span>Delivery</span>
              <span>
                {Number(order?.delivery_fee || 0) === 0
                  ? "Free"
                  : formatMoney(order?.delivery_fee)}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-t border-neutral-300 pt-4 text-lg font-black">
              <span>Total</span>
              <span>{formatMoney(order?.total)}</span>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="border border-black px-7 py-4 font-semibold transition hover:bg-black hover:text-white"
          >
            Back Home
          </Link>

          <Link
            to="/products"
            className="bg-black px-7 py-4 font-semibold text-white"
          >
            Continue Shopping
          </Link>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="border border-black px-7 py-4 font-semibold"
          >
            Contact on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export default OrderSuccess;
