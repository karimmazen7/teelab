import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

function Products() {
  const unisexProducts = products.filter(
    (product) => product.gender === "unisex",
  );

  return (
    <section className="mx-auto min-h-screen max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-14">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
          TeeLab Collection
        </p>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Unisex</h1>

        <p className="mt-5 max-w-xl leading-7 text-neutral-600">
          Explore versatile TeeLab essentials designed for everyone.
        </p>
      </div>

      {unisexProducts.length > 0 ? (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {unisexProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            No unisex products available
          </p>
        </div>
      )}
    </section>
  );
}

export default Products;
