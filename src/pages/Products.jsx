import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

function Products() {
  return (
    <section className="mx-auto min-h-screen max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-14">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
          TeeLab collection
        </p>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">All products</h1>

        <p className="mt-5 max-w-xl leading-7 text-neutral-600">
          Choose a TeeLab essential or start with a customizable T-shirt and
          make it your own.
        </p>
      </div>

      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default Products;
