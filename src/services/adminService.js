import { supabase } from "../lib/supabase";

function createServiceError(error, fallbackMessage) {
  console.error("Supabase service error:", {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    error,
  });

  return new Error(error?.message || fallbackMessage);
}

function escapeSearchValue(value = "") {
  return String(value)
    .trim()
    .replace(/[%_,()]/g, " ");
}

export async function signInAdmin(email, password) {
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!cleanEmail || !password) {
    throw new Error("Email and password are required.");
  }

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

  if (authError) {
    throw createServiceError(
      authError,
      "The admin account could not be signed in.",
    );
  }

  const user = authData?.user;

  if (!user) {
    await supabase.auth.signOut();

    throw new Error("The authenticated user could not be loaded.");
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select(
      `
          user_id,
          email,
          full_name,
          role,
          active,
          created_at,
          updated_at
        `,
    )
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (adminError) {
    await supabase.auth.signOut();

    throw createServiceError(
      adminError,
      "The admin profile could not be loaded.",
    );
  }

  if (!admin) {
    await supabase.auth.signOut();

    throw new Error("This account does not have admin access.");
  }

  return {
    user,
    admin,
    session: authData.session,
  };
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw createServiceError(
      error,
      "The admin account could not be signed out.",
    );
  }
}

export async function getCurrentAdmin() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select(
      `
          user_id,
          email,
          full_name,
          role,
          active,
          created_at,
          updated_at
        `,
    )
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (adminError || !admin) {
    return null;
  }

  return {
    user,
    admin,
  };
}

export async function testAdminAccess() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  return {
    user,
    userError,
    isAdmin,
    adminError,
  };
}

export async function getDashboardStats() {
  const { data, error } = await supabase
    .from("admin_dashboard_stats")
    .select("*")
    .maybeSingle();

  if (error) {
    throw createServiceError(
      error,
      "Dashboard statistics could not be loaded.",
    );
  }

  return (
    data || {
      total_orders: 0,
      new_orders: 0,
      confirmed_orders: 0,
      processing_orders: 0,
      delivery_orders: 0,
      delivered_orders: 0,
      cancelled_orders: 0,
      total_revenue: 0,
      delivered_revenue: 0,
      month_revenue: 0,
      today_revenue: 0,
    }
  );
}

export async function getOrders({
  search = "",
  status = "all",
  paymentStatus = "all",
  sort = "newest",
  page = 1,
  pageSize = 20,
} = {}) {
  const safePage = Math.max(Number(page) || 1, 1);

  const safePageSize = Math.max(Math.min(Number(pageSize) || 20, 100), 1);

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const access = await testAdminAccess();

  if (access.userError) {
    throw createServiceError(
      access.userError,
      "The authenticated user could not be verified.",
    );
  }

  if (!access.user) {
    throw new Error("Your admin session has expired. Please sign in again.");
  }

  if (access.adminError) {
    throw createServiceError(
      access.adminError,
      "Admin permission could not be verified.",
    );
  }

  if (access.isAdmin !== true) {
    throw new Error("This account does not have permission to view orders.");
  }

  let query = supabase.from("admin_orders_view").select("*", {
    count: "exact",
  });

  const cleanSearch = escapeSearchValue(search);

  if (cleanSearch) {
    query = query.or(
      [
        `order_number.ilike.%${cleanSearch}%`,
        `customer_name.ilike.%${cleanSearch}%`,
        `customer_phone.ilike.%${cleanSearch}%`,
        `customer_email.ilike.%${cleanSearch}%`,
      ].join(","),
    );
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (paymentStatus && paymentStatus !== "all") {
    query = query.eq("payment_status", paymentStatus);
  }

  query = query.order("created_at", {
    ascending: sort === "oldest",
  });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw createServiceError(error, "Orders could not be loaded.");
  }

  const orders = Array.isArray(data) ? data : [];

  const totalCount = Number(count) || 0;

  return {
    orders,
    count: totalCount,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(Math.ceil(totalCount / safePageSize), 1),
  };
}

export async function getOrderDetails(orderId) {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  const { data: order, error: orderError } = await supabase
    .from("admin_orders_view")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    throw createServiceError(orderError, "The order could not be loaded.");
  }

  if (!order) {
    throw new Error("The requested order was not found.");
  }

  const [itemsResponse, historyResponse] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        `
            id,
            order_id,
            product_name,
            product_image,
            tshirt_color,
            tshirt_size,
            quantity,
            unit_price,
            line_total,
            is_custom,
            design_data,
            preview_image_path,
            print_file_path,
            original_upload_paths,
            created_at
          `,
      )
      .eq("order_id", orderId)
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (itemsResponse.error) {
    throw createServiceError(
      itemsResponse.error,
      "The order items could not be loaded.",
    );
  }

  if (historyResponse.error) {
    throw createServiceError(
      historyResponse.error,
      "The order history could not be loaded.",
    );
  }

  return {
    order,
    items: itemsResponse.data || [],
    history: historyResponse.data || [],
  };
}

export async function updateOrderStatus(orderId, newStatus, note = "") {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  if (!newStatus) {
    throw new Error("A new order status is required.");
  }

  const { data, error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: orderId,
    p_new_status: String(newStatus),
    p_note: String(note || "").trim() || null,
  });

  if (error) {
    throw createServiceError(error, "The order status could not be updated.");
  }

  return data;
}

export async function updateAdminNotes(orderId, adminNotes) {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  const { data, error } = await supabase.rpc("admin_update_order_notes", {
    p_order_id: orderId,
    p_admin_notes: String(adminNotes || ""),
  });

  if (error) {
    throw createServiceError(error, "The admin notes could not be updated.");
  }

  return data;
}

export async function getCustomers({ search = "" } = {}) {
  let query = supabase
    .from("admin_customers_summary")
    .select("*")
    .order("last_order_at", {
      ascending: false,
      nullsFirst: false,
    });

  const cleanSearch = escapeSearchValue(search);

  if (cleanSearch) {
    query = query.or(
      [
        `full_name.ilike.%${cleanSearch}%`,
        `phone.ilike.%${cleanSearch}%`,
        `email.ilike.%${cleanSearch}%`,
      ].join(","),
    );
  }

  const { data, error } = await query;

  if (error) {
    throw createServiceError(error, "Customers could not be loaded.");
  }

  return data || [];
}

export async function getCustomDesigns() {
  const { data, error } = await supabase
    .from("admin_designs_view")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw createServiceError(error, "Custom designs could not be loaded.");
  }

  return data || [];
}
