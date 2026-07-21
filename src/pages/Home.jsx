import { Link } from "react-router";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

function Home() {
  return (
    <>
      <section className="flex min-h-[calc(100vh-80px)] items-center bg-neutral-100">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Made by you
            </p>

            <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
              Your idea.
              <br />
              Your T-shirt.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-neutral-600">
              Create personalized T-shirts for yourself, your friends, your
              family, or someone special.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-black px-7 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Shop T-shirts
              </Link>

              <Link
                to="/customizer"
                className="border border-black px-7 py-4 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Create Your Design
              </Link>
            </div>
          </div>

          <div className="aspect-[4/5] overflow-hidden bg-neutral-200">
            <img
              src={products[0].image}
              alt="TeeLab oversized T-shirt"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
              New collection
            </p>

            <h2 className="mt-3 text-3xl font-bold">Featured T-shirts</h2>
          </div>

          <Link
            to="/products"
            className="hidden border-b border-black pb-1 text-sm font-semibold sm:block"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
