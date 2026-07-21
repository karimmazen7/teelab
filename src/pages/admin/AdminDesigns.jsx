import { useEffect, useState } from "react";
import { Link } from "react-router";

import { getCustomDesigns } from "../../services/adminService";
import {
  createSignedFileUrl,
  downloadPrivateFile,
} from "../../services/storageService";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminDesigns() {
  const [designs, setDesigns] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDesigns() {
      setLoading(true);
      setError("");

      try {
        const designRows = await getCustomDesigns();

        if (!mounted) {
          return;
        }

        setDesigns(Array.isArray(designRows) ? designRows : []);

        const nextUrls = {};

        await Promise.all(
          (designRows || []).map(async (design) => {
            if (!design.preview_image_path) {
              return;
            }

            try {
              const signedUrl = await createSignedFileUrl(
                "design-previews",
                design.preview_image_path,
                60 * 30,
              );

              nextUrls[design.id] = signedUrl;
            } catch (previewError) {
              console.error(
                `Could not load preview for design ${design.id}:`,
                previewError,
              );
            }
          }),
        );

        if (mounted) {
          setPreviewUrls(nextUrls);
        }
      } catch (loadError) {
        console.error("Admin designs error:", loadError);

        if (mounted) {
          setError(loadError?.message || "Custom designs could not be loaded.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDesigns();

    return () => {
      mounted = false;
    };
  }, []);

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

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-300 border-t-black" />

          <p className="mt-4 text-neutral-500">Loading custom designs...</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            TeeLab administration
          </p>

          <h1 className="mt-2 text-3xl font-black">Designs</h1>

          <p className="mt-2 text-neutral-500">
            Custom T-shirt previews and production files.
          </p>
        </div>

        <p className="text-sm text-neutral-500">
          {designs.length} {designs.length === 1 ? "design" : "designs"}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {!designs.length ? (
        <div className="mt-8 border border-neutral-200 bg-white p-10 text-center">
          <h2 className="text-xl font-bold">No custom designs found</h2>

          <p className="mt-2 text-neutral-500">
            Custom orders will appear here after customers place them.
          </p>

          <Link
            to="/admin/orders"
            className="mt-6 inline-block bg-black px-5 py-3 font-semibold text-white"
          >
            View Orders
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {designs.map((design) => {
            const previewUrl = previewUrls[design.id];

            return (
              <article
                key={design.id}
                className="border border-neutral-200 bg-white p-4"
              >
                <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-neutral-100">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={design.product_name || "Custom T-shirt preview"}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <p className="px-4 text-center text-sm text-neutral-500">
                      Preview unavailable
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold">
                        {design.product_name || "Custom T-Shirt"}
                      </h2>

                      <p className="mt-1 text-sm text-neutral-500">
                        {design.order_number || "Saved design"}
                      </p>
                    </div>

                    <span className="border border-black px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                      Custom
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-neutral-500">Customer</p>

                      <p className="font-semibold">
                        {design.customer_name || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-neutral-500">Phone</p>

                      {design.customer_phone ? (
                        <a
                          href={`tel:${design.customer_phone}`}
                          className="font-semibold underline"
                        >
                          {design.customer_phone}
                        </a>
                      ) : (
                        <p>—</p>
                      )}
                    </div>

                    <div>
                      <p className="text-neutral-500">Color</p>

                      <p className="font-semibold capitalize">
                        {design.tshirt_color || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-neutral-500">Size</p>

                      <p className="font-semibold uppercase">
                        {design.tshirt_size || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-neutral-500">Quantity</p>

                      <p className="font-semibold">{design.quantity || 1}</p>
                    </div>

                    <div>
                      <p className="text-neutral-500">Created</p>

                      <p className="font-semibold">
                        {formatDate(design.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2">
                    <button
                      type="button"
                      disabled={
                        !design.print_file_path || downloading === design.id
                      }
                      onClick={() => handleDownloadPrintFile(design)}
                      className="w-full bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
                    >
                      {downloading === design.id
                        ? "Downloading..."
                        : "Download Print File"}
                    </button>

                    <Link
                      to={`/admin/orders/${design.order_id}`}
                      className="w-full border border-black px-4 py-3 text-center text-sm font-semibold"
                    >
                      Open Order
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
