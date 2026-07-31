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
  if (!orderNumber) {
    throw new Error("Order number is missing.");
  }

  if (!publicToken) {
    throw new Error("Public token is missing.");
  }

  if (!eventId) {
    throw new Error("Meta event ID is missing.");
  }

  const requestBody = {
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
  };

  console.log("Calling meta-purchase Edge Function:", {
    ...requestBody,
    public_token: requestBody.public_token ? "available" : "missing",
  });

  const { data, error } = await supabase.functions.invoke("meta-purchase", {
    body: requestBody,
  });

  console.log("meta-purchase response:", {
    data,
    error,
  });

  if (error) {
    console.error("Meta CAPI invocation failed:", {
      message: error.message,
      context: error.context,
      name: error.name,
      error,
    });

    throw new Error(
      error.message || "The server Purchase event could not be sent.",
    );
  }

  if (data?.success === false) {
    throw new Error(
      data?.message || "Meta rejected the server Purchase event.",
    );
  }

  return data;
}
