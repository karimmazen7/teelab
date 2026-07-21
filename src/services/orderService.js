import { supabase } from "../lib/supabase";
import { dataUrlToBlob, uploadPrivateFile } from "./storageService";

const randomId = () => crypto.randomUUID();

export function normalizeEgyptPhone(value = "") {
  const phone = String(value).replace(/[^\d+]/g, "");

  if (/^01[0125]\d{8}$/.test(phone)) {
    return `+2${phone}`;
  }

  if (/^\+201[0125]\d{8}$/.test(phone)) {
    return phone;
  }

  if (/^201[0125]\d{8}$/.test(phone)) {
    return `+${phone}`;
  }

  throw new Error("Enter a valid Egyptian phone number.");
}

function isCustomCartItem(item) {
  return (
    item?.isCustom === true ||
    item?.productType === "custom" ||
    item?.productType === "custom-tshirt" ||
    Boolean(item?.designData)
  );
}

function getItemName(item) {
  return item?.productName || item?.name || "T-Shirt";
}

function getItemImage(item) {
  return (
    item?.productImage ||
    item?.product_image ||
    item?.image ||
    item?.previewImage ||
    null
  );
}

function getItemColor(item) {
  return item?.tshirtColor || item?.selectedColor || item?.color || null;
}

function getItemSize(item) {
  return item?.tshirtSize || item?.selectedSize || item?.size || null;
}

function getItemQuantity(item) {
  const quantity = Number(item?.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`Invalid quantity for ${getItemName(item)}.`);
  }

  return quantity;
}

function getItemPrice(item) {
  const price = Number(item?.price);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Invalid price for ${getItemName(item)}.`);
  }

  return price;
}

function sanitizeFileName(fileName = "upload.png") {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getFileExtension(file) {
  const extension = file?.name?.split(".").pop()?.toLowerCase();

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension;
  }

  const mimeExtensions = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
  };

  return mimeExtensions[file?.type] || "png";
}

async function uploadCustomItemFiles(item, checkoutId, index) {
  if (!item.previewImage) {
    throw new Error(`${getItemName(item)} is missing its preview image.`);
  }

  if (!item.printFile) {
    throw new Error(
      `${getItemName(item)} is missing its transparent print file.`,
    );
  }

  const itemFolder = `checkout/${checkoutId}/items/${index}`;

  const previewPath = `${itemFolder}/preview.png`;

  const printPath = `${itemFolder}/print-file.png`;

  const previewBlob = dataUrlToBlob(item.previewImage);

  const printBlob = dataUrlToBlob(item.printFile);

  await uploadPrivateFile(
    "design-previews",
    previewPath,
    previewBlob,
    "image/png",
  );

  await uploadPrivateFile("print-files", printPath, printBlob, "image/png");

  const originalUploadPaths = [];

  const originalUploads = Array.isArray(item.originalUploads)
    ? item.originalUploads
    : [];

  for (
    let uploadIndex = 0;
    uploadIndex < originalUploads.length;
    uploadIndex += 1
  ) {
    const upload = originalUploads[uploadIndex];

    const originalFile =
      upload?.file instanceof File
        ? upload.file
        : upload instanceof File
          ? upload
          : null;

    if (!originalFile) {
      continue;
    }

    const extension = getFileExtension(originalFile);

    const safeName =
      sanitizeFileName(originalFile.name) ||
      `upload-${uploadIndex}.${extension}`;

    const path =
      `${itemFolder}/uploads/` + `${uploadIndex}-${randomId()}-${safeName}`;

    await uploadPrivateFile(
      "customer-uploads",
      path,
      originalFile,
      originalFile.type || "application/octet-stream",
    );

    originalUploadPaths.push(path);
  }

  return {
    preview_image_path: previewPath,
    print_file_path: printPath,
    original_upload_paths: originalUploadPaths,
  };
}

function emptyFilePaths() {
  return {
    preview_image_path: null,
    print_file_path: null,
    original_upload_paths: [],
  };
}

async function prepareOrderItem(item, checkoutId, index) {
  const customItem = isCustomCartItem(item);

  let filePaths = emptyFilePaths();

  if (customItem) {
    filePaths = await uploadCustomItemFiles(item, checkoutId, index);
  }

  return {
    product_id: null,

    product_name: getItemName(item),

    product_image: getItemImage(item),

    tshirt_color: getItemColor(item),

    tshirt_size: getItemSize(item),

    quantity: getItemQuantity(item),

    unit_price: getItemPrice(item),

    is_custom: customItem,

    design_data: customItem ? item.designData || {} : null,

    ...filePaths,
  };
}

function validateCheckoutData({ customer, address, cartItems }) {
  if (!customer?.fullName?.trim()) {
    throw new Error("Enter your full name.");
  }

  if (!customer?.phone?.trim()) {
    throw new Error("Enter your phone number.");
  }

  if (!address?.governorate?.trim()) {
    throw new Error("Enter your governorate.");
  }

  if (!address?.city?.trim()) {
    throw new Error("Enter your city.");
  }

  if (!address?.streetName?.trim()) {
    throw new Error("Enter your street name.");
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Your cart is empty.");
  }
}

export async function placeOrder({
  customer,
  address,
  cartItems,
  deliveryFee = 75,
}) {
  validateCheckoutData({
    customer,
    address,
    cartItems,
  });

  const idempotencyKey = randomId();

  const checkoutId = randomId();

  const uploadedItems = [];

  for (let index = 0; index < cartItems.length; index += 1) {
    const preparedItem = await prepareOrderItem(
      cartItems[index],
      checkoutId,
      index,
    );

    uploadedItems.push(preparedItem);
  }

  const numericDeliveryFee = Number(deliveryFee);

  const payload = {
    customer: {
      full_name: customer.fullName.trim(),

      email: customer.email?.trim() || null,

      phone: normalizeEgyptPhone(customer.phone),
    },

    address: {
      country: address.country?.trim() || "Egypt",

      governorate: address.governorate.trim(),

      city: address.city.trim(),

      area: address.area?.trim() || null,

      street_name: address.streetName.trim(),

      building_number: address.buildingNumber?.trim() || null,

      floor_number: address.floorNumber?.trim() || null,

      apartment_number: address.apartmentNumber?.trim() || null,

      landmark: address.landmark?.trim() || null,

      postal_code: address.postalCode?.trim() || null,

      latitude: address.latitude ?? null,

      longitude: address.longitude ?? null,

      accuracy: address.accuracy ?? null,

      delivery_notes: address.deliveryNotes?.trim() || null,
    },

    order: {
      idempotency_key: idempotencyKey,

      payment_method: "cash_on_delivery",

      delivery_fee: Number.isFinite(numericDeliveryFee)
        ? numericDeliveryFee
        : 75,

      discount_amount: 0,

      customer_notes: address.deliveryNotes?.trim() || null,
    },

    items: uploadedItems,
  };

  const { data, error } = await supabase.rpc("create_order_with_items", {
    payload,
  });

  if (error) {
    console.error("Create order RPC error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      error,
    });

    throw new Error(error.message || "The order could not be created.");
  }

  if (!data) {
    throw new Error("The order was not created.");
  }

  return data;
}

export async function getPublicOrder(orderNumber, token) {
  if (!orderNumber || !token) {
    throw new Error("The order number and confirmation token are required.");
  }

  const { data, error } = await supabase.rpc("get_public_order", {
    p_order_number: orderNumber,

    p_token: token,
  });

  if (error) {
    console.error("Get public order error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      error,
    });

    throw new Error(error.message || "The order could not be loaded.");
  }

  return data;
}
