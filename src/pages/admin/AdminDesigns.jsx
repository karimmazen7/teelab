import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { getCustomDesigns } from "../../services/adminService";
import {
  createSignedFileUrl,
  downloadPrivateFile,
} from "../../services/storageService";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
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
    design: (
      <>
        <path d="M12 3 4 7l8 4 8-4-8-4Z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 17 8 4 8-4" />
      </>
    ),
    order: (
      <>
        <path d="M6 7.5h12l1 13H5l1-13Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    file: (
      <>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v5h5" />
      </>
    ),
    quantity: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
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
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
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

function LoadingCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={index}
          className="animate-pulse rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <div className="aspect-[4/3] rounded-md bg-neutral-100" />
          <div className="mt-4 h-4 w-36 rounded bg-neutral-100" />
          <div className="mt-3 h-3 w-24 rounded bg-neutral-100" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="h-10 rounded bg-neutral-100" />
            <div className="h-10 rounded bg-neutral-100" />
          </div>
        </article>
      ))}
    </div>
  );
}

function EmptyDesigns({ hasSearch, onClear }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white p-10 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700">
        <Icon type="design" className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-sm font-semibold text-neutral-900">
        {hasSearch ? "No matching designs" : "No custom designs found"}
      </h2>

      <p className="mt-2 max-w-sm text-xs leading-5 text-neutral-500">
        {hasSearch
          ? "Try searching with a different order number, customer or product."
          : "Custom designs will appear here after customers place their orders."}
      </p>

      {hasSearch ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-md border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          Clear search
        </button>
      ) : (
        <Link
          to="/admin/orders"
          className="mt-5 rounded-md bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-black"
        >
          View orders
        </Link>
      )}
    </div>
  );
}

