import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { useCart } from "../context/CartContext";
import { products } from "../data/products";

const availableSizes = ["S", "M", "L", "XL"];

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG")} EGP`;

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const heroImage = "/images/hero1.png";

  const featuredProducts = products;

  useEffect(() => {
    if (!quickAddProduct) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setQuickAddProduct(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [quickAddProduct]);

  const openQuickAdd = (product) => {
    const firstColor =
      product.colors?.[0]?.name ||
      product.colors?.[0] ||
      product.color ||
      "Black";

    setQuickAddProduct(product);
    setSelectedSize(product.sizes?.[0] || "M");
    setSelectedColor(firstColor);
    setQuantity(1);
    setActiveImageIndex(0);
  };

  const closeQuickAdd = () => {
    setQuickAddProduct(null);
  };

  const handleAddToCart = () => {
    if (!quickAddProduct) return;

    for (let index = 0; index < quantity; index += 1) {
      addToCart(quickAddProduct, selectedSize, selectedColor);
    }

    closeQuickAdd();
  };

  const handleBuyNow = () => {
    if (!quickAddProduct) return;

    for (let index = 0; index < quantity; index += 1) {
      addToCart(quickAddProduct, selectedSize, selectedColor);
    }

    closeQuickAdd();
    navigate("/checkout");
  };

  const quickAddImages = quickAddProduct
    ? Array.from(
        new Set([
          quickAddProduct.image,
          ...(Array.isArray(quickAddProduct.images)
            ? quickAddProduct.images
            : []),
        ]),
      ).filter(Boolean)
    : [];

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[calc(100svh-118px)] items-center justify-center overflow-hidden bg-black"
        style={{
          backgroundImage: `url("${heroImage}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 text-center text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] sm:text-xs">
            SS/26 Collection
          </p>

          <h1 className="mt-5 max-w-5xl text-[42px] font-semibold uppercase leading-[0.98] tracking-[0.05em] sm:text-[60px] lg:text-[76px]">
            Wear What You Create
          </h1>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="min-w-[190px] border border-white px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Available Now
            </Link>

            <Link
              to="/customizer"
              className="min-w-[210px] border border-white px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Create Your Design
            </Link>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-12 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                New Arrivals
              </p>

              <h2 className="mt-4 text-3xl font-semibold uppercase tracking-[0.08em] sm:text-4xl">
                Essentials
              </h2>
            </div>

            <Link
              to="/products"
              className="hidden border-b border-black pb-1 text-xs font-semibold uppercase tracking-[0.2em] sm:block"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-7 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-16">
            {featuredProducts.map((product, index) => (
              <article key={product.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  <Link
                    to={`/products/${product.id}`}
                    aria-label={`View ${product.name}`}
                    className="block h-full w-full"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading={index > 3 ? "lazy" : "eager"}
                      decoding="async"
                      width="800"
                      height="1000"
                      className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                    />
                  </Link>

                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/[0.03]" />

                  <button
                    type="button"
                    aria-label={`Quick add ${product.name}`}
                    onClick={() => openQuickAdd(product)}
                    className="absolute bottom-3 right-3 flex h-12 w-12 translate-y-4 items-center justify-center bg-white text-black opacity-0 shadow-sm transition duration-300 ease-out hover:bg-black hover:text-white focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <PlusIcon />
                  </button>
                </div>

                <div className="pt-5">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-2 text-xs tracking-[0.14em] text-neutral-600 sm:text-sm">
                    {formatMoney(product.price)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <Link
            to="/products"
            className="mt-12 inline-block border-b border-black pb-1 text-xs font-semibold uppercase tracking-[0.2em] sm:hidden"
          >
            View All
          </Link>
        </div>
      </section>

      {/* Custom design */}
      <section className="bg-neutral-100 px-5 py-24 text-center sm:px-8 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Designed By You
          </p>

          <h2 className="mt-5 text-4xl font-semibold uppercase leading-tight tracking-[0.06em] sm:text-6xl">
            Your Idea. Your Tee.
          </h2>

          <p className="mx-auto mt-6 max-w-xl leading-7 text-neutral-600">
            Upload your artwork, add personalized text and create a piece made
            entirely for you.
          </p>

          <Link
            to="/customizer"
            className="mt-9 inline-block border border-black bg-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:bg-transparent hover:text-black"
          >
            Create Your Design
          </Link>
        </div>
      </section>

      {/* Quick-add modal */}
      {quickAddProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeQuickAdd();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick add ${quickAddProduct.name}`}
            className="relative grid max-h-[92svh] w-full max-w-5xl overflow-y-auto bg-white md:grid-cols-2"
          >
            <button
              type="button"
              aria-label="Close quick add"
              onClick={closeQuickAdd}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center bg-white transition hover:bg-neutral-100"
            >
              <CloseIcon />
            </button>

            <div className="bg-neutral-100 p-5 sm:p-8">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={
                    quickAddImages[activeImageIndex] || quickAddProduct.image
                  }
                  alt={quickAddProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {quickAddImages.length > 1 && (
                <div className="mt-5 flex justify-center gap-3">
                  {quickAddImages.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      aria-label={`Show image ${index + 1}`}
                      onClick={() => setActiveImageIndex(index)}
                      className={`h-2 w-2 rounded-full transition ${
                        activeImageIndex === index
                          ? "bg-black"
                          : "bg-neutral-300 hover:bg-neutral-500"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-10">
              <div className="pr-12">
                <h2 className="text-xl font-semibold uppercase tracking-[0.16em] sm:text-2xl">
                  {quickAddProduct.name}
                </h2>

                <p className="mt-4 text-lg tracking-[0.12em] text-neutral-600">
                  {formatMoney(quickAddProduct.price)}
                </p>
              </div>

              <div className="my-8 border-t border-neutral-200" />

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Size:</p>

                  <Link
                    to={`/products/${quickAddProduct.id}`}
                    onClick={closeQuickAdd}
                    className="border-b border-black text-xs"
                  >
                    Size chart
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {(quickAddProduct.sizes?.length
                    ? quickAddProduct.sizes
                    : availableSizes
                  ).map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-12 min-w-12 items-center justify-center border px-3 text-sm transition ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {Array.isArray(quickAddProduct.colors) &&
                quickAddProduct.colors.length > 0 && (
                  <div className="mt-7">
                    <p className="text-sm font-semibold">Color:</p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {quickAddProduct.colors.map((color) => {
                        const colorName =
                          typeof color === "string" ? color : color.name;

                        return (
                          <button
                            type="button"
                            key={colorName}
                            onClick={() => setSelectedColor(colorName)}
                            className={`border px-4 py-3 text-xs uppercase tracking-[0.14em] transition ${
                              selectedColor === colorName
                                ? "border-black bg-black text-white"
                                : "border-neutral-300 hover:border-black"
                            }`}
                          >
                            {colorName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              <div className="mt-7 flex w-fit items-center border border-neutral-300">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  className="flex h-12 w-12 items-center justify-center transition hover:bg-neutral-100"
                >
                  <MinusIcon />
                </button>

                <span className="min-w-12 text-center text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="flex h-12 w-12 items-center justify-center transition hover:bg-neutral-100"
                >
                  <PlusIcon />
                </button>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-black px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full border border-black px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
                >
                  Buy Now
                </button>
              </div>

              <Link
                to={`/products/${quickAddProduct.id}`}
                onClick={closeQuickAdd}
                className="mt-7 w-fit border-b border-black pb-1 text-sm"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
