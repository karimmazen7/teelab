import { useState } from "react";
import { Link, useParams } from "react-router";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { productId } = useParams();
  const { addToCart } = useCart();

  const product = products.find((item) => item.id === productId);

  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] ?? "");

  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? "");

  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <h1 className="text-4xl font-bold">Product not found</h1>

        <Link to="/products" className="mt-6 border-b border-black pb-1">
          Return to products
        </Link>
      </section>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-2 lg:px-8 lg:py-20">
      <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="lg:py-8">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
          TeeLab essentials
        </p>

        <h1 className="mt-4 text-4xl font-black sm:text-5xl">{product.name}</h1>

        <p className="mt-5 text-xl font-semibold">{product.price} EGP</p>

        <p className="mt-7 max-w-xl leading-7 text-neutral-600">
          {product.description}
        </p>

        <div className="mt-10">
          <p className="mb-4 text-sm font-semibold">Select size</p>

          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`h-12 min-w-14 border px-4 text-sm font-semibold transition ${
                  selectedSize === size
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 hover:border-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-4 text-sm font-semibold">Select color</p>

          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`border px-5 py-3 text-sm font-semibold transition ${
                  selectedColor === color
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 hover:border-black"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-10 w-full bg-black px-6 py-5 font-semibold text-white transition hover:bg-neutral-800"
        >
          {added ? "Added to cart" : "Add to cart"}
        </button>
      </div>
    </section>
  );
}

export default ProductDetails;
