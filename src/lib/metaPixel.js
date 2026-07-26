const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

let initialized = false;

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

    const firstScript = document.getElementsByTagName("script")[0];

    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }

  window.fbq("init", META_PIXEL_ID);

  initialized = true;
}

export function trackMetaPageView() {
  if (!initialized || typeof window === "undefined" || !window.fbq) {
    return;
  }

  window.fbq("track", "PageView");
}

export function trackMetaEvent(eventName, data = {}, eventId) {
  if (!initialized || typeof window === "undefined" || !window.fbq) {
    return;
  }

  if (eventId) {
    window.fbq("track", eventName, data, {
      eventID: eventId,
    });

    return;
  }

  window.fbq("track", eventName, data);
}

export function trackMetaCustomEvent(eventName, data = {}, eventId) {
  if (!initialized || typeof window === "undefined" || !window.fbq) {
    return;
  }

  if (eventId) {
    window.fbq("trackCustom", eventName, data, {
      eventID: eventId,
    });

    return;
  }

  window.fbq("trackCustom", eventName, data);
}

export function generateMetaEventId(prefix = "teelab") {
  const randomPart =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${randomPart}`;
}
