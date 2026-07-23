import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";

import { useCart } from "../../context/CartContext";

const luxuryEase = [0.22, 1, 0.36, 1];

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M5.5 8.5h13l1 12h-15l1-12Z" />
      <path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
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
      <path d="M5 5l14 14M19 5 5 19" />
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

function Navbar() {
  const { cartItems, cartCount, subtotal, removeFromCart, updateQuantity } =
    useCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const drawerOpen = cartOpen || mobileMenuOpen;

    if (!drawerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [cartOpen, mobileMenuOpen]);

  const navLinkClass = ({ isActive }) =>
    `group relative py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition duration-300 ${
      isActive ? "text-black" : "text-neutral-600 hover:text-black"
    }`;

  const closeMenus = () => {
    setCartOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.65,
          ease: luxuryEase,
        }}
        className="sticky top-0 z-50"
      >
        <div className="flex h-[38px] items-center justify-center bg-black px-4 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white sm:text-xs">
          Free Shipping on orders above EGP 2,000
        </div>

        <nav className="relative flex h-20 items-center border-b border-neutral-200 bg-white px-5 shadow-[0_1px_8px_rgba(0,0,0,0.025)] sm:px-8 lg:px-10">
          <div className="flex flex-1 items-center">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center lg:hidden"
            >
              <MenuIcon />
            </button>

            <div className="hidden items-center gap-7 lg:flex">
              <NavLink to="/" className={navLinkClass}>
                Home
                <span className="absolute bottom-0 left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
              </NavLink>

              <NavLink to="/products" className={navLinkClass}>
                Unisex
                <span className="absolute bottom-0 left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
              </NavLink>

              <NavLink to="/customizer" className={navLinkClass}>
                Create Your Design
                <span className="absolute bottom-0 left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
              </NavLink>
            </div>
          </div>

          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 text-[24px] font-semibold uppercase tracking-[-0.05em] text-black md:text-[26px]"
          >
            TeeLab
          </Link>

          <div className="flex flex-1 items-center justify-end gap-5">
            <Link
              to="/products"
              aria-label="Search products"
              className="hidden transition hover:opacity-55 sm:block"
            >
              <SearchIcon />
            </Link>

            <button
              type="button"
              aria-label={`Open shopping bag with ${cartCount} items`}
              onClick={() => setCartOpen(true)}
              className="relative transition hover:opacity-55"
            >
              <BagIcon />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[9px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              className="fixed inset-0 z-[70] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.42,
                ease: luxuryEase,
              }}
              className="fixed left-0 top-0 z-[80] flex h-full w-[88%] max-w-[420px] flex-col bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  onClick={closeMenus}
                  className="text-[24px] font-semibold uppercase tracking-[-0.05em] text-black md:text-[26px]"
                >
                  TeeLab
                </Link>

                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="mt-16 flex flex-col gap-7">
                {[
                  ["Home", "/"],
                  ["Unisex", "/products"],
                  ["Create Your Design", "/customizer"],
                ].map(([label, path]) => (
                  <Link
                    key={label}
                    to={path}
                    onClick={closeMenus}
                    className="border-b border-neutral-200 pb-5 text-xl font-semibold uppercase tracking-[0.08em]"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <Link
                to="/products"
                onClick={closeMenus}
                className="mt-auto flex items-center justify-center gap-3 border border-black px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em]"
              >
                <SearchIcon />
                Search
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Shopping bag */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close shopping bag overlay"
              className="fixed inset-0 z-[70] bg-black/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Shopping bag"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: 0.45,
                ease: luxuryEase,
              }}
              className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col bg-white"
            >
              <div className="flex h-20 items-center justify-between border-b border-neutral-200 px-6">
                <div>
                  <p className="text-lg font-semibold uppercase tracking-[0.12em]">
                    Cart
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close shopping bag"
                  onClick={() => setCartOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                  {/* <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                    Your Bag
                  </p> */}

                  <h2 className="mt-4 text-2xl font-semibold uppercase">
                    Your cart is empty
                  </h2>

                  {/* <p className="mt-4 text-sm leading-6 text-neutral-500">
                    Explore TeeLab essentials or create a personalized design.
                  </p> */}

                  {/* <Link
                    to="/products"
                    onClick={closeMenus}
                    className="mt-8 w-full bg-black px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white"
                  >
                    Continue Shopping
                  </Link> */}

                  <Link
                    to="/customizer"
                    onClick={closeMenus}
                    className="mt-3 w-full border border-black px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]"
                  >
                    Create Your Design
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-6">
                    <div className="divide-y divide-neutral-200">
                      {cartItems.map((item) => {
                        const itemName =
                          item.productName || item.name || "TeeLab Product";

                        const itemImage = item.previewImage || item.image;

                        const itemSize = item.tshirtSize || item.selectedSize;

                        const itemTotal =
                          Number(item.price || 0) * Number(item.quantity || 1);

                        return (
                          <article
                            key={item.cartItemId}
                            className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 py-6"
                          >
                            <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
                              <img
                                src={itemImage}
                                alt={itemName}
                                className={`h-full w-full ${
                                  item.isCustom
                                    ? "object-contain p-1"
                                    : "object-cover"
                                }`}
                              />
                            </div>

                            <div className="flex min-w-0 flex-col">
                              <div className="flex justify-between gap-3">
                                <div>
                                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em]">
                                    {itemName}
                                  </h3>

                                  {itemSize && (
                                    <p className="mt-2 text-xs text-neutral-500">
                                      Size: {itemSize}
                                    </p>
                                  )}

                                  {item.isCustom && (
                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                      Custom Design
                                    </p>
                                  )}
                                </div>

                                <p className="shrink-0 text-sm font-semibold">
                                  {Number(itemTotal).toFixed(2)} EGP
                                </p>
                              </div>

                              <div className="mt-auto flex items-center justify-between pt-4">
                                <div className="flex items-center border border-neutral-300">
                                  <button
                                    type="button"
                                    aria-label={`Decrease ${itemName} quantity`}
                                    onClick={() =>
                                      updateQuantity(
                                        item.cartItemId,
                                        item.quantity - 1,
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center"
                                  >
                                    <MinusIcon />
                                  </button>

                                  <span className="min-w-8 text-center text-xs font-semibold">
                                    {item.quantity}
                                  </span>

                                  <button
                                    type="button"
                                    aria-label={`Increase ${itemName} quantity`}
                                    onClick={() =>
                                      updateQuantity(
                                        item.cartItemId,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center"
                                  >
                                    <PlusIcon />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromCart(item.cartItemId)
                                  }
                                  className="text-xs text-neutral-500 underline underline-offset-4 hover:text-black"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm uppercase tracking-[0.15em]">
                        Subtotal
                      </span>

                      <span className="font-semibold">
                        {Number(subtotal).toFixed(2)} EGP
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-neutral-500">
                      Delivery fees are calculated during checkout.
                    </p>

                    <Link
                      to="/checkout"
                      onClick={closeMenus}
                      className="mt-6 block bg-black px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
                    >
                      Checkout
                    </Link>

                    {/* <Link
                      to="/cart"
                      onClick={closeMenus}
                      className="mt-3 block border border-black px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
                    >
                      View Bag
                    </Link> */}

                    {/* <button
                      type="button"
                      onClick={() => setCartOpen(false)}
                      className="mt-4 w-full text-center text-xs underline underline-offset-4"
                    >
                      Continue Shopping
                    </button> */}
                  </div>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
