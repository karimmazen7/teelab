import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import LocationPicker from "../components/checkout/LocationPicker";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../services/orderService";

const initialCustomer = { fullName: "", phone: "", email: "" };
const initialAddress = {
  country: "Egypt",
  governorate: "",
  city: "",
  area: "",
  streetName: "",
  buildingNumber: "",
  floorNumber: "",
  apartmentNumber: "",
  landmark: "",
  postalCode: "",
  deliveryNotes: "",
  latitude: null,
  longitude: null,
  accuracy: null,
};

const inputClass =
  "w-full border border-neutral-300 px-4 py-3.5 outline-none transition focus:border-black";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();
  const [customer, setCustomer] = useState(initialCustomer);
  const [address, setAddress] = useState(initialAddress);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee = subtotal >= 1500 ? 0 : 75;
  const total = subtotal + deliveryFee;

  const valid = useMemo(
    () =>
      customer.fullName.trim().length >= 2 &&
      customer.phone.trim() &&
      address.governorate.trim() &&
      address.city.trim() &&
      address.streetName.trim() &&
      confirmed &&
      cartItems.length > 0,
    [customer, address, confirmed, cartItems],
  );

  const changeCustomer = (key) => (event) =>
    setCustomer((current) => ({ ...current, [key]: event.target.value }));

  const changeAddress = (key) => (event) =>
    setAddress((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (!valid || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const result = await placeOrder({
        customer,
        address,
        cartItems,
        deliveryFee,
      });

      sessionStorage.setItem(
        `teelab-order-${result.order_number}`,
        JSON.stringify({
          token: result.public_token,
          customerName: customer.fullName,
        }),
      );

      clearCart();
      navigate(`/order-success/${result.order_number}`);
    } catch (checkoutError) {
      console.error(checkoutError);
      setError(checkoutError.message || "The order could not be created.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!cartItems.length) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <h1 className="text-3xl font-black">Your cart is empty</h1>
        <Link to="/customizer" className="mt-6 bg-black px-7 py-4 text-white">
          Create a design
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-screen max-w-7xl px-5 py-12 lg:px-8">
      <h1 className="text-4xl font-black">Checkout</h1>

      <form
        onSubmit={submit}
        className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]"
      >
        <div className="space-y-10">
          <fieldset>
            <legend className="text-xl font-bold">Contact information</legend>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">
                  Full name *
                </span>
                <input
                  className={inputClass}
                  value={customer.fullName}
                  onChange={changeCustomer("fullName")}
                  required
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Phone *
                </span>
                <input
                  className={inputClass}
                  value={customer.phone}
                  onChange={changeCustomer("phone")}
                  placeholder="01XXXXXXXXX"
                  required
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">Email</span>
                <input
                  type="email"
                  className={inputClass}
                  value={customer.email}
                  onChange={changeCustomer("email")}
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xl font-bold">Delivery address</legend>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["country", "Country"],
                ["governorate", "Governorate *"],
                ["city", "City *"],
                ["area", "Area"],
                ["streetName", "Street name *"],
                ["buildingNumber", "Building number"],
                ["floorNumber", "Floor number"],
                ["apartmentNumber", "Apartment number"],
                ["landmark", "Nearby landmark"],
                ["postalCode", "Postal code"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className={key === "streetName" ? "sm:col-span-2" : ""}
                >
                  <span className="mb-2 block text-sm font-semibold">
                    {label}
                  </span>
                  <input
                    className={inputClass}
                    value={address[key]}
                    onChange={changeAddress(key)}
                    required={["governorate", "city", "streetName"].includes(
                      key,
                    )}
                  />
                </label>
              ))}

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">
                  Delivery notes
                </span>
                <textarea
                  rows="4"
                  className={inputClass}
                  value={address.deliveryNotes}
                  onChange={changeAddress("deliveryNotes")}
                />
              </label>
            </div>
          </fieldset>

          <section>
            <h2 className="text-xl font-bold">Exact location</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Optional when your written address is complete.
            </p>
            <div className="mt-4">
              <LocationPicker
                location={address}
                onChange={(location) =>
                  setAddress((current) => ({ ...current, ...location }))
                }
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">Payment method</h2>
            <label className="mt-4 flex items-center gap-3 border border-black p-5">
              <input type="radio" checked readOnly />
              <span className="font-semibold">Cash on Delivery</span>
            </label>
          </section>

          <label className="flex items-start gap-3 border border-neutral-300 p-5">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1"
            />
            <span className="text-sm leading-6">
              I confirm that the design, size, color and delivery information
              are correct.
            </span>
          </label>

          {error && (
            <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <aside className="h-fit border border-neutral-200 bg-neutral-50 p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-bold">Order summary</h2>
          <div className="mt-6 space-y-5">
            {cartItems.map((item) => (
              <article key={item.cartItemId} className="flex gap-4">
                <img
                  src={item.previewImage || item.image}
                  alt=""
                  className="h-24 w-20 bg-white object-contain"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">
                    {item.productName || item.name}
                  </p>
                  <p className="mt-1 text-neutral-500">
                    {item.tshirtColor || item.selectedColor} /{" "}
                    {item.tshirtSize || item.selectedSize} × {item.quantity}
                  </p>
                  <p className="mt-2 font-semibold">
                    {item.price * item.quantity} EGP
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-neutral-300 pt-5">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subtotal} EGP</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{deliveryFee ? `${deliveryFee} EGP` : "Free"}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-300 pt-4 text-lg font-bold">
              <span>Total</span>
              <span>{total} EGP</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!valid || submitting}
            className="mt-7 w-full bg-black px-5 py-5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {submitting ? "Placing order..." : "Place Order"}
          </button>
        </aside>
      </form>
    </section>
  );
}
