import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PurchaseRequest = {
  order_number?: string;
  public_token?: string;
  event_id?: string;
  event_source_url?: string;
  client_user_agent?: string;
  fbp?: string | null;
  fbc?: string | null;
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value: unknown) {
  return String(value || "").replace(/[^\d]/g, "");
}

function normalizeName(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function splitFullName(fullName: unknown) {
  const parts = normalizeName(fullName)
    .split(" ")
    .filter(Boolean);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

async function sha256(value: string) {
  if (!value) {
    return null;
  }

  const encodedValue = new TextEncoder().encode(value);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    encodedValue,
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function firstDefined<T>(
  ...values: Array<T | null | undefined>
): T | null {
  return values.find(
    (value) => value !== undefined && value !== null,
  ) ?? null;
}

function parsePublicOrder(data: unknown) {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  if (Array.isArray(data)) {
    return data[0] || null;
  }

  if (data && typeof data === "object") {
    return data;
  }

  return null;
}

function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    "";

  return forwardedFor.split(",")[0]?.trim() || null;
}

Deno.serve(async (request) => {
  console.log("META PURCHASE REQUEST", {
    method: request.method,
    time: new Date().toISOString(),
  });

  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        message: "Method not allowed.",
      },
      405,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  const serviceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_SECRET_KEY");

  const metaPixelId = Deno.env.get("META_PIXEL_ID");
  const metaAccessToken = Deno.env.get("META_ACCESS_TOKEN");

  /*
    Set this secret to a currently supported Meta Graph API version,
    for example: vXX.X
  */
  const metaGraphApiVersion = Deno.env.get(
    "META_GRAPH_API_VERSION",
  );

  /*
    Only set this during Events Manager testing.
    Remove it afterward so production events are not marked as test events.
  */
  const metaTestEventCode = Deno.env.get(
    "META_TEST_EVENT_CODE",
  );

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !metaPixelId ||
    !metaAccessToken ||
    !metaGraphApiVersion
  ) {
    return jsonResponse(
      {
        success: false,
        message:
          "The Meta Conversions API server configuration is incomplete.",
      },
      500,
    );
  }

  let payload: PurchaseRequest;

  try {
    payload = await request.json();

    console.log("META PURCHASE PAYLOAD", {
      order_number: payload.order_number,
      has_public_token: Boolean(payload.public_token),
      event_id: payload.event_id,
      has_fbp: Boolean(payload.fbp),
      has_fbc: Boolean(payload.fbc),
    });
  } catch {
    return jsonResponse(
      {
        success: false,
        message: "Invalid JSON request.",
      },
      400,
    );
  }

  const orderNumber = String(
    payload.order_number || "",
  ).trim();

  const publicToken = String(
    payload.public_token || "",
  ).trim();

  const eventId = String(payload.event_id || "").trim();

  if (!orderNumber || !publicToken || !eventId) {
    return jsonResponse(
      {
        success: false,
        message:
          "order_number, public_token and event_id are required.",
      },
      400,
    );
  }

  const supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  /*
    The existing public-order RPC validates that the supplied
    confirmation token belongs to the order.
  */
  const { data: publicOrderResult, error: publicOrderError } =
    await supabaseAdmin.rpc("get_public_order", {
      p_order_number: orderNumber,
      p_token: publicToken,
    });

  console.log("PUBLIC ORDER RESULT", {
    hasData: Boolean(publicOrderResult),
    error: publicOrderError,
  });

  if (publicOrderError) {
    console.error("Public order RPC error:", publicOrderError);

    return jsonResponse(
      {
        success: false,
        message: "The order could not be verified.",
      },
      400,
    );
  }

  const order = parsePublicOrder(publicOrderResult) as
    | Record<string, any>
    | null;

  if (!order) {
    return jsonResponse(
      {
        success: false,
        message: "The order was not found.",
      },
      404,
    );
  }

  const verifiedOrderNumber = String(
    firstDefined(
      order.order_number,
      order.orderNumber,
      order.order?.order_number,
    ) || "",
  );

  if (verifiedOrderNumber !== orderNumber) {
    return jsonResponse(
      {
        success: false,
        message: "The order verification failed.",
      },
      403,
    );
  }

  /*
    Prevent duplicate server submissions.
  */
  const { data: existingEvent, error: existingEventError } =
    await supabaseAdmin
      .from("meta_conversion_events")
      .select("id,status,meta_response")
      .eq("event_id", eventId)
      .maybeSingle();

  if (existingEventError) {
    console.error("META EVENT LOOKUP ERROR:", existingEventError);

    return jsonResponse(
      {
        success: false,
        message: "Could not check the Meta event history.",
        database_error: existingEventError.message,
      },
      500,
    );
  }

  if (existingEvent?.status === "sent") {
    return jsonResponse({
      success: true,
      duplicate: true,
      event_id: eventId,
      meta_response: existingEvent.meta_response,
    });
  }

  const orderId = firstDefined(
    order.id,
    order.order_id,
    order.order?.id,
  );

  const customer = firstDefined(
    order.customer,
    order.customer_information,
    order.customerInfo,
  ) as Record<string, any> | null;

  const address = firstDefined(
    order.address,
    order.delivery_address,
    order.deliveryAddress,
  ) as Record<string, any> | null;

  const fullName = firstDefined(
    customer?.full_name,
    customer?.fullName,
    order.customer_name,
    order.customerName,
  );

  const email = normalizeEmail(
    firstDefined(
      customer?.email,
      order.customer_email,
      order.customerEmail,
    ),
  );

  const phone = normalizePhone(
    firstDefined(
      customer?.phone,
      order.customer_phone,
      order.customerPhone,
    ),
  );

  const { firstName, lastName } = splitFullName(fullName);

  const city = normalizeName(
    firstDefined(
      address?.city,
      order.city,
    ),
  );

  const state = normalizeName(
    firstDefined(
      address?.governorate,
      order.governorate,
    ),
  );

  const country = normalizeName(
    firstDefined(
      address?.country,
      order.country,
      "Egypt",
    ),
  );

  const postalCode = normalizeName(
    firstDefined(
      address?.postal_code,
      address?.postalCode,
      order.postal_code,
    ),
  );

  const userData: Record<string, unknown> = {};

  const [
    emailHash,
    phoneHash,
    firstNameHash,
    lastNameHash,
    cityHash,
    stateHash,
    countryHash,
    postalCodeHash,
  ] = await Promise.all([
    sha256(email),
    sha256(phone),
    sha256(firstName),
    sha256(lastName),
    sha256(city),
    sha256(state),
    sha256(country),
    sha256(postalCode),
  ]);

  if (emailHash) userData.em = [emailHash];
  if (phoneHash) userData.ph = [phoneHash];
  if (firstNameHash) userData.fn = [firstNameHash];
  if (lastNameHash) userData.ln = [lastNameHash];
  if (cityHash) userData.ct = [cityHash];
  if (stateHash) userData.st = [stateHash];
  if (countryHash) userData.country = [countryHash];
  if (postalCodeHash) userData.zp = [postalCodeHash];

  const clientIp = getClientIp(request);

  if (clientIp) {
    userData.client_ip_address = clientIp;
  }

  if (payload.client_user_agent) {
    userData.client_user_agent =
      payload.client_user_agent;
  }

  if (payload.fbp) {
    userData.fbp = payload.fbp;
  }

  if (payload.fbc) {
    userData.fbc = payload.fbc;
  }

  const items = firstDefined(
    order.items,
    order.order_items,
    order.orderItems,
    [],
  ) as Array<Record<string, any>>;

  const contents = Array.isArray(items)
    ? items.map((item) => ({
        id: String(
          firstDefined(
            item.product_id,
            item.productId,
            item.id,
            item.product_name,
            "custom-product",
          ),
        ),
        quantity: Math.max(
          1,
          Number(item.quantity) || 1,
        ),
        item_price:
          Number(
            firstDefined(
              item.unit_price,
              item.unitPrice,
              item.price,
              0,
            ),
          ) || 0,
      }))
    : [];

  const totalAmount =
    Number(
      firstDefined(
        order.total_amount,
        order.totalAmount,
        order.total,
        order.order?.total_amount,
      ),
    ) || 0;

  const createdAt = firstDefined(
    order.created_at,
    order.createdAt,
    order.order?.created_at,
  );

  const eventTime = createdAt
    ? Math.floor(new Date(String(createdAt)).getTime() / 1000)
    : Math.floor(Date.now() / 1000);

  const eventSourceUrl =
    payload.event_source_url ||
    "https://teelab-psi.vercel.app/order-success";

  const metaEvent = {
    event_name: "Purchase",
    event_time: eventTime,
    event_id: eventId,
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data: userData,
    custom_data: {
      currency: "EGP",
      value: totalAmount,
      order_id: orderNumber,
      content_type: "product",
      content_ids: contents.map((item) => item.id),
      contents,
      num_items: contents.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    },
  };

  const metaRequestBody: Record<string, unknown> = {
    data: [metaEvent],
  };

  if (metaTestEventCode) {
    metaRequestBody.test_event_code = metaTestEventCode;
  }

  console.log("CREATING META EVENT RECORD", {
    eventId,
    orderNumber,
    orderId: orderId || null,
    totalAmount,
  });

  const { data: savedEvent, error: saveEventError } =
    await supabaseAdmin
      .from("meta_conversion_events")
      .upsert(
        {
          event_id: eventId,
          event_name: "Purchase",
          order_number: orderNumber,
          order_id: orderId || null,
          status: "pending",
          error_message: null,
        },
        {
          onConflict: "event_id",
        },
      )
      .select()
      .single();

  if (saveEventError) {
    console.error("META CONVERSION EVENT INSERT ERROR:", saveEventError);

    return jsonResponse(
      {
        success: false,
        message: "Could not save the Meta event.",
        database_error: saveEventError.message,
      },
      500,
    );
  }

  console.log("META EVENT RECORD CREATED", {
    id: savedEvent?.id,
    event_id: savedEvent?.event_id,
    status: savedEvent?.status,
  });

  const metaEndpoint =
    `https://graph.facebook.com/` +
    `${metaGraphApiVersion}/` +
    `${metaPixelId}/events` +
    `?access_token=${encodeURIComponent(metaAccessToken)}`;

  try {
    console.log("SENDING PURCHASE TO META", {
      eventId,
      orderNumber,
      totalAmount,
      testMode: Boolean(metaTestEventCode),
    });

    const metaResponse = await fetch(metaEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metaRequestBody),
    });

    const metaResponseBody = await metaResponse.json();

    console.log("META RESPONSE", {
      status: metaResponse.status,
      ok: metaResponse.ok,
      body: metaResponseBody,
    });

    if (!metaResponse.ok) {
      await supabaseAdmin
        .from("meta_conversion_events")
        .update({
          status: "failed",
          meta_response: metaResponseBody,
          error_message:
            metaResponseBody?.error?.message ||
            "Meta rejected the event.",
        })
        .eq("event_id", eventId);

      console.error("Meta CAPI error:", metaResponseBody);

      return jsonResponse(
        {
          success: false,
          event_id: eventId,
          meta_response: metaResponseBody,
        },
        502,
      );
    }

    const { error: sentUpdateError } = await supabaseAdmin
      .from("meta_conversion_events")
      .update({
        status: "sent",
        meta_response: metaResponseBody,
        error_message: null,
        sent_at: new Date().toISOString(),
      })
      .eq("event_id", eventId);

    if (sentUpdateError) {
      console.error("META EVENT SENT-STATUS UPDATE ERROR:", sentUpdateError);
    }

    console.log("META PURCHASE SENT SUCCESSFULLY", {
      orderNumber,
      eventId,
      totalAmount,
      eventsReceived: metaResponseBody?.events_received ?? null,
      fbtraceId: metaResponseBody?.fbtrace_id ?? null,
    });

    return jsonResponse({
      success: true,
      event_id: eventId,
      meta_response: metaResponseBody,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Meta request error.";

    await supabaseAdmin
      .from("meta_conversion_events")
      .update({
        status: "failed",
        error_message: message,
      })
      .eq("event_id", eventId);

    console.error("Meta CAPI request failed:", error);

    return jsonResponse(
      {
        success: false,
        event_id: eventId,
        message,
      },
      500,
    );
  }
});