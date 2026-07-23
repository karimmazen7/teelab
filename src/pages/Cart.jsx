import { motion } from "framer-motion";
import { Link } from "react-router";

import { useCart } from "../context/CartContext";

const luxuryEase = [0.22, 1, 0.36, 1];

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG")} EGP`;

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

function Cart() {
  const {
    cartItems,
    cartCount,
    subtotal,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getCartItemKey,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <section className="flex min-h-[75svh] flex-col items-center justify-center px-5 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: luxuryEase,
          }}
          className="max-w-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Cart
          </p>

          <h1 className="mt-5 text-4xl font-semibold uppercase tracking-[0.06em] sm:text-6xl">
            Your Cart Is Empty
          </h1>

          <p className="mx-auto mt-6 max-w-md leading-7 text-neutral-500">
            Discover TeeLab essentials or create a personalized T-shirt made
            entirely by you.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="bg-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
            >
              Browse Products
            </Link>

            <Link
              to="/customizer"
              className="border border-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
            >
              Create Your Design
            </Link>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-screen max-w-[1500px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.65,
          ease: luxuryEase,
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Shopping Cart
        </p>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl font-semibold uppercase tracking-[0.06em] sm:text-6xl">
              Cart
            </h1>

            <p className="mt-4 text-sm text-neutral-500">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-xs uppercase tracking-[0.14em] text-neutral-500 underline underline-offset-4 transition hover:text-black"
          >
            Clear Cart
          </button>
        </div>
      </motion.div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="border-t border-neutral-300">
          {cartItems.map((item, index) => {
            const cartItemKey = getCartItemKey(item);

            const itemImage = item.previewImage || item.image;

            const itemName = item.productName || item.name || "TeeLab Product";

            const itemColor = item.tshirtColor || item.selectedColor;

            const itemSize = item.tshirtSize || item.selectedSize;

            const itemTotal =
              (Number(item.price) || 0) *
              Math.max(1, Number(item.quantity) || 1);

            return (
              <motion.article
                key={cartItemKey}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.06,
                  ease: luxuryEase,
                }}
                className="grid grid-cols-[110px_minmax(0,1fr)] gap-5 border-b border-neutral-300 py-7 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8 sm:py-9"
              >
                <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
                  <img
                    src={itemImage}
                    alt={itemName}
                    className={`h-full w-full ${
                      item.isCustom ? "object-contain p-2" : "object-cover"
                    }`}
                  />
                </div>

                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] sm:text-base">
                          {itemName}
                        </h2>

                        {item.isCustom && (
                          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                            Custom Design
                          </p>
                        )}
                      </div>

                      <p className="shrink-0 text-sm font-semibold sm:text-base">
                        {formatMoney(itemTotal)}
                      </p>
                    </div>

                    <div className="mt-5 space-y-2 text-xs text-neutral-500 sm:text-sm">
                      {itemColor && (
                        <p>
                          Color:{" "}
                          <span className="capitalize text-black">
                            {itemColor}
                          </span>
                        </p>
                      )}

                      {itemSize && (
                        <p>
                          Size:{" "}
                          <span className="uppercase text-black">
                            {itemSize}
                          </span>
                        </p>
                      )}

                      <p>
                        Unit Price:{" "}
                        <span className="text-black">
                          {formatMoney(item.price)}
                        </span>
                      </p>
                    </div>

                    {item.isCustom && (
                      <Link
                        to="/customizer"
                        className="mt-5 inline-block border-b border-black pb-1 text-xs font-semibold"
                      >
                        Create Another Design
                      </Link>
                    )}
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
                    <div className="flex items-center border border-neutral-300">
                      <button
                        type="button"
                        aria-label={`Decrease quantity for ${itemName}`}
                        onClick={() => decreaseQuantity(cartItemKey)}
                        disabled={Number(item.quantity) <= 1}
                        className="flex h-11 w-11 items-center justify-center transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <MinusIcon />
                      </button>

                      <span className="min-w-11 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={`Increase quantity for ${itemName}`}
                        onClick={() => increaseQuantity(cartItemKey)}
                        className="flex h-11 w-11 items-center justify-center transition hover:bg-neutral-100"
                      >
                        <PlusIcon />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(cartItemKey)}
                      className="text-xs text-neutral-500 underline underline-offset-4 transition hover:text-black"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <aside className="h-fit border border-neutral-300 bg-white p-6 sm:p-8 lg:sticky lg:top-[150px]">
          <h2 className="text-xl font-semibold uppercase tracking-[0.1em]">
            Order Summary
          </h2>

          <div className="mt-8 space-y-5">
            <div className="flex items-center justify-between gap-5">
              <span className="text-sm text-neutral-600">Items</span>

              <span className="text-sm font-semibold">{cartCount}</span>
            </div>

            <div className="flex items-center justify-between gap-5 border-b border-neutral-300 pb-6">
              <span className="text-sm text-neutral-600">Subtotal</span>

              <span className="font-semibold">{formatMoney(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between gap-5">
              <span className="text-sm text-neutral-600">Delivery</span>

              <span className="text-sm">Calculated at checkout</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-neutral-300 pt-6">
            <span className="font-semibold uppercase tracking-[0.1em]">
              Total
            </span>

            <span className="text-xl font-semibold">
              {formatMoney(subtotal)}
            </span>
          </div>

          <Link
            to="/checkout"
            className="mt-8 block bg-black px-6 py-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
          >
            Proceed to Checkout
          </Link>

          <Link
            to="/products"
            className="mt-3 block border border-black px-6 py-5 text-center text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
          >
            Continue Shopping
          </Link>

          <p className="mt-5 text-center text-xs leading-5 text-neutral-500">
            Free shipping on orders above EGP 2,000.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default Cart;
