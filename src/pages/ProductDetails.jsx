import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";

const colorValues = {
  Black: "#111111",
  White: "#FFFFFF",
  Grey: "#9A9A9A",
  Gray: "#9A9A9A",
  Beige: "#D8C5A5",
  Blue: "#AFC7D7",
  Navy: "#1A2333",
  Olive: "#4C5A3D",
  Brown: "#6D4C3D",
  Red: "#9D2727",
};

const productFeatures = [
  "Heavyweight Premium Cotton",
  "Oversized Relaxed Fit",
  "Soft Washed Fabric",
  "Premium TeeLab Finish",
  "Designed for Everyday Comfort",
  "Made in Egypt",
];

const accordionItems = [
  {
    title: "Product Description",
    content:
      "A premium TeeLab essential created with a clean silhouette, comfortable construction, and a timeless finish designed for everyday wear.",
  },
  {
    title: "Size Guide",
    content:
      "Choose your usual size for a relaxed fit. Size down for a closer fit or size up for a more oversized silhouette.",
  },
  {
    title: "Shipping & Delivery",
    content:
      "Orders are prepared within 1–2 business days. Delivery typically takes 2–5 business days depending on your location.",
  },
  {
    title: "Returns & Exchanges",
    content:
      "Items can be exchanged within 14 days when unworn, unwashed, and returned with their original packaging and tags.",
  },
  {
    title: "Care Instructions",
    content:
      "Wash inside out at 30°C with similar colors. Do not bleach. Avoid tumble drying and iron on low heat.",
  },
];

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = products.find((item) => item.id === productId);

  const productImages = useMemo(() => {
    if (product?.images?.length) {
      return product.images;
    }

    return product?.image ? [product.image] : [];
  }, [product]);

  const relatedProducts = useMemo(
    () => products.filter((item) => item.id !== productId).slice(0, 4),
    [productId],
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [imageVisible, setImageVisible] = useState(true);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedSize(product?.sizes?.[0] ?? "");
    setSelectedColor(product?.colors?.[0] ?? "");
    setQuantity(1);
    setZoomed(false);
    setImageVisible(true);
  }, [productId, product]);

  useEffect(() => {
    document.body.style.overflow = sizeModalOpen ? "hidden" : "";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSizeModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [sizeModalOpen]);

  if (!product) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-5 text-center">
        <h1 className="text-3xl font-medium uppercase tracking-[0.18em]">
          Product not found
        </h1>

        <Link
          to="/products"
          className="mt-8 border-b border-black pb-1 text-xs uppercase tracking-[0.18em]"
        >
          Return to products
        </Link>
      </section>
    );
  }

  const selectedImage = productImages[selectedImageIndex];

  const selectImage = (index) => {
    if (index === selectedImageIndex) return;

    setImageVisible(false);
    setZoomed(false);

    window.setTimeout(() => {
      setSelectedImageIndex(index);
      setImageVisible(true);
    }, 150);
  };

  const showPreviousImage = () => {
    const newIndex =
      selectedImageIndex === 0
        ? productImages.length - 1
        : selectedImageIndex - 1;

    selectImage(newIndex);
  };

  const showNextImage = () => {
    const newIndex =
      selectedImageIndex === productImages.length - 1
        ? 0
        : selectedImageIndex + 1;

    selectImage(newIndex);
  };

  const addSelectedProduct = () => {
    for (let index = 0; index < quantity; index += 1) {
      addToCart(product, selectedSize, selectedColor);
    }

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const handleBuyNow = () => {
    for (let index = 0; index < quantity; index += 1) {
      addToCart(product, selectedSize, selectedColor);
    }

    navigate("/cart");
  };

  const handleQuickAdd = (relatedProduct) => {
    addToCart(
      relatedProduct,
      relatedProduct.sizes?.[0] ?? "",
      relatedProduct.colors?.[0] ?? "",
    );
  };

  const handleTouchEnd = (event) => {
    if (touchStart === null || productImages.length < 2) return;

    const touchEnd = event.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        showNextImage();
      } else {
        showPreviousImage();
      }
    }

    setTouchStart(null);
  };

  return (
    <main className="animate-[fadeIn_0.45s_ease-out] bg-white pb-24 text-[#111] lg:pb-0">
      {/* Main product area */}
      <section className="mx-auto grid max-w-[1700px] grid-cols-1 gap-8 px-4 py-6 sm:px-6 md:py-10 lg:grid-cols-[90px_minmax(0,1.35fr)_minmax(390px,0.85fr)] lg:gap-8 lg:px-8 xl:grid-cols-[110px_minmax(0,1.45fr)_minmax(430px,0.85fr)] xl:gap-12">
        {/* Thumbnail gallery */}
        <aside className="order-2 lg:order-1">
          <div
            className="flex gap-3 overflow-x-auto pb-2 lg:max-h-[780px] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0"
            aria-label="Product gallery"
          >
            {productImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => selectImage(index)}
                className={`h-[112px] w-[84px] shrink-0 overflow-hidden border bg-[#F4F4F4] transition-colors duration-300 lg:h-[132px] lg:w-full ${
                  selectedImageIndex === index
                    ? "border-[#111]"
                    : "border-transparent hover:border-[#999]"
                }`}
                aria-label={`View ${product.name} image ${index + 1}`}
                aria-current={selectedImageIndex === index}
              >
                <img
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </aside>

        {/* Main image */}
        <div className="order-1 min-w-0 lg:order-2">
          <div
            className={`group relative flex aspect-[4/5] max-h-[850px] items-center justify-center overflow-hidden bg-[#F4F4F4] ${
              zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={() => setZoomed((current) => !current)}
            onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setZoomed((current) => !current);
              }

              if (event.key === "ArrowLeft" && productImages.length > 1) {
                showPreviousImage();
              }

              if (event.key === "ArrowRight" && productImages.length > 1) {
                showNextImage();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`${zoomed ? "Close" : "Open"} image zoom`}
          >
            <img
              src={selectedImage}
              alt={product.name}
              draggable="false"
              className={`h-full w-full select-none object-contain transition-all duration-500 ease-out ${
                imageVisible ? "opacity-100" : "opacity-0"
              } ${
                zoomed ? "scale-[1.7]" : "scale-100 lg:group-hover:scale-[1.03]"
              }`}
            />

            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPreviousImage();
                  }}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/90 text-xl opacity-100 transition-all duration-300 hover:bg-black hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNextImage();
                  }}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/90 text-xl opacity-100 transition-all duration-300 hover:bg-black hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}

            <span className="pointer-events-none absolute bottom-4 right-4 bg-white/90 px-3 py-2 text-[10px] uppercase tracking-[0.16em]">
              Click to zoom
            </span>
          </div>
        </div>

        {/* Product information */}
        <div className="order-3 lg:sticky lg:top-8 lg:h-fit lg:py-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#666]">
            TeeLab Essentials
          </p>

          <h1 className="mt-4 text-2xl font-medium uppercase leading-tight tracking-[0.2em] sm:text-3xl">
            {product.name}
          </h1>

          <p className="mt-5 text-lg tracking-[0.16em] text-[#666]">
            {product.price.toLocaleString()} EGP
          </p>

          <div className="my-8 h-px bg-[#E5E5E5]" />

          {/* Size selection */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Size</p>

              <button
                type="button"
                onClick={() => setSizeModalOpen(true)}
                className="border-b border-[#111] pb-0.5 text-xs transition-opacity duration-300 hover:opacity-50"
              >
                Size Chart
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`flex h-12 min-w-12 items-center justify-center border px-3 text-xs uppercase transition-all duration-300 active:scale-95 ${
                    selectedSize === size
                      ? "border-[#111] bg-white text-[#111]"
                      : "border-[#E5E5E5] hover:bg-[#F4F4F4]"
                  }`}
                  aria-pressed={selectedSize === size}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color selection */}
          <div className="mt-8">
            <p className="text-sm">
              Color: <span className="text-[#666]">{selectedColor}</span>
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    selectImage(0);
                  }}
                  className={`flex h-10 w-10 items-center justify-center border transition-all duration-300 ${
                    selectedColor === color
                      ? "border-[#111]"
                      : "border-transparent hover:border-[#999]"
                  }`}
                  aria-label={`Select ${color}`}
                  aria-pressed={selectedColor === color}
                  title={color}
                >
                  <span
                    className="h-8 w-8 border border-[#D8D8D8]"
                    style={{
                      backgroundColor:
                        colorValues[color] ?? color.toLowerCase(),
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-8 flex h-14 w-40 items-center border border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              disabled={quantity === 1}
              className="h-12 w-12 text-xl text-[#666] transition-colors duration-300 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span className="flex-1 text-center text-sm">{quantity}</span>

            <button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              className="h-12 w-12 text-xl text-[#666] transition-colors duration-300 hover:text-black"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Buttons */}
          <button
            type="button"
            onClick={addSelectedProduct}
            className="mt-10 h-16 w-full border border-black bg-black px-6 text-xs font-medium uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-white hover:text-black active:scale-[0.985]"
          >
            {added ? "Added to Cart" : "Add to Cart"}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="mt-3 h-16 w-full border border-black bg-white px-6 text-xs font-medium uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-black hover:text-white active:scale-[0.985]"
          >
            Buy It Now
          </button>

          {/* Product features */}
          <ul className="mt-9 space-y-2.5 text-sm leading-6 text-[#666]">
            {productFeatures.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span aria-hidden="true">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Accordions */}
      <section className="mx-auto max-w-[1700px] px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
        <div className="border-t border-[#E5E5E5]">
          {accordionItems.map((item, index) => {
            const isOpen = openAccordion === index;

            return (
              <div key={item.title} className="border-b border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(isOpen ? null : index)}
                  className="flex w-full items-center justify-between py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs font-medium uppercase tracking-[0.18em]">
                    {item.title}
                  </span>

                  <span
                    className={`text-xl font-light transition-transform duration-300 ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  >
                    +
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-3xl pb-7 text-sm leading-7 text-[#666]">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-[1700px] px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
          <div className="mb-9 flex items-end justify-between">
            <h2 className="text-xl font-medium uppercase tracking-[0.2em] sm:text-2xl">
              You May Also Like
            </h2>

            <Link
              to="/products"
              className="hidden border-b border-black pb-1 text-[10px] uppercase tracking-[0.18em] sm:block"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
            {relatedProducts.map((relatedProduct) => (
              <article key={relatedProduct.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F4F4F4]">
                  <Link to={`/products/${relatedProduct.id}`}>
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleQuickAdd(relatedProduct)}
                    className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center bg-white text-xl transition-colors duration-300 hover:bg-black hover:text-white"
                    aria-label={`Quick add ${relatedProduct.name}`}
                  >
                    +
                  </button>
                </div>

                <Link to={`/products/${relatedProduct.id}`}>
                  <h3 className="mt-4 text-xs font-medium uppercase tracking-[0.15em]">
                    {relatedProduct.name}
                  </h3>

                  <p className="mt-2 text-xs tracking-[0.1em] text-[#666]">
                    {relatedProduct.price.toLocaleString()} EGP
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Size chart modal */}
      {sizeModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex animate-[fadeIn_0.3s_ease-out] items-center justify-center bg-black/50 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSizeModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-chart-title"
            className="w-full max-w-2xl animate-[modalIn_0.35s_ease-out] bg-white p-6 sm:p-10"
          >
            <div className="flex items-center justify-between">
              <h2
                id="size-chart-title"
                className="text-xl uppercase tracking-[0.2em]"
              >
                Size Chart
              </h2>

              <button
                type="button"
                onClick={() => setSizeModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center text-2xl transition-opacity hover:opacity-50"
                aria-label="Close size chart"
              >
                ×
              </button>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse text-center text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5E5]">
                    <th className="py-4 text-left font-medium">Size</th>
                    <th className="py-4 font-medium">Chest</th>
                    <th className="py-4 font-medium">Length</th>
                    <th className="py-4 font-medium">Sleeve</th>
                  </tr>
                </thead>

                <tbody className="text-[#666]">
                  {[
                    ["XS", "50 cm", "67 cm", "20 cm"],
                    ["S", "52 cm", "69 cm", "21 cm"],
                    ["M", "55 cm", "72 cm", "22 cm"],
                    ["L", "58 cm", "74 cm", "23 cm"],
                    ["XL", "61 cm", "76 cm", "24 cm"],
                    ["XXL", "64 cm", "78 cm", "25 cm"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-[#E5E5E5]">
                      <td className="py-4 text-left text-[#111]">{row[0]}</td>
                      <td className="py-4">{row[1]}</td>
                      <td className="py-4">{row[2]}</td>
                      <td className="py-4">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-5 text-xs leading-5 text-[#666]">
              Measurements are approximate and may vary by 1–2 cm.
            </p>
          </div>
        </div>
      )}

      {/* Mobile sticky add to cart */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-4 border-t border-[#E5E5E5] bg-white p-3 lg:hidden">
        <div className="shrink-0">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#666]">
            Price
          </p>

          <p className="mt-1 text-sm font-medium">
            {product.price.toLocaleString()} EGP
          </p>
        </div>

        <button
          type="button"
          onClick={addSelectedProduct}
          className="h-14 flex-1 bg-black px-5 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#222]"
        >
          {added ? "Added" : "Add to Cart"}
        </button>
      </div>
    </main>
  );
}

export default ProductDetails;
