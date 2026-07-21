import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

const createCustomCartItemId = () =>
  `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, selectedSize, selectedColor) => {
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.cartItemId === cartItemId,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: Number(item.quantity) + 1,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...product,

          cartItemId,

          selectedSize,
          selectedColor,

          tshirtSize: selectedSize,
          tshirtColor: selectedColor,

          quantity: 1,
          isCustom: false,
        },
      ];
    });
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

    const customItem = {
      id: cartItemId,
      cartItemId,

      name: productName || name,
      productName: productName || name,

      image: previewImage || image || null,

      previewImage,
      printFile,

      originalUploads: Array.isArray(originalUploads) ? originalUploads : [],

      price: finalPrice,
      quantity: finalQuantity,

      selectedColor: finalColor,
      selectedSize: finalSize,

      tshirtColor: finalColor,
      tshirtSize: finalSize,

      designData: designData || {},

      isCustom: true,
      productType: "custom-tshirt",
    };

    setCartItems((currentItems) => [...currentItems, customItem]);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.cartItemId !== cartItemId),
    );
  };

  const updateQuantity = (cartItemId, quantity) => {
    const nextQuantity = Number(quantity);

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0,
      ),
    [cartItems],
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0,
      ),
    [cartItems],
  );

  const value = {
    cartItems,
    cartCount,
    subtotal,

    addToCart,
    addCustomToCart,

    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
