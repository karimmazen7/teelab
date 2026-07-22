import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import LocationPicker from "../components/checkout/LocationPicker";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../services/orderService";

const governorates = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbia",
  "Ismailia",
  "Menofia",
  "Minya",
  "Qaliubiya",
  "New Valley",
  "Suez",
  "Aswan",
  "Assiut",
  "Beni Suef",
  "Port Said",
  "Damietta",
  "Sharkia",
  "South Sinai",
  "Kafr El Sheikh",
  "Matrouh",
  "Luxor",
  "Qena",
  "North Sinai",
  "Sohag",
];

const initialCustomer = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
};

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

const initialBillingAddress = {
  country: "Egypt",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  governorate: "",
  postalCode: "",
  phone: "",
};

const fieldClass = (hasError = false) =>
  [
    "h-14 w-full rounded-xl border bg-white px-[18px]",
    "text-[15px] text-black outline-none",
    "transition duration-200",
    "placeholder:text-neutral-500",
    "focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]",
    hasError ? "border-red-500" : "border-[#DADADA]",
  ].join(" ");

const textareaClass = (hasError = false) =>
  [
    "min-h-28 w-full resize-y rounded-xl border bg-white px-[18px] py-4",
    "text-[15px] text-black outline-none",
    "transition duration-200",
    "placeholder:text-neutral-500",
    "focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]",
    hasError ? "border-red-500" : "border-[#DADADA]",
  ].join(" ");

const formatMoney = (value) =>
  `EGP ${Number(value || 0).toLocaleString("en-EG")}`;

