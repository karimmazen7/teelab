import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import { useCart } from "../context/CartContext";
import { placeOrder } from "../services/orderService";

const egyptGovernorates = [
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
  governorate: "Giza",
  city: "",
  streetName: "",
  apartmentNumber: "",
  postalCode: "",
};

const initialBillingAddress = {
  country: "Egypt",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  governorate: "Giza",
  postalCode: "",
  phone: "",
};

const fieldClass = (hasError = false) =>
  [
    "h-[58px] w-full rounded-2xl border bg-white px-4",
    "text-[13.5px] text-black outline-none transition",
    "placeholder:text-[13.5px] placeholder:text-neutral-500",
    "focus:border-black focus:ring-1 focus:ring-black",
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-neutral-300",
  ].join(" ");

const formatMoney = (value) =>
  `EGP ${Number(value || 0).toLocaleString("en-EG")}`;

function ShoppingBagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[22px] w-[22px] md:h-6 md:w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.5 8.5h13l1 12h-15l1-12Z" />
      <path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
    </svg>
  );
}

function CheckoutNavbar() {
  return (
    <header className="w-full border-b border-neutral-200 bg-white">
      <div className="relative mx-auto h-[60px] w-full max-w-[1280px] md:h-[68px]">
        <Link
          to="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[22px] font-semibold uppercase tracking-[-0.06em] text-black no-underline md:text-[28px]"
        >
          TeeLab
        </Link>

        <Link
          to="/cart"
          aria-label="Go to cart"
          className="absolute right-5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-black transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black md:right-32"
        >
          <ShoppingBagIcon />
        </Link>
      </div>
    </header>
  );
}

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
  if (!children) return null;

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
  placeholder,
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
        placeholder={placeholder || `${label}${required ? "" : " (optional)"}`}
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
                <p className="truncate text-[13.5px] font-medium text-black">
                  {name}
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  {[color, size].filter(Boolean).join(" / ")}
                </p>

                {item.isCustom && (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Custom design
                  </p>
                )}
              </div>

              <p className="whitespace-nowrap text-[13px] font-medium">
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
          className="h-[52px] min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-[15px] text-[13px] text-black outline-none transition placeholder:text-neutral-500 focus:border-black focus:ring-1 focus:ring-black"
        />

        <button
          type="button"
          disabled={!discountCode.trim()}
          onClick={onApplyDiscount}
          className="h-[52px] rounded-xl border border-neutral-200 bg-neutral-200 px-5 text-[13px] font-semibold text-neutral-600 transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      {discountMessage && (
        <p className="mt-2 text-xs text-neutral-500">{discountMessage}</p>
      )}

      <div className="mt-9 space-y-4">
        <div className="flex items-center justify-between gap-5">
          <span className="text-[13.5px] text-black">Subtotal</span>
          <span className="text-[13.5px] text-black">
            {formatMoney(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-5">
          <span className="text-[13.5px] text-black">Shipping</span>
          <span className="text-[13.5px] text-black">
            {deliveryFee ? formatMoney(deliveryFee) : "Free"}
          </span>
        </div>

        <div className="border-t border-neutral-200 pt-5">
          <div className="flex items-end justify-between gap-5">
            <span className="text-[17px] font-bold text-black">Total</span>

            <div className="text-right">
              <span className="mr-2 text-xs text-neutral-500">EGP</span>
              <span className="text-[22px] font-bold text-black">
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
  const [governorate, setGovernorate] = useState("Giza");
  const [billingAddress, setBillingAddress] = useState(initialBillingAddress);

  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [saveInformation, setSaveInformation] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const changeGovernorate = (event) => {
    const value = event.target.value;

    setGovernorate(value);

    setAddress((current) => ({
      ...current,
      governorate: value,
    }));

    setErrors((current) => ({
      ...current,
      governorate: "",
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

    if (!governorate.trim()) {
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

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const valid = useMemo(
    () => cartItems.length > 0 && !submitting,
    [cartItems.length, submitting],
  );

  const applyDiscount = () => {
    if (!discountCode.trim()) return;

    setDiscountMessage("This discount code is not currently available.");
  };

  async function submit(event) {
    event.preventDefault();

    if (submitting || !validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      const fullName =
        `${customer.firstName.trim()} ${customer.lastName.trim()}`.trim();

      const orderAddress = {
        country: address.country,
        governorate,
        city: address.city.trim(),
        streetName: address.streetName.trim(),
        apartmentNumber: address.apartmentNumber.trim() || null,
        postalCode: address.postalCode.trim() || null,
      };

      const result = await placeOrder({
        customer: {
          fullName,
          email: customer.email.trim(),
          phone: customer.phone.trim(),
        },
        address: orderAddress,
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
      <div className="min-h-[70vh] bg-white font-['Montserrat',Arial,sans-serif]">
        <CheckoutNavbar />

        <section className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Checkout
          </p>

          <h1 className="mt-4 text-3xl font-bold text-black">
            Your cart is empty
          </h1>

          <p className="mt-4 max-w-md text-sm leading-7 text-neutral-500">
            Add a product or create a custom TeeLab design before checking out.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/products"
              className="rounded-xl bg-black px-7 py-4 text-sm font-semibold text-white"
            >
              Shop Products
            </Link>

            <Link
              to="/customizer"
              className="rounded-xl border border-black px-7 py-4 text-sm font-semibold text-black"
            >
              Create a Design
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Montserrat',Arial,sans-serif]">
      <CheckoutNavbar />

      <form
        onSubmit={submit}
        noValidate
        className="mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 lg:grid-cols-[65%_35%]"
      >
        <div className="border-b border-neutral-200 bg-neutral-50 lg:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen((current) => !current)}
            aria-expanded={summaryOpen}
            className="flex w-full items-center justify-between gap-4 px-5 py-4"
          >
            <span className="flex items-center gap-2 text-[13px] font-semibold">
              Order summary
              <ChevronIcon open={summaryOpen} />
            </span>

            <span className="text-sm font-bold">{formatMoney(total)}</span>
          </button>

          {summaryOpen && (
            <div className="border-t border-neutral-200 px-5 py-6">
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
          )}
        </div>

        <main className="bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-20">
          <div className="mx-auto max-w-[760px]">
            <section>
              <div className="flex items-center justify-between">
                <h1 className="text-[19px] font-semibold text-black">
                  Contact
                </h1>

                <Link
                  to="/admin/login"
                  className="text-[13px] text-black underline underline-offset-4"
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
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-black"
                  />

                  <span className="text-[13px] text-black">
                    Email me with news and offers
                  </span>
                </label>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-[19px] font-semibold text-black">Delivery</h2>

              <div className="mt-5 grid gap-3">
                <label className="relative block">
                  <span className="pointer-events-none absolute left-4 top-1.5 text-[11px] text-neutral-600">
                    Country / Region
                  </span>

                  <select
                    value={address.country}
                    onChange={changeAddress("country")}
                    className="h-[58px] w-full appearance-none rounded-2xl border border-neutral-300 bg-white px-4 pb-1 pt-4 text-[13.5px] text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="Egypt">Egypt</option>
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronIcon />
                  </span>
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  label="Apartment, suite, etc."
                  name="apartmentNumber"
                  value={address.apartmentNumber}
                  onChange={changeAddress("apartmentNumber")}
                  placeholder="Apartment, suite, etc. (optional)"
                  autoComplete="address-line2"
                />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
                      name="governorate"
                      value={governorate}
                      onChange={changeGovernorate}
                      aria-invalid={Boolean(errors.governorate)}
                      className={`${fieldClass(
                        Boolean(errors.governorate),
                      )} appearance-none`}
                    >
                      {egyptGovernorates.map((item) => (
                        <option key={item} value={item}>
                          {item}
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

                <label className="mt-1 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={saveInformation}
                    onChange={(event) =>
                      setSaveInformation(event.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-black"
                  />

                  <span className="text-[13px] text-black">
                    Save this information for next time
                  </span>
                </label>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-[19px] font-semibold text-black">
                Shipping method
              </h2>

              <div className="mt-5 flex min-h-[52px] items-center justify-between gap-5 rounded-xl border border-black px-[15px]">
                <div>
                  <p className="text-[13px] font-semibold text-black">
                    Standard
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Standard delivery
                  </p>
                </div>

                <p className="text-[13px] font-semibold text-black">
                  {deliveryFee ? formatMoney(deliveryFee) : "Free"}
                </p>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-[19px] font-semibold text-black">Payment</h2>

              <p className="mt-1 text-[13px] text-neutral-500">
                Your order information is handled securely.
              </p>

              <div className="mt-5 overflow-hidden rounded-xl border border-black">
                <label className="flex cursor-pointer items-start gap-3 bg-neutral-50 px-[15px] py-4">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="mt-0.5 h-4 w-4 accent-black"
                  />

                  <div>
                    <p className="text-[13px] font-semibold text-black">
                      Cash on Delivery (COD)
                    </p>
                    <p className="mt-1 text-[13px] text-neutral-500">
                      Pay when your order arrives.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-[19px] font-semibold text-black">
                Billing address
              </h2>

              <div className="mt-5 overflow-hidden rounded-xl border border-neutral-300">
                <label
                  className={`flex cursor-pointer items-center gap-3 px-[15px] py-4 ${
                    !useDifferentBilling
                      ? "border border-black bg-neutral-50"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="billing"
                    checked={!useDifferentBilling}
                    onChange={() => setUseDifferentBilling(false)}
                    className="h-4 w-4 accent-black"
                  />

                  <span className="text-[13px] font-medium text-black">
                    Same as shipping address
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 border-t border-neutral-200 px-[15px] py-4 ${
                    useDifferentBilling
                      ? "border border-black bg-neutral-50"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="billing"
                    checked={useDifferentBilling}
                    onChange={() => setUseDifferentBilling(true)}
                    className="h-4 w-4 accent-black"
                  />

                  <span className="text-[13px] font-medium text-black">
                    Use a different billing address
                  </span>
                </label>

                {useDifferentBilling && (
                  <div className="grid gap-3 border-t border-neutral-200 bg-neutral-50 p-4">
                    <label className="relative block">
                      <span className="pointer-events-none absolute left-4 top-1.5 text-[11px] text-neutral-600">
                        Country / Region
                      </span>

                      <select
                        value={billingAddress.country}
                        onChange={changeBilling("country")}
                        className="h-[58px] w-full appearance-none rounded-2xl border border-neutral-300 bg-white px-4 pb-1 pt-4 text-[13.5px] text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                      >
                        <option value="Egypt">Egypt</option>
                      </select>
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      placeholder="Apartment, suite, etc. (optional)"
                    />

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <FloatingField
                        label="City"
                        value={billingAddress.city}
                        onChange={changeBilling("city")}
                        error={errors.billing_city}
                        required
                      />

                      <label className="block">
                        <span className="sr-only">Governorate</span>

                        <select
                          value={billingAddress.governorate}
                          onChange={changeBilling("governorate")}
                          className={`${fieldClass(
                            Boolean(errors.billing_governorate),
                          )} appearance-none`}
                        >
                          {egyptGovernorates.map((item) => (
                            <option key={item} value={item}>
                              {item}
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
                )}
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!valid}
              className="mt-8 flex h-[56px] w-full items-center justify-center rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {submitting ? "Completing order..." : "Complete Order"}
            </button>

            <p className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">
              © 2026 TeeLab. All rights reserved.
            </p>
          </div>
        </main>

        <aside className="hidden border-l border-neutral-200 bg-neutral-50 lg:block">
          <div className="sticky top-0 min-h-screen px-8 py-12 xl:px-12">
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
    </div>
  );
}
