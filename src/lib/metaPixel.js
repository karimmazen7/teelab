import ReactPixel from "react-facebook-pixel";

const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "1413438953951610";

let pixelInitialized = false;

export function initializeMetaPixel() {
  if (pixelInitialized || typeof window === "undefined" || !META_PIXEL_ID) {
    return;
  }

  ReactPixel.init(
    META_PIXEL_ID,
    {},
    {
      autoConfig: true,
      debug: import.meta.env.DEV,
    },
  );

  pixelInitialized = true;
}

export function trackMetaPageView() {
  if (!pixelInitialized || typeof window === "undefined") {
    return;
  }

  ReactPixel.pageView();
}

export function trackMetaEvent(eventName, data = {}) {
  if (!pixelInitialized || typeof window === "undefined") {
    return;
  }

  ReactPixel.track(eventName, data);
}

export function trackMetaCustomEvent(eventName, data = {}) {
  if (!pixelInitialized || typeof window === "undefined") {
    return;
  }

  ReactPixel.trackCustom(eventName, data);
}

export function generateMetaEventId(prefix = "teelab") {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${id}`;
}