function PreviewModal({ design, previewUrl, onClose }) {
  useEffect(() => {
    if (!design) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [design, onClose]);

  if (!design) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Design preview"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              {design.product_name || "Custom T-Shirt"}
            </h2>

            <p className="mt-1 text-[11px] text-neutral-500">
              {design.order_number || "Saved design"}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          >
            <Icon type="close" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-[#f6f6f7] p-5">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`${design.product_name || "Custom T-shirt"} preview`}
              className="mx-auto max-h-[72vh] max-w-full object-contain"
            />
          ) : (
            <div className="flex min-h-96 items-center justify-center text-sm text-neutral-500">
              Preview unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDesigns() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [designs, setDesigns] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [fileFilter, setFileFilter] = useState(
    searchParams.get("files") || "all",
  );
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (search.trim()) nextParams.set("search", search.trim());
    if (fileFilter !== "all") nextParams.set("files", fileFilter);

    setSearchParams(nextParams, { replace: true });
  }, [search, fileFilter, setSearchParams]);

  useEffect(() => {
    let mounted = true;

    async function loadDesigns() {
      setLoading(true);
      setError("");

      try {
        const designRows = await getCustomDesigns();
        const rows = Array.isArray(designRows) ? designRows : [];

        if (!mounted) return;

        setDesigns(rows);

        const nextUrls = {};

        await Promise.all(
          rows.map(async (design) => {
            if (!design.preview_image_path) return;

            try {
              nextUrls[design.id] = await createSignedFileUrl(
                "design-previews",
                design.preview_image_path,
                60 * 30,
              );
            } catch (previewError) {
              console.error(
                `Could not load preview for design ${design.id}:`,
                previewError,
              );
            }
          }),
        );

        if (mounted) setPreviewUrls(nextUrls);
      } catch (loadError) {
        console.error("Admin designs error:", loadError);

        if (mounted) {
          setError(loadError?.message || "Custom designs could not be loaded.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDesigns();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const uniqueOrders = new Set(
      designs.map((design) => design.order_id).filter(Boolean),
    );

    return {
      orders: uniqueOrders.size,
      quantity: designs.reduce(
        (total, design) => total + Number(design.quantity || 1),
        0,
      ),
      printFiles: designs.filter((design) => design.print_file_path).length,
    };
  }, [designs]);

  const filteredDesigns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return designs.filter((design) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          design.product_name,
          design.order_number,
          design.customer_name,
          design.customer_phone,
          design.tshirt_color,
          design.tshirt_size,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearch),
        );

      const matchesFile =
        fileFilter === "all" ||
        (fileFilter === "ready" && Boolean(design.print_file_path)) ||
        (fileFilter === "missing" && !design.print_file_path);

      return matchesSearch && matchesFile;
    });
  }, [designs, search, fileFilter]);

  const handleDownloadPrintFile = async (design) => {
    if (!design.print_file_path) {
      setError("This design does not have a print file.");
      return;
    }

    setDownloading(design.id);
    setError("");

    try {
      await downloadPrivateFile(
        "print-files",
        design.print_file_path,
        `${design.order_number || design.id}-print.png`,
      );
    } catch (downloadError) {
      console.error("Print file download error:", downloadError);

      setError(
        downloadError?.message || "The print file could not be downloaded.",
      );
    } finally {
      setDownloading("");
    }
  };

  return (
    <section className="min-h-screen bg-[#f6f6f7] p-4 pb-12 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-500">
              TeeLab Administration
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
              Custom designs
            </h1>

            <p className="mt-1 text-xs text-neutral-500">
              Manage T-shirt previews and production-ready files.
            </p>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm">
            {designs.length.toLocaleString("en-EG")}{" "}
            {designs.length === 1 ? "design" : "designs"}
          </div>
        </header>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total designs"
            value={designs.length.toLocaleString("en-EG")}
            icon="design"
            color="bg-violet-100 text-violet-700"
          />

          <SummaryCard
            label="Custom orders"
            value={summary.orders.toLocaleString("en-EG")}
            icon="order"
            color="bg-blue-100 text-blue-700"
          />

          <SummaryCard
            label="Items to produce"
            value={summary.quantity.toLocaleString("en-EG")}
            icon="quantity"
            color="bg-amber-100 text-amber-700"
          />

          <SummaryCard
            label="Print files ready"
            value={`${summary.printFiles}/${designs.length}`}
            icon="file"
            color="bg-emerald-100 text-emerald-700"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mt-5 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-60 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Icon type="search" />
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order, customer or product"
                className="h-9 w-full rounded-md border border-neutral-300 bg-white pl-9 pr-9 text-xs text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-3 text-sm text-neutral-400 hover:text-black"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={fileFilter}
              onChange={(event) => setFileFilter(event.target.value)}
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-600 outline-none focus:border-neutral-600"
            >
              <option value="all">All print files</option>
              <option value="ready">Print file ready</option>
              <option value="missing">Missing print file</option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <LoadingCards />
          ) : !filteredDesigns.length ? (
            <EmptyDesigns
              hasSearch={Boolean(search.trim() || fileFilter !== "all")}
              onClear={() => {
                setSearch("");
                setFileFilter("all");
              }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDesigns.map((design) => {
                const previewUrl = previewUrls[design.id];
                const isDownloading = downloading === design.id;

                return (
                  <article
                    key={design.id}
                    className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDesign(design)}
                      className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-neutral-100"
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={design.product_name || "Custom T-shirt preview"}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-neutral-400">
                          <Icon type="design" className="h-8 w-8" />

                          <p className="mt-2 text-xs">Preview unavailable</p>
                        </div>
                      )}

                      <span className="absolute right-3 top-3 rounded-full bg-violet-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-violet-700">
                        Custom
                      </span>

                      {previewUrl && (
                        <span className="absolute inset-x-3 bottom-3 rounded-md bg-black/70 px-3 py-2 text-center text-[10px] font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                          View full preview
                        </span>
                      )}
                    </button>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-semibold text-neutral-900">
                            {design.product_name || "Custom T-Shirt"}
                          </h2>

                          <p className="mt-1 text-[11px] font-medium text-cyan-700">
                            {design.order_number || "Saved design"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
                            design.print_file_path
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {design.print_file_path
                            ? "Print ready"
                            : "File missing"}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-neutral-100 py-4">
                        <div>
                          <p className="text-[10px] text-neutral-400">
                            Customer
                          </p>

                          <p className="mt-1 truncate text-xs font-medium text-neutral-700">
                            {design.customer_name || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-neutral-400">Phone</p>

                          {design.customer_phone ? (
                            <a
                              href={`tel:${design.customer_phone}`}
                              className="mt-1 flex items-center gap-1 truncate text-xs font-medium text-neutral-700 hover:underline"
                            >
                              <Icon type="phone" className="h-3 w-3 shrink-0" />
                              {design.customer_phone}
                            </a>
                          ) : (
                            <p className="mt-1 text-xs text-neutral-400">—</p>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] text-neutral-400">
                            Color / size
                          </p>

                          <p className="mt-1 text-xs font-medium capitalize text-neutral-700">
                            {design.tshirt_color || "—"} /{" "}
                            <span className="uppercase">
                              {design.tshirt_size || "—"}
                            </span>
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-neutral-400">
                            Quantity
                          </p>

                          <p className="mt-1 text-xs font-medium text-neutral-700">
                            {design.quantity || 1}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-[10px] text-neutral-400">
                        Created {formatDate(design.created_at)}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={!design.print_file_path || isDownloading}
                          onClick={() => handleDownloadPrintFile(design)}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-neutral-900 px-3 text-[10px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-300"
                        >
                          <Icon type="download" />

                          {isDownloading ? "Downloading..." : "Print file"}
                        </button>

                        {design.order_id ? (
                          <Link
                            to={`/admin/orders/${design.order_id}`}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-neutral-300 px-3 text-[10px] font-semibold text-neutral-700 transition hover:bg-neutral-50"
                          >
                            <Icon type="external" />
                            Open order
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-neutral-200 px-3 text-[10px] font-semibold text-neutral-400"
                          >
                            Order unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <PreviewModal
        design={selectedDesign}
        previewUrl={selectedDesign ? previewUrls[selectedDesign.id] : null}
        onClose={() => setSelectedDesign(null)}
      />
    </section>
  );
}
