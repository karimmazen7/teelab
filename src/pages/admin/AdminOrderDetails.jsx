import { useCallback, useEffect, useMemo, useState } from "react";
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
  `${Number(value || 0).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatPaymentMethod = (value) => {
  if (value === "cash_on_delivery") return "Cash on Delivery";
  return value ? value.replaceAll("_", " ") : "—";
};

function Icon({ type, className = "h-4 w-4" }) {
  const paths = {
    back: <path d="m15 18-6-6 6-6" />,
    print: (
      <>
        <path d="M6 9V3h12v6" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v7H6z" />
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
    map: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
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

function Card({ title, action, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm ${className}`}
    >
      <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
        {action}
      </header>

      <div className="p-5">{children}</div>
    </section>
  );
}

function DetailRow({ label, value, children }) {
  return (
    <div className="flex items-start justify-between gap-5 py-2.5">
      <span className="text-xs text-neutral-500">{label}</span>

      <div className="max-w-[65%] text-right text-xs font-medium capitalize text-neutral-800">
        {children || value || "—"}
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <section className="min-h-screen bg-[#f6f6f7] p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px] animate-pulse">
        <div className="h-7 w-52 rounded bg-neutral-200" />

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <div className="h-80 rounded-lg bg-white" />
            <div className="h-64 rounded-lg bg-white" />
          </div>

          <div className="space-y-5">
            <div className="h-64 rounded-lg bg-white" />
            <div className="h-52 rounded-lg bg-white" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AdminOrderDetails() {
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
  const [successMessage, setSuccessMessage] = useState("");

  const mapUrl = useMemo(() => {
    if (order?.latitude == null || order?.longitude == null) return null;

    return `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
  }, [order]);

  const deliveryAddress = useMemo(() => {
    if (!order) return "—";

    return [
      order.building_number,
      order.street_name,
      order.area,
      order.city,
      order.governorate,
      order.country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [order]);

  const loadOrder = useCallback(
    async (showLoader = true) => {
      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      if (showLoader) setLoading(true);
      setError("");

      try {
        const result = await getOrderDetails(orderId);
        const nextOrder = result.order;

        setOrder(nextOrder);
        setItems(Array.isArray(result.items) ? result.items : []);
        setHistory(Array.isArray(result.history) ? result.history : []);
        setSelectedStatus(nextOrder?.status || "new");
        setAdminNotes(nextOrder?.admin_notes || "");
      } catch (loadError) {
        console.error("Order details page error:", loadError);
        setError(loadError?.message || "The order could not be loaded.");
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

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
            nextUrls[item.id] = await createSignedFileUrl(
              "design-previews",
              item.preview_image_path,
              60 * 30,
            );
          } catch (previewError) {
            console.error(`Preview error for ${item.id}:`, previewError);

            nextErrors[item.id] =
              previewError?.message || "Preview could not be loaded.";
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

  const showSuccess = (message) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  const handleStatusUpdate = async () => {
    if (!orderId || !selectedStatus) return;

    setSavingStatus(true);
    setError("");

    try {
      await updateOrderStatus(orderId, selectedStatus, statusNote);
      setStatusNote("");
      await loadOrder(false);
      showSuccess("Order status updated successfully.");
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
    if (!orderId) return;

    setSavingNotes(true);
    setError("");

    try {
      await updateAdminNotes(orderId, adminNotes);
      await loadOrder(false);
      showSuccess("Admin notes saved successfully.");
    } catch (notesError) {
      console.error("Admin notes error:", notesError);
      setError(notesError?.message || "Admin notes could not be saved.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleOpenFile = async (bucket, path) => {
    if (!path) return;

    const fileKey = `${bucket}:${path}`;

    setFileLoading(fileKey);
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
    if (!path) return;

    const fileKey = `${bucket}:${path}`;

    setFileLoading(fileKey);
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

  if (loading) return <LoadingPage />;

  if (!order) {
    return (
      <section className="min-h-screen bg-[#f6f6f7] p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-black"
          >
            <Icon type="back" />
            Orders
          </Link>

          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error || "Order not found."}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f6f6f7] p-4 pb-12 sm:p-6">
      <div className="mx-auto max-w-[1500px]">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 transition hover:text-black"
        >
          <Icon type="back" />
          Orders
        </Link>

        <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-all text-2xl font-semibold tracking-tight text-neutral-900">
                {order.order_number}
              </h1>

              <OrderStatusBadge status={order.status} />
            </div>

            <p className="mt-2 text-xs text-neutral-500">
              Created {formatDate(order.created_at)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            <Icon type="print" />
            Print order
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700"
          >
            {successMessage}
          </div>
        )}

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <Card
              title={`Items (${items.reduce(
                (total, item) => total + Number(item.quantity || 1),
                0,
              )})`}
            >
              {!items.length && (
                <p className="py-8 text-center text-xs text-neutral-500">
                  No order items found.
                </p>
              )}

              <div className="divide-y divide-neutral-100">
                {items.map((item, index) => {
                  const previewPath = item.preview_image_path;
                  const printPath = item.print_file_path;
                  const uploads = Array.isArray(item.original_upload_paths)
                    ? item.original_upload_paths
                    : [];

                  return (
                    <article
                      key={item.id || index}
                      className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[96px_minmax(0,1fr)_auto]"
                    >
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
                        {previewUrls[item.id] ? (
                          <button
                            type="button"
                            className="h-full w-full"
                            onClick={() =>
                              handleOpenFile("design-previews", previewPath)
                            }
                          >
                            <img
                              src={previewUrls[item.id]}
                              alt={`${item.product_name || "Custom product"} preview`}
                              className="h-full w-full object-contain"
                            />
                          </button>
                        ) : item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name || "Product"}
                            className="h-full w-full object-contain"
                          />
                        ) : previewPath ? (
                          <span className="px-2 text-center text-[10px] text-neutral-400">
                            {previewErrors[item.id]
                              ? "Preview unavailable"
                              : "Loading preview..."}
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400">
                            No image
                          </span>
                        )}
                      </div>

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

                        <p className="mt-1 text-xs capitalize text-neutral-500">
                          {item.tshirt_color || "No color"} /{" "}
                          <span className="uppercase">
                            {item.tshirt_size || "No size"}
                          </span>
                        </p>

                        <p className="mt-2 text-xs text-neutral-500">
                          {formatMoney(item.unit_price)} × {item.quantity || 1}
                        </p>

                        {item.is_custom && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={
                                !previewPath ||
                                fileLoading === `design-previews:${previewPath}`
                              }
                              onClick={() =>
                                handleOpenFile("design-previews", previewPath)
                              }
                              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                            >
                              <Icon type="external" />
                              View preview
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
                              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                            >
                              <Icon type="download" />
                              Preview
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
                              className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-2 text-[10px] font-semibold text-white hover:bg-black disabled:bg-neutral-300"
                            >
                              <Icon type="download" />
                              Print file
                            </button>
                          </div>
                        )}

                        {uploads.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {uploads.map((path, uploadIndex) => (
                              <button
                                key={`${path}-${uploadIndex}`}
                                type="button"
                                onClick={() =>
                                  handleOpenFile("customer-uploads", path)
                                }
                                className="text-[10px] font-medium text-cyan-700 hover:underline"
                              >
                                Customer upload {uploadIndex + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="whitespace-nowrap text-sm font-semibold text-neutral-900">
                        {formatMoney(
                          item.line_total ??
                            Number(item.unit_price || 0) *
                              Number(item.quantity || 1),
                        )}
                      </p>
                    </article>
                  );
                })}
              </div>
            </Card>

            <Card title="Payment summary">
              <div className="space-y-1">
                <DetailRow
                  label="Subtotal"
                  value={formatMoney(order.subtotal)}
                />

                <DetailRow
                  label="Delivery"
                  value={formatMoney(order.delivery_fee)}
                />

                <DetailRow
                  label="Discount"
                  value={
                    Number(order.discount_amount || 0) > 0
                      ? `− ${formatMoney(order.discount_amount)}`
                      : formatMoney(0)
                  }
                />

                <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-4">
                  <span className="text-sm font-semibold text-neutral-900">
                    Total
                  </span>

                  <span className="text-lg font-semibold text-neutral-900">
                    {formatMoney(order.total)}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Status timeline">
              {!history.length ? (
                <p className="text-xs text-neutral-500">
                  No status history found.
                </p>
              ) : (
                <div className="space-y-0">
                  {history.map((entry, index) => (
                    <article
                      key={entry.id || index}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {index < history.length - 1 && (
                        <span className="absolute left-[5px] top-3 h-full w-px bg-neutral-200" />
                      )}

                      <span className="relative mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-white bg-violet-500 ring-1 ring-violet-300" />

                      <div>
                        <p className="text-xs font-semibold capitalize text-neutral-800">
                          {entry.new_status?.replaceAll("_", " ") || "Updated"}
                        </p>

                        <p className="mt-1 text-[10px] text-neutral-400">
                          {formatDate(entry.created_at)}
                        </p>

                        {entry.note && (
                          <p className="mt-2 text-xs leading-5 text-neutral-600">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <aside className="space-y-5">
            <Card title="Update order status">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium text-neutral-600">
                  Status
                </span>

                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-xs capitalize text-neutral-700 outline-none focus:border-neutral-600"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-3 block">
                <span className="mb-1.5 block text-[11px] font-medium text-neutral-600">
                  Status note
                </span>

                <textarea
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                  rows={3}
                  placeholder="Optional note"
                  className="w-full resize-none rounded-md border border-neutral-300 p-3 text-xs outline-none placeholder:text-neutral-400 focus:border-neutral-600"
                />
              </label>

              <button
                type="button"
                disabled={
                  savingStatus ||
                  (selectedStatus === order.status && !statusNote.trim())
                }
                onClick={handleStatusUpdate}
                className="mt-3 w-full rounded-md bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {savingStatus ? "Updating..." : "Update status"}
              </button>
            </Card>

            <Card title="Customer">
              <DetailRow label="Name" value={order.customer_name} />

              <DetailRow label="Phone">
                {order.customer_phone ? (
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="inline-flex items-center gap-1.5 hover:underline"
                  >
                    <Icon type="phone" />
                    {order.customer_phone}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>

              <DetailRow label="Email">
                {order.customer_email ? (
                  <a
                    href={`mailto:${order.customer_email}`}
                    className="inline-flex items-center gap-1.5 break-all hover:underline"
                  >
                    <Icon type="mail" />
                    {order.customer_email}
                  </a>
                ) : (
                  "Not provided"
                )}
              </DetailRow>
            </Card>

            <Card title="Delivery">
              <p className="text-xs leading-5 text-neutral-700">
                {deliveryAddress || "No delivery address provided."}
              </p>

              {order.floor_number && (
                <p className="mt-2 text-xs text-neutral-500">
                  Floor: {order.floor_number}
                </p>
              )}

              {order.apartment_number && (
                <p className="mt-1 text-xs text-neutral-500">
                  Apartment: {order.apartment_number}
                </p>
              )}

              {order.landmark && (
                <p className="mt-2 text-xs text-neutral-500">
                  Landmark: {order.landmark}
                </p>
              )}

              {order.delivery_notes && (
                <div className="mt-3 rounded-md bg-amber-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    Delivery note
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    {order.delivery_notes}
                  </p>
                </div>
              )}

              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-[11px] font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  <Icon type="map" />
                  Open Google Maps
                </a>
              )}
            </Card>

            <Card title="Payment">
              <DetailRow
                label="Method"
                value={formatPaymentMethod(order.payment_method)}
              />

              <DetailRow label="Payment status">
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    order.payment_status === "paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.payment_status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {order.payment_status?.replaceAll("_", " ") || "Pending"}
                </span>
              </DetailRow>

              <DetailRow label="Order total" value={formatMoney(order.total)} />
            </Card>

            <Card title="Admin notes">
              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                rows={5}
                placeholder="Private notes for the TeeLab team"
                className="w-full resize-none rounded-md border border-neutral-300 p-3 text-xs leading-5 outline-none placeholder:text-neutral-400 focus:border-neutral-600"
              />

              <button
                type="button"
                disabled={
                  savingNotes || adminNotes === (order.admin_notes || "")
                }
                onClick={handleNotesSave}
                className="mt-3 rounded-md bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {savingNotes ? "Saving..." : "Save notes"}
              </button>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}
