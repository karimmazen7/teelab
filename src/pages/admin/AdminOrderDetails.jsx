import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import OrderStatusBadge from "../../components/admin/OrderStatusBadge";
import {
  getOrderDetails,
  updateAdminNotes,
  updateOrderStatus,
} from "../../services/adminService";
import {
  createSignedFileUrl,
  downloadPrivateFile,
} from "../../services/storageService";

const orderStatuses = [
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

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG")} EGP`;

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatPaymentMethod = (value) => {
  if (value === "cash_on_delivery") {
    return "Cash on Delivery";
  }

  return value ? value.replaceAll("_", " ") : "—";
};

function AdminOrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("new");

  const [statusNote, setStatusNote] = useState("");

  const [adminNotes, setAdminNotes] = useState("");

  const [loading, setLoading] = useState(true);

  const [savingStatus, setSavingStatus] = useState(false);

  const [savingNotes, setSavingNotes] = useState(false);

  const [fileLoading, setFileLoading] = useState("");

  const [previewUrls, setPreviewUrls] = useState({});
  const [previewErrors, setPreviewErrors] = useState({});

  const [error, setError] = useState("");

  const mapUrl = useMemo(() => {
    if (order?.latitude == null || order?.longitude == null) {
      return null;
    }

    return `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
  }, [order]);

  const loadOrder = async () => {
    if (!orderId) {
      setError("Order ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getOrderDetails(orderId);

      setOrder(result.order);
      setItems(Array.isArray(result.items) ? result.items : []);

      setHistory(Array.isArray(result.history) ? result.history : []);

      setSelectedStatus(result.order?.status || "new");

      setAdminNotes(result.order?.admin_notes || "");
    } catch (loadError) {
      console.error("Order details page error:", loadError);

      setError(loadError?.message || "The order could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;

    async function loadPreviewUrls() {
      const customItems = items.filter(
        (item) => item.is_custom && item.preview_image_path,
      );

      if (!customItems.length) {
        if (!cancelled) {
          setPreviewUrls({});
          setPreviewErrors({});
        }
        return;
      }

      const nextUrls = {};
      const nextErrors = {};

      await Promise.all(
        customItems.map(async (item) => {
          try {
            const signedUrl = await createSignedFileUrl(
              "design-previews",
              item.preview_image_path,
              60 * 30,
            );

            nextUrls[item.id] = signedUrl;
          } catch (previewError) {
            console.error(
              `Preview URL error for item ${item.id}:`,
              previewError,
            );

            nextErrors[item.id] =
              previewError?.message ||
              "The custom preview could not be loaded.";
          }
        }),
      );

      if (!cancelled) {
        setPreviewUrls(nextUrls);
        setPreviewErrors(nextErrors);
      }
    }

    loadPreviewUrls();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const handleStatusUpdate = async () => {
    if (!orderId || !selectedStatus) {
      return;
    }

    setSavingStatus(true);
    setError("");

    try {
      await updateOrderStatus(orderId, selectedStatus, statusNote);

      setStatusNote("");
      await loadOrder();
    } catch (statusError) {
      console.error("Status update error:", statusError);

      setError(
        statusError?.message || "The order status could not be updated.",
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const handleNotesSave = async () => {
    if (!orderId) {
      return;
    }

    setSavingNotes(true);
    setError("");

    try {
      await updateAdminNotes(orderId, adminNotes);

      await loadOrder();
    } catch (notesError) {
      console.error("Admin notes error:", notesError);

      setError(notesError?.message || "The admin notes could not be saved.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleOpenFile = async (bucket, path) => {
    if (!path) {
      return;
    }

    setFileLoading(`${bucket}:${path}`);
    setError("");

    try {
      const signedUrl = await createSignedFileUrl(bucket, path, 60 * 10);

      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (fileError) {
      console.error("Open file error:", fileError);

      setError(fileError?.message || "The file could not be opened.");
    } finally {
      setFileLoading("");
    }
  };

  const handleDownloadFile = async (bucket, path, fileName) => {
    if (!path) {
      return;
    }

    setFileLoading(`${bucket}:${path}`);
    setError("");

    try {
      await downloadPrivateFile(bucket, path, fileName);
    } catch (fileError) {
      console.error("Download file error:", fileError);

      setError(fileError?.message || "The file could not be downloaded.");
    } finally {
      setFileLoading("");
    }
  };

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-300 border-t-black" />

          <p className="mt-4 text-neutral-500">Loading order details...</p>
        </div>
      </section>
    );
  }

  if (error && !order) {
    return (
      <section>
        <Link to="/admin/orders" className="font-semibold underline">
          ← Back to Orders
        </Link>

        <div className="mt-6 border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section>
        <Link to="/admin/orders" className="font-semibold underline">
          ← Back to Orders
        </Link>

        <p className="mt-6">Order not found.</p>
      </section>
    );
  }

  return (
    <section className="pb-12">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <Link to="/admin/orders" className="text-sm font-semibold underline">
            ← Back to Orders
          </Link>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Order details
          </p>

          <h1 className="mt-2 break-all text-3xl font-black">
            {order.order_number}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />

          <button
            type="button"
            onClick={() => window.print()}
            className="border border-black px-5 py-3 font-semibold"
          >
            Print Order
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-bold">Customer</h2>

          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="text-neutral-500">Name</p>

              <p className="font-semibold">{order.customer_name || "—"}</p>
            </div>

            <div>
              <p className="text-neutral-500">Phone</p>

              {order.customer_phone ? (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="font-semibold underline"
                >
                  {order.customer_phone}
                </a>
              ) : (
                <p>—</p>
              )}
            </div>

            <div>
              <p className="text-neutral-500">Email</p>

              {order.customer_email ? (
                <a
                  href={`mailto:${order.customer_email}`}
                  className="break-all font-semibold underline"
                >
                  {order.customer_email}
                </a>
              ) : (
                <p>Not provided</p>
              )}
            </div>
          </div>
        </section>

        <section className="border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-bold">Delivery Address</h2>

          <div className="mt-5 space-y-2 text-sm leading-6">
            <p>
              {[order.building_number, order.street_name, order.area]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>

            <p>
              {[order.city, order.governorate, order.country]
                .filter(Boolean)
                .join(", ")}
            </p>

            {order.floor_number && <p>Floor: {order.floor_number}</p>}

            {order.apartment_number && (
              <p>Apartment: {order.apartment_number}</p>
            )}

            {order.landmark && <p>Landmark: {order.landmark}</p>}

            {order.delivery_notes && <p>Notes: {order.delivery_notes}</p>}

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block font-semibold underline"
              >
                Open in Google Maps
              </a>
            )}
          </div>
        </section>

        <section className="border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-bold">Payment</h2>

          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="text-neutral-500">Method</p>

              <p className="font-semibold capitalize">
                {formatPaymentMethod(order.payment_method)}
              </p>
            </div>

            <div>
              <p className="text-neutral-500">Payment status</p>

              <p className="font-semibold capitalize">
                {order.payment_status?.replaceAll("_", " ") || "Pending"}
              </p>
            </div>

            <div>
              <p className="text-neutral-500">Created</p>

              <p className="font-semibold">{formatDate(order.created_at)}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-8 border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-6">
          <h2 className="text-xl font-bold">T-Shirts</h2>
        </div>

        <div className="divide-y divide-neutral-200">
          {items.length === 0 && (
            <p className="p-6 text-neutral-500">No order items found.</p>
          )}

          {items.map((item, index) => {
            const previewPath = item.preview_image_path;

            const printPath = item.print_file_path;

            const uploads = Array.isArray(item.original_upload_paths)
              ? item.original_upload_paths
              : [];

            return (
              <article
                key={item.id || index}
                className="grid gap-6 p-6 lg:grid-cols-[140px_minmax(0,1fr)_220px]"
              >
                <div className="flex h-40 items-center justify-center border border-neutral-200 bg-neutral-100">
                  {previewUrls[item.id] ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenFile("design-previews", previewPath)
                      }
                      className="h-full w-full"
                      aria-label={`Open ${item.product_name || "custom T-shirt"} preview`}
                    >
                      <img
                        src={previewUrls[item.id]}
                        alt={`${item.product_name || "Custom T-Shirt"} preview`}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ) : previewErrors[item.id] ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenFile("design-previews", previewPath)
                      }
                      className="px-3 text-center text-sm font-semibold underline"
                      title={previewErrors[item.id]}
                    >
                      Open custom preview
                    </button>
                  ) : previewPath ? (
                    <span className="px-3 text-center text-sm text-neutral-500">
                      Loading custom preview...
                    </span>
                  ) : item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="px-3 text-center text-sm text-neutral-500">
                      No saved product image
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold">
                      {item.product_name || "T-Shirt"}
                    </h3>

                    {item.is_custom && (
                      <span className="border border-black px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                        Custom design
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-neutral-500">Color</p>

                      <p className="font-semibold capitalize">
                        {item.tshirt_color || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-neutral-500">Size</p>

                      <p className="font-semibold uppercase">
                        {item.tshirt_size || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-neutral-500">Quantity</p>

                      <p className="font-semibold">{item.quantity || 1}</p>
                    </div>

                    <div>
                      <p className="text-neutral-500">Unit price</p>

                      <p className="font-semibold">
                        {formatMoney(item.unit_price)}
                      </p>
                    </div>
                  </div>

                  {uploads.length > 0 && (
                    <div className="mt-5">
                      <p className="text-sm font-semibold">
                        Original customer files
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {uploads.map((path, uploadIndex) => (
                          <button
                            key={path}
                            type="button"
                            onClick={() =>
                              handleOpenFile("customer-uploads", path)
                            }
                            className="border border-black px-3 py-2 text-xs font-semibold"
                          >
                            Upload {uploadIndex + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-5">
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">Line total</p>

                    <p className="mt-1 text-xl font-black">
                      {formatMoney(item.line_total)}
                    </p>
                  </div>

                  {item.is_custom && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={
                          !previewPath ||
                          fileLoading === `design-previews:${previewPath}`
                        }
                        onClick={() =>
                          handleOpenFile("design-previews", previewPath)
                        }
                        className="w-full border border-black px-4 py-3 text-sm font-semibold disabled:opacity-40"
                      >
                        View Preview
                      </button>

                      <button
                        type="button"
                        disabled={
                          !previewPath ||
                          fileLoading === `design-previews:${previewPath}`
                        }
                        onClick={() =>
                          handleDownloadFile(
                            "design-previews",
                            previewPath,
                            `${order.order_number}-preview.png`,
                          )
                        }
                        className="w-full border border-black px-4 py-3 text-sm font-semibold disabled:opacity-40"
                      >
                        Download Preview
                      </button>

                      <button
                        type="button"
                        disabled={
                          !printPath ||
                          fileLoading === `print-files:${printPath}`
                        }
                        onClick={() =>
                          handleDownloadFile(
                            "print-files",
                            printPath,
                            `${order.order_number}-print.png`,
                          )
                        }
                        className="w-full bg-black px-4 py-3 text-sm font-semibold text-white disabled:bg-neutral-300"
                      >
                        Download Print File
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-bold">Order Total</h2>

          <div className="mt-5 space-y-3">
            <div className="flex justify-between gap-4">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span>Delivery</span>
              <span>{formatMoney(order.delivery_fee)}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span>Discount</span>
              <span>{formatMoney(order.discount_amount)}</span>
            </div>

            <div className="flex justify-between gap-4 border-t border-neutral-300 pt-4 text-xl font-black">
              <span>Total</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>
        </section>

        <section className="border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-bold">Update Status</h2>

          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="mt-5 w-full border border-neutral-300 bg-white p-3"
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          <textarea
            value={statusNote}
            onChange={(event) => setStatusNote(event.target.value)}
            rows={3}
            placeholder="Optional status note"
            className="mt-3 w-full border border-neutral-300 p-3"
          />

          <button
            type="button"
            disabled={savingStatus}
            onClick={handleStatusUpdate}
            className="mt-3 w-full bg-black px-5 py-3 font-semibold text-white disabled:bg-neutral-300"
          >
            {savingStatus ? "Updating..." : "Update Status"}
          </button>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-bold">Admin Notes</h2>

          <textarea
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
            rows={6}
            placeholder="Private notes for the TeeLab team"
            className="mt-5 w-full border border-neutral-300 p-3"
          />

          <button
            type="button"
            disabled={savingNotes}
            onClick={handleNotesSave}
            className="mt-3 bg-black px-5 py-3 font-semibold text-white disabled:bg-neutral-300"
          >
            {savingNotes ? "Saving..." : "Save Notes"}
          </button>
        </section>

        <section className="border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-bold">Status Timeline</h2>

          <div className="mt-5 space-y-5">
            {history.length === 0 && (
              <p className="text-neutral-500">No status history found.</p>
            )}

            {history.map((entry) => (
              <article key={entry.id} className="border-l-2 border-black pl-4">
                <p className="font-semibold capitalize">
                  {entry.new_status?.replaceAll("_", " ")}
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  {formatDate(entry.created_at)}
                </p>

                {entry.note && <p className="mt-2 text-sm">{entry.note}</p>}
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default AdminOrderDetails;