function ChevronIcon({ open = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-5 w-5 transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ErrorMessage({ children }) {
  if (!children) {
    return null;
  }

  return <p className="mt-2 text-xs text-red-600">{children}</p>;
}

function FloatingField({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  error,
  required = false,
  inputMode,
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={`${label}${required ? "" : " (optional)"}`}
        aria-invalid={Boolean(error)}
        className={fieldClass(Boolean(error))}
      />

      <ErrorMessage>{error}</ErrorMessage>
    </label>
  );
}

function OrderSummary({
  cartItems,
  subtotal,
  deliveryFee,
  total,
  discountCode,
  setDiscountCode,
  discountMessage,
  onApplyDiscount,
}) {
  return (
    <div>
      <div className="space-y-5">
        {cartItems.map((item) => {
          const image = item.previewImage || item.image;

          const name = item.productName || item.name || "TeeLab Product";

          const size = item.tshirtSize || item.selectedSize;

          const color = item.tshirtColor || item.selectedColor;

          const itemTotal =
            Number(item.price || 0) * Number(item.quantity || 1);

          return (
            <article
              key={item.cartItemId}
              className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4"
            >
              <div className="relative">
                <div className="h-[72px] w-[72px] overflow-hidden rounded-xl border border-[#E6E6E6] bg-white">
                  <img
                    src={image}
                    alt={name}
                    className={`h-full w-full ${
                      item.isCustom ? "object-contain p-1" : "object-cover"
                    }`}
                  />
                </div>

                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-black px-1 text-xs font-semibold text-white">
                  {item.quantity}
                </span>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-black">
                  {name}
                </p>

                <p className="mt-1 text-xs text-[#666]">
                  {[color, size].filter(Boolean).join(" / ")}
                </p>

                {item.isCustom && (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666]">
                    Custom design
                  </p>
                )}
              </div>

              <p className="whitespace-nowrap text-sm font-medium">
                {formatMoney(itemTotal)}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <input
          value={discountCode}
          onChange={(event) => setDiscountCode(event.target.value)}
          placeholder="Discount code"
          className="h-14 min-w-0 flex-1 rounded-xl border border-[#DADADA] bg-white px-[18px] outline-none transition duration-200 focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
        />

        <button
          type="button"
          disabled={!discountCode.trim()}
          onClick={onApplyDiscount}
          className="h-14 rounded-xl border border-[#E6E6E6] bg-[#EFEFEF] px-5 font-semibold text-[#666] transition duration-200 hover:bg-[#E5E5E5] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      {discountMessage && (
        <p className="mt-2 text-xs text-[#666]">{discountMessage}</p>
      )}

      <div className="mt-9 space-y-4">
        <div className="flex items-center justify-between gap-5">
          <span className="text-sm text-[#333]">Subtotal</span>

          <span className="text-sm">{formatMoney(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between gap-5">
          <span className="text-sm text-[#333]">Shipping</span>

          <span className="text-sm">
            {deliveryFee ? formatMoney(deliveryFee) : "Free"}
          </span>
        </div>

        <div className="border-t border-[#E6E6E6] pt-5">
          <div className="flex items-end justify-between gap-5">
            <span className="text-lg font-semibold">Total</span>

            <div className="text-right">
              <span className="mr-2 text-xs text-[#666]">EGP</span>

              <span className="text-2xl font-bold">
                {Number(total || 0).toLocaleString("en-EG")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();

  const { cartItems, subtotal, clearCart } = useCart();

  const [customer, setCustomer] = useState(initialCustomer);

  const [address, setAddress] = useState(initialAddress);

  const [billingAddress, setBillingAddress] = useState(initialBillingAddress);

  const [useDifferentBilling, setUseDifferentBilling] = useState(false);

  const [confirmed, setConfirmed] = useState(false);

  const [emailMarketing, setEmailMarketing] = useState(false);

  const [saveInformation, setSaveInformation] = useState(false);

  const [summaryOpen, setSummaryOpen] = useState(false);

  const [discountCode, setDiscountCode] = useState("");

  const [discountMessage, setDiscountMessage] = useState("");

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // Existing TeeLab shipping logic is preserved.
  const deliveryFee = subtotal >= 1500 ? 0 : 75;

  const total = Number(subtotal) + Number(deliveryFee);

  const changeCustomer = (key) => (event) => {
    const value = event.target.value;

    setCustomer((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: "",
    }));
  };

  const changeAddress = (key) => (event) => {
    const value = event.target.value;

    setAddress((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: "",
    }));
  };

  const changeBilling = (key) => (event) => {
    const value = event.target.value;

    setBillingAddress((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [`billing_${key}`]: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!customer.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!customer.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!customer.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!customer.phone.trim()) {
      nextErrors.phone = "Phone is required.";
    }

    if (!address.streetName.trim()) {
      nextErrors.streetName = "Address is required.";
    }

    if (!address.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!address.governorate.trim()) {
      nextErrors.governorate = "Governorate is required.";
    }

    if (useDifferentBilling) {
      if (!billingAddress.firstName.trim()) {
        nextErrors.billing_firstName = "First name is required.";
      }

      if (!billingAddress.lastName.trim()) {
        nextErrors.billing_lastName = "Last name is required.";
      }

      if (!billingAddress.address.trim()) {
        nextErrors.billing_address = "Billing address is required.";
      }

      if (!billingAddress.city.trim()) {
        nextErrors.billing_city = "City is required.";
      }

      if (!billingAddress.governorate.trim()) {
        nextErrors.billing_governorate = "Governorate is required.";
      }
    }

    if (!confirmed) {
      nextErrors.confirmed = "Confirm that the order information is correct.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const valid = useMemo(
    () => cartItems.length > 0 && !submitting,
    [cartItems.length, submitting],
  );

  const applyDiscount = () => {
    if (!discountCode.trim()) {
      return;
    }

    setDiscountMessage("This discount code is not currently available.");
  };

  async function submit(event) {
    event.preventDefault();

    if (submitting || !validateForm()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const fullName =
        `${customer.firstName.trim()} ${customer.lastName.trim()}`.trim();

      const result = await placeOrder({
        customer: {
          fullName,
          email: customer.email.trim(),
          phone: customer.phone.trim(),
        },

        address,
        cartItems,
        deliveryFee,
      });

      sessionStorage.setItem(
        `teelab-order-${result.order_number}`,
        JSON.stringify({
          token: result.public_token,
          customerName: fullName,
        }),
      );

      clearCart();

      navigate(`/order-success/${result.order_number}`);
    } catch (checkoutError) {
      console.error(checkoutError);

      setError(checkoutError?.message || "The order could not be created.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!cartItems.length) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#666]">
          Checkout
        </p>

        <h1 className="mt-4 text-4xl font-bold">Your cart is empty</h1>

        <p className="mt-4 max-w-md leading-7 text-[#666]">
          Add a product or create a custom TeeLab design before checking out.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/products"
            className="rounded-xl bg-black px-7 py-4 font-semibold text-white transition hover:bg-[#222]"
          >
            Shop Products
          </Link>

          <Link
            to="/customizer"
            className="rounded-xl border border-black px-7 py-4 font-semibold transition hover:bg-black hover:text-white"
          >
            Create a Design
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white font-['Montserrat',Arial,sans-serif]">
      <form
        onSubmit={submit}
        noValidate
        className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[65%_35%]"
      >
        {/* Mobile summary */}
        <div className="border-b border-[#E6E6E6] bg-[#F7F7F7] lg:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-4 px-5 py-5"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              Order summary
              <ChevronIcon open={summaryOpen} />
            </span>

            <span className="font-bold">{formatMoney(total)}</span>
          </button>

          <AnimatePresence initial={false}>
            {summaryOpen && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="overflow-hidden"
              >
                <div className="border-t border-[#E6E6E6] px-5 py-6">
                  <OrderSummary
                    cartItems={cartItems}
                    subtotal={subtotal}
                    deliveryFee={deliveryFee}
                    total={total}
                    discountCode={discountCode}
                    setDiscountCode={setDiscountCode}
                    discountMessage={discountMessage}
                    onApplyDiscount={applyDiscount}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Checkout form */}
        <main className="bg-white px-5 py-10 sm:px-8 lg:px-12 lg:py-14 xl:px-20">
          <div className="mx-auto max-w-[760px]">
            <div className="mb-12 flex items-center justify-between">
              <Link to="/" className="text-3xl font-bold tracking-tight">
                TeeLab
              </Link>

              <Link
                to="/cart"
                className="text-sm font-medium underline underline-offset-4"
              >
                Return to cart
              </Link>
            </div>

            <motion.section
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
              }}
            >
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Contact</h1>

                <Link
                  to="/admin/login"
                  className="text-sm underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-5">
                <FloatingField
                  label="Email"
                  name="email"
                  type="email"
                  value={customer.email}
                  onChange={changeCustomer("email")}
                  error={errors.email}
                  required
                  autoComplete="email"
                />

                <label className="mt-4 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={emailMarketing}
                    onChange={(event) =>
                      setEmailMarketing(event.target.checked)
                    }
                    className="mt-0.5 h-5 w-5 rounded border-[#DADADA] accent-black"
                  />

                  <span className="text-sm">Email me with news and offers</span>
                </label>
              </div>
            </motion.section>

            <motion.section
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.05,
                duration: 0.35,
              }}
              className="mt-11"
            >
              <h2 className="text-2xl font-bold">Delivery</h2>

              <div className="mt-5 grid gap-3">
                <label className="relative block">
                  <span className="pointer-events-none absolute left-[18px] top-2 text-[11px] text-[#666]">
                    Country / Region
                  </span>

                  <select
                    value={address.country}
                    onChange={changeAddress("country")}
                    className="h-14 w-full appearance-none rounded-xl border border-[#DADADA] bg-white px-[18px] pb-1 pt-5 outline-none transition duration-200 focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
                  >
                    <option value="Egypt">Egypt</option>
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronIcon />
                  </span>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FloatingField
                    label="First name"
                    name="firstName"
                    value={customer.firstName}
                    onChange={changeCustomer("firstName")}
                    error={errors.firstName}
                    required
                    autoComplete="given-name"
                  />

                  <FloatingField
                    label="Last name"
                    name="lastName"
                    value={customer.lastName}
                    onChange={changeCustomer("lastName")}
                    error={errors.lastName}
                    required
                    autoComplete="family-name"
                  />
                </div>

                <FloatingField
                  label="Address"
                  name="streetName"
                  value={address.streetName}
                  onChange={changeAddress("streetName")}
                  error={errors.streetName}
                  required
                  autoComplete="street-address"
                />

                <FloatingField
                  label="Apartment, suite, building number, etc."
                  name="buildingNumber"
                  value={address.buildingNumber}
                  onChange={changeAddress("buildingNumber")}
                  autoComplete="address-line2"
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  <FloatingField
                    label="City"
                    name="city"
                    value={address.city}
                    onChange={changeAddress("city")}
                    error={errors.city}
                    required
                    autoComplete="address-level2"
                  />

                  <label className="block">
                    <span className="sr-only">Governorate</span>

                    <select
                      value={address.governorate}
                      onChange={changeAddress("governorate")}
                      aria-invalid={Boolean(errors.governorate)}
                      className={`${fieldClass(
                        Boolean(errors.governorate),
                      )} appearance-none`}
                    >
                      <option value="">Governorate</option>

                      {governorates.map((governorate) => (
                        <option key={governorate} value={governorate}>
                          {governorate}
                        </option>
                      ))}
                    </select>

                    <ErrorMessage>{errors.governorate}</ErrorMessage>
                  </label>

                  <FloatingField
                    label="Postal code"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={changeAddress("postalCode")}
                    autoComplete="postal-code"
                  />
                </div>

                <FloatingField
                  label="Phone"
                  name="phone"
                  value={customer.phone}
                  onChange={changeCustomer("phone")}
                  error={errors.phone}
                  required
                  inputMode="tel"
                  autoComplete="tel"
                />

                <FloatingField
                  label="Area"
                  name="area"
                  value={address.area}
                  onChange={changeAddress("area")}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <FloatingField
                    label="Floor number"
                    name="floorNumber"
                    value={address.floorNumber}
                    onChange={changeAddress("floorNumber")}
                  />

                  <FloatingField
                    label="Apartment number"
                    name="apartmentNumber"
                    value={address.apartmentNumber}
                    onChange={changeAddress("apartmentNumber")}
                  />
                </div>

                <FloatingField
                  label="Nearby landmark"
                  name="landmark"
                  value={address.landmark}
                  onChange={changeAddress("landmark")}
                />

                <label>
                  <span className="sr-only">Delivery notes</span>

                  <textarea
                    value={address.deliveryNotes}
                    onChange={changeAddress("deliveryNotes")}
                    placeholder="Delivery notes (optional)"
                    className={textareaClass()}
                  />
                </label>

                <label className="mt-1 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={saveInformation}
                    onChange={(event) =>
                      setSaveInformation(event.target.checked)
                    }
                    className="mt-0.5 h-5 w-5 rounded border-[#DADADA] accent-black"
                  />

                  <span className="text-sm">
                    Save this information for next time
                  </span>
                </label>
              </div>
            </motion.section>

            <motion.section
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
                duration: 0.35,
              }}
              className="mt-11"
            >
              <h2 className="text-2xl font-bold">Exact location</h2>

              <p className="mt-2 text-sm leading-6 text-[#666]">
                Optional when your written address is complete.
              </p>

              <div className="mt-5 overflow-hidden rounded-xl">
                <LocationPicker
                  location={address}
                  onChange={(location) =>
                    setAddress((current) => ({
                      ...current,
                      ...location,
                    }))
                  }
                />
              </div>
            </motion.section>

            <motion.section
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
                duration: 0.35,
              }}
              className="mt-11"
            >
              <h2 className="text-2xl font-bold">Shipping method</h2>

              <div className="mt-5 flex min-h-14 items-center justify-between gap-5 rounded-xl border border-black px-[18px]">
                <div>
                  <p className="font-semibold">Standard</p>

                  <p className="mt-1 text-xs text-[#666]">Standard delivery</p>
                </div>

                <p className="font-semibold">
                  {deliveryFee ? formatMoney(deliveryFee) : "Free"}
                </p>
              </div>
            </motion.section>

            <motion.section
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
                duration: 0.35,
              }}
              className="mt-11"
            >
              <h2 className="text-2xl font-bold">Payment</h2>

              <p className="mt-1 text-sm text-[#666]">
                Your order information is handled securely.
              </p>

              <div className="mt-5 overflow-hidden rounded-xl border border-black">
                <label className="flex cursor-pointer items-start gap-3 bg-[#F7F7F7] px-[18px] py-5">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="mt-0.5 h-5 w-5 accent-black"
                  />

                  <div>
                    <p className="font-semibold">Cash on Delivery (COD)</p>

                    <p className="mt-1 text-sm text-[#666]">
                      Pay when your order arrives.
                    </p>
                  </div>
                </label>
              </div>
            </motion.section>

            <motion.section
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
                duration: 0.35,
              }}
              className="mt-11"
            >
              <h2 className="text-2xl font-bold">Billing address</h2>

              <div className="mt-5 overflow-hidden rounded-xl border border-[#DADADA]">
                <label
                  className={`flex cursor-pointer items-center gap-3 px-[18px] py-5 ${
                    !useDifferentBilling
                      ? "border border-black bg-[#F7F7F7]"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="billing"
                    checked={!useDifferentBilling}
                    onChange={() => setUseDifferentBilling(false)}
                    className="h-5 w-5 accent-black"
                  />

                  <span className="text-sm font-medium">
                    Same as shipping address
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 border-t border-[#E6E6E6] px-[18px] py-5 ${
                    useDifferentBilling
                      ? "border border-black bg-[#F7F7F7]"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="billing"
                    checked={useDifferentBilling}
                    onChange={() => setUseDifferentBilling(true)}
                    className="h-5 w-5 accent-black"
                  />

                  <span className="text-sm font-medium">
                    Use a different billing address
                  </span>
                </label>

                <AnimatePresence initial={false}>
                  {useDifferentBilling && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-3 border-t border-[#E6E6E6] bg-[#F7F7F7] p-4">
                        <label className="relative block">
                          <span className="pointer-events-none absolute left-[18px] top-2 text-[11px] text-[#666]">
                            Country / Region
                          </span>

                          <select
                            value={billingAddress.country}
                            onChange={changeBilling("country")}
                            className="h-14 w-full appearance-none rounded-xl border border-[#DADADA] bg-white px-[18px] pb-1 pt-5 outline-none focus:border-black"
                          >
                            <option value="Egypt">Egypt</option>
                          </select>
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <FloatingField
                            label="First name"
                            value={billingAddress.firstName}
                            onChange={changeBilling("firstName")}
                            error={errors.billing_firstName}
                            required
                          />

                          <FloatingField
                            label="Last name"
                            value={billingAddress.lastName}
                            onChange={changeBilling("lastName")}
                            error={errors.billing_lastName}
                            required
                          />
                        </div>

                        <FloatingField
                          label="Address"
                          value={billingAddress.address}
                          onChange={changeBilling("address")}
                          error={errors.billing_address}
                          required
                        />

                        <FloatingField
                          label="Apartment, suite, etc."
                          value={billingAddress.apartment}
                          onChange={changeBilling("apartment")}
                        />

                        <div className="grid gap-3 sm:grid-cols-3">
                          <FloatingField
                            label="City"
                            value={billingAddress.city}
                            onChange={changeBilling("city")}
                            error={errors.billing_city}
                            required
                          />

                          <label>
                            <select
                              value={billingAddress.governorate}
                              onChange={changeBilling("governorate")}
                              className={`${fieldClass(
                                Boolean(errors.billing_governorate),
                              )} appearance-none`}
                            >
                              <option value="">Governorate</option>

                              {governorates.map((governorate) => (
                                <option key={governorate} value={governorate}>
                                  {governorate}
                                </option>
                              ))}
                            </select>

                            <ErrorMessage>
                              {errors.billing_governorate}
                            </ErrorMessage>
                          </label>

                          <FloatingField
                            label="Postal code"
                            value={billingAddress.postalCode}
                            onChange={changeBilling("postalCode")}
                          />
                        </div>

                        <FloatingField
                          label="Phone"
                          value={billingAddress.phone}
                          onChange={changeBilling("phone")}
                          inputMode="tel"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

            <div className="mt-10">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => {
                    setConfirmed(event.target.checked);

                    setErrors((current) => ({
                      ...current,
                      confirmed: "",
                    }));
                  }}
                  className="mt-0.5 h-5 w-5 rounded border-[#DADADA] accent-black"
                />

                <span className="text-sm leading-6">
                  I confirm that the design, size, color and delivery
                  information are correct.
                </span>
              </label>

              <ErrorMessage>{errors.confirmed}</ErrorMessage>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={!valid}
              whileTap={{
                scale: 0.99,
              }}
              className="mt-8 flex h-[58px] w-full items-center justify-center rounded-xl bg-black px-6 font-semibold text-white transition duration-300 hover:bg-[#222] disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {submitting ? "Completing order..." : "Complete Order"}
            </motion.button>

            <p className="mt-8 border-t border-[#E6E6E6] pt-6 text-center text-xs text-[#666]">
              © 2026 TeeLab. All rights reserved.
            </p>
          </div>
        </main>

        {/* Desktop sticky summary */}
        <aside className="hidden bg-[#F7F7F7] lg:block">
          <div className="sticky top-0 min-h-screen border-l border-[#E6E6E6] px-8 py-14 xl:px-12">
            <div className="mx-auto max-w-[520px]">
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                discountCode={discountCode}
                setDiscountCode={setDiscountCode}
                discountMessage={discountMessage}
                onApplyDiscount={applyDiscount}
              />
            </div>
          </div>
        </aside>
      </form>
    </section>
  );
}
