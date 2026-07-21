import { Link } from "react-router";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cartItems, subtotal, removeFromCart, updateQuantity } = useCart();

  if (cartItems.length === 0) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Your bag
        </p>

        <h1 className="mt-4 text-4xl font-black">Your cart is empty</h1>

        <p className="mt-4 max-w-md leading-7 text-neutral-500">
          Add a TeeLab product or create your own custom T-shirt to start your
          order.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/products"
            className="bg-black px-7 py-4 font-semibold text-white transition hover:bg-neutral-800"
          >
            Browse products
          </Link>

          <Link
            to="/customizer"
            className="border border-black px-7 py-4 font-semibold transition hover:bg-black hover:text-white"
          >
            Create Your Design
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:py-16 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Your bag
        </p>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Shopping cart</h1>

        <p className="mt-4 text-neutral-500">
          Review your products before continuing to checkout.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {cartItems.map((item) => {
            const itemImage = item.previewImage || item.image;

            const itemName = item.productName || item.name || "TeeLab Product";

            const itemColor = item.tshirtColor || item.selectedColor;

            const itemSize = item.tshirtSize || item.selectedSize;

            const itemTotal = Number(item.price) * item.quantity;

            return (
              <article
                key={item.cartItemId}
                className="grid grid-cols-[100px_minmax(0,1fr)] gap-4 py-6 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6 sm:py-7"
              >
                <div className="overflow-hidden bg-neutral-100">
                  <img
                    src={itemImage}
                    alt={itemName}
                    className={`aspect-[4/5] h-full w-full ${
                      item.isCustom ? "object-contain p-2" : "object-cover"
                    }`}
                  />
                </div>

                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold sm:text-lg">
                          {itemName}
                        </h2>

                        {item.isCustom && (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                            Custom design
                          </p>
                        )}
                      </div>

                      <p className="shrink-0 font-semibold">{itemTotal} EGP</p>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-neutral-500">
                      {itemColor && (
                        <p>
                          Color:{" "}
                          <span className="capitalize text-neutral-700">
                            {itemColor}
                          </span>
                        </p>
                      )}

                      {itemSize && (
                        <p>
                          Size:{" "}
                          <span className="text-neutral-700">{itemSize}</span>
                        </p>
                      )}

                      <p>
                        Unit price:{" "}
                        <span className="text-neutral-700">
                          {item.price} EGP
                        </span>
                      </p>
                    </div>

                    {item.isCustom && item.designData && (
                      <div className="mt-4">
                        <Link
                          to="/customizer"
                          className="text-sm font-semibold underline underline-offset-4"
                        >
                          Create another design
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-fit items-center border border-neutral-300">
                      <button
                        type="button"
                        aria-label={`Decrease quantity for ${itemName}`}
                        onClick={() =>
                          updateQuantity(item.cartItemId, item.quantity - 1)
                        }
                        className="flex h-11 w-11 items-center justify-center text-lg transition hover:bg-neutral-100"
                      >
                        −
                      </button>

                      <span className="min-w-11 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={`Increase quantity for ${itemName}`}
                        onClick={() =>
                          updateQuantity(item.cartItemId, item.quantity + 1)
                        }
                        className="flex h-11 w-11 items-center justify-center text-lg transition hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="w-fit text-sm text-neutral-500 underline underline-offset-4 transition hover:text-black"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="h-fit border border-neutral-200 bg-neutral-50 p-6 sm:p-7 lg:sticky lg:top-28">
          <h2 className="text-xl font-bold">Order summary</h2>

          <div className="mt-7 space-y-4">
            <div className="flex justify-between gap-5">
              <span className="text-neutral-600">Items</span>

              <span className="font-semibold">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </div>

            <div className="flex justify-between gap-5 border-b border-neutral-300 pb-5">
              <span className="text-neutral-600">Subtotal</span>

              <span className="font-semibold">{subtotal} EGP</span>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-neutral-500">
            Shipping fees will be calculated during checkout.
          </p>

          <Link
            to="/checkout"
            className="mt-7 block bg-black px-6 py-4 text-center font-semibold text-white transition hover:bg-neutral-800"
          >
            Proceed to checkout
          </Link>

          <Link
            to="/products"
            className="mt-3 block border border-black px-6 py-4 text-center font-semibold transition hover:bg-black hover:text-white"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default Cart;
