import { supabase } from "../lib/supabase";

function getCookie(name) {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;

  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(prefix.length));
}

export async function sendPurchaseToConversionsApi({
  orderNumber,
  publicToken,
  eventId,
}) {
  if (!orderNumber || !publicToken || !eventId) {
    throw new Error("Order number, public token and event ID are required.");
  }

  const { data, error } = await supabase.functions.invoke("meta-purchase", {
    body: {
      order_number: orderNumber,
      public_token: publicToken,
      event_id: eventId,

      event_source_url:
        typeof window !== "undefined"
          ? window.location.href
          : "https://teelab-psi.vercel.app",

      client_user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : "",

      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
    },
  });

  if (error) {
    throw new Error(
      error.message || "The server Purchase event could not be sent.",
    );
  }

  return data;
}
