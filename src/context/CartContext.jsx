import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { trackAddToCart } from "../lib/metaPixel";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "teelab_cart";

const createCustomCartItemId = () =>
  `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const getCartItemKey = (item) => {
  if (item?.isCustom) {
    return item.cartItemId || item.id;
  }

  const selectedSize = item?.selectedSize || item?.tshirtSize || "no-size";

  const selectedColor = item?.selectedColor || item?.tshirtColor || "no-color";

  return `${item?.id}-${selectedSize}-${selectedColor}`;
};

const loadCartFromStorage = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const quantity = Math.max(1, Number(item.quantity) || 1);

        const cartItemId = item.cartItemId || getCartItemKey(item);

        return {
          ...item,
          cartItemId,
          quantity,
        };
      });
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);

    return [];
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCartFromStorage);

  const skipNextStorageSave = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (skipNextStorageSave.current) {
      skipNextStorageSave.current = false;
      return;
    }

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = (product, selectedSize, selectedColor) => {
    if (!product) {
      throw new Error("Product is required.");
    }

    const finalSize =
      selectedSize || product.selectedSize || product.tshirtSize || "";

    const finalColor =
      selectedColor || product.selectedColor || product.tshirtColor || "";

    const quantityToAdd = Math.max(1, Number(product.quantity) || 1);

    const newItem = {
      ...product,

      selectedSize: finalSize,
      selectedColor: finalColor,

      tshirtSize: finalSize,
      tshirtColor: finalColor,

      quantity: quantityToAdd,

      isCustom: false,
      productType: product.productType || "standard",
    };

    const cartItemId = getCartItemKey(newItem);

    const finalItem = {
      ...newItem,
      cartItemId,
    };

    /*
      Send the Meta AddToCart event only when the customer
      explicitly adds the product to the cart.
    */
    trackAddToCart(finalItem, quantityToAdd);

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => getCartItemKey(item) === cartItemId,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          getCartItemKey(item) === cartItemId
            ? {
                ...item,
                quantity:
                  Math.max(1, Number(item.quantity) || 1) + quantityToAdd,
              }
            : item,
        );
      }

      return [...currentItems, finalItem];
    });

    return finalItem;
  };

  const addCustomToCart = ({
    productName = "Custom T-Shirt",
    name = "Custom T-Shirt",

    tshirtColor,
    selectedColor,

    tshirtSize,
    selectedSize,

    quantity = 1,
    price = 0,

    designData,
    previewImage,
    printFile,
    originalUploads = [],

    image,
    images = [],
    selectedColorLabel,
  }) => {
    const finalColor = tshirtColor || selectedColor || "white";

    const finalSize = tshirtSize || selectedSize || "";

    const finalQuantity = Math.max(1, Number(quantity) || 1);

    const finalPrice = Math.max(0, Number(price) || 0);

    if (!previewImage) {
      throw new Error("The custom T-shirt preview is missing.");
    }

    if (!printFile) {
      throw new Error("The custom T-shirt transparent print file is missing.");
    }

    const cartItemId = createCustomCartItemId();

    const finalProductName = productName || name || "Custom T-Shirt";

    const customItem = {
      id: cartItemId,
      cartItemId,

      name: finalProductName,
      productName: finalProductName,

      image: previewImage || image || null,

      images: Array.isArray(images) ? images : [],

      previewImage,
      printFile,

      originalUploads: Array.isArray(originalUploads) ? originalUploads : [],

      price: finalPrice,
      quantity: finalQuantity,

      selectedColor: finalColor,

      selectedColorLabel: selectedColorLabel || finalColor,

      selectedSize: finalSize,

      tshirtColor: finalColor,
      tshirtSize: finalSize,

      designData: designData || {},

      isCustom: true,
      productType: "custom-tshirt",
    };

    /*
      Send AddToCart for the customized T-shirt.
      Meta will receive the custom item's price and quantity.
    */
    trackAddToCart(customItem, finalQuantity);

    setCartItems((currentItems) => [...currentItems, customItem]);

    return customItem;
  };

  const increaseQuantity = (cartItemKey) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        getCartItemKey(item) === cartItemKey
          ? {
              ...item,
              quantity: Math.max(1, Number(item.quantity) || 1) + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (cartItemKey) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        getCartItemKey(item) === cartItemKey
          ? {
              ...item,
              quantity: Math.max(1, (Number(item.quantity) || 1) - 1),
            }
          : item,
      ),
    );
  };

  const updateQuantity = (cartItemKey, quantity) => {
    const nextQuantity = Math.max(1, Number(quantity) || 1);

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        getCartItemKey(item) === cartItemKey
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item,
      ),
    );
  };

  const removeFromCart = (cartItemKey) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => getCartItemKey(item) !== cartItemKey),
    );
  };

  const clearCart = () => {
    skipNextStorageSave.current = true;

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear cart from localStorage:", error);
      }
    }

    setCartItems([]);
  };

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Math.max(1, Number(item.quantity) || 1),
        0,
      ),
    [cartItems],
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const price = Math.max(0, Number(item.price) || 0);

        const quantity = Math.max(1, Number(item.quantity) || 1);

        return total + price * quantity;
      }, 0),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      subtotal,

      addToCart,
      addCustomToCart,

      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      updateQuantity,
      clearCart,

      getCartItemKey,
    }),
    [cartItems, cartCount, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
