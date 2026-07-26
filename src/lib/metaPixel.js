const META_PIXEL_ID = String(import.meta.env.VITE_META_PIXEL_ID || "").trim();

let initialized = false;

function canUsePixel() {
  return (
    initialized &&
    typeof window !== "undefined" &&
    typeof window.fbq === "function"
  );
}

export function initializeMetaPixel() {
  if (
    initialized ||
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !META_PIXEL_ID
  ) {
    return;
  }

  if (!window.fbq) {
    const fbq = function (...args) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue.push(args);
      }
    };

    window.fbq = fbq;
    window._fbq = fbq;

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];

    const script = document.createElement("script");

    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";

    script.onerror = () => {
      console.warn("Meta Pixel was blocked by the browser or an extension.");
    };

    document.head.appendChild(script);
  }

  window.fbq("init", META_PIXEL_ID);

  initialized = true;
}

export function generateMetaEventId(prefix = "teelab") {
  const randomPart =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${randomPart}`;
}

export function trackMetaPageView() {
  if (!canUsePixel()) {
    return;
  }

  window.fbq("track", "PageView");
}

export function trackMetaEvent(eventName, parameters = {}, eventId = null) {
  if (!canUsePixel() || !eventName) {
    return;
  }

  if (eventId) {
    window.fbq("track", eventName, parameters, {
      eventID: eventId,
    });

    return;
  }

  window.fbq("track", eventName, parameters);
}

export function trackMetaCustomEvent(
  eventName,
  parameters = {},
  eventId = null,
) {
  if (!canUsePixel() || !eventName) {
    return;
  }

  if (eventId) {
    window.fbq("trackCustom", eventName, parameters, {
      eventID: eventId,
    });

    return;
  }

  window.fbq("trackCustom", eventName, parameters);
}

export function trackViewContent(product) {
  if (!product) {
    return;
  }

  const productId = String(product.id || product.productId || "");
  const productName = product.productName || product.name || "TeeLab Product";
  const value = Number(product.price) || 0;

  trackMetaEvent("ViewContent", {
    content_ids: productId ? [productId] : [],
    content_name: productName,
    content_type: "product",
    value,
    currency: "EGP",
  });
}

export function trackAddToCart(item, quantity = 1) {
  if (!item) {
    return;
  }

  const productId = String(item.id || item.productId || item.cartItemId || "");

  const productName = item.productName || item.name || "TeeLab Product";

  const unitPrice = Number(item.price) || 0;
  const safeQuantity = Math.max(Number(quantity) || 1, 1);

  trackMetaEvent("AddToCart", {
    content_ids: productId ? [productId] : [],
    content_name: productName,
    content_type: "product",
    contents: productId
      ? [
          {
            id: productId,
            quantity: safeQuantity,
            item_price: unitPrice,
          },
        ]
      : [],
    value: unitPrice * safeQuantity,
    currency: "EGP",
  });
}

export function trackInitiateCheckout(cartItems, subtotal) {
  const items = Array.isArray(cartItems) ? cartItems : [];

  const contents = items.map((item) => ({
    id: String(
      item.id || item.productId || item.cartItemId || "custom-product",
    ),
    quantity: Math.max(Number(item.quantity) || 1, 1),
    item_price: Number(item.price) || 0,
  }));

  trackMetaEvent("InitiateCheckout", {
    content_ids: contents.map((item) => item.id),
    content_type: "product",
    contents,
    num_items: contents.reduce((total, item) => total + item.quantity, 0),
    value: Number(subtotal) || 0,
    currency: "EGP",
  });
}

export function trackPurchase({
  orderNumber,
  cartItems = [],
  value = 0,
  eventId = null,
}) {
  const items = Array.isArray(cartItems) ? cartItems : [];

  const contents = items.map((item) => ({
    id: String(
      item.id ||
        item.product_id ||
        item.productId ||
        item.cartItemId ||
        "custom-product",
    ),
    quantity: Math.max(Number(item.quantity) || 1, 1),
    item_price: Number(item.unit_price ?? item.price) || 0,
  }));

  trackMetaEvent(
    "Purchase",
    {
      content_ids: contents.map((item) => item.id),
      content_type: "product",
      contents,
      num_items: contents.reduce((total, item) => total + item.quantity, 0),
      value: Number(value) || 0,
      currency: "EGP",
      order_id: String(orderNumber || ""),
    },
    eventId,
  );
}
