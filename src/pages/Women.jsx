import { Link } from "react-router";
import { products } from "../data/products";

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;

function Women() {
  const womenProducts = products.filter(
    (product) => product.gender === "women",
  );

  return (
    <main className="min-h-screen bg-white">
      <section className="px-5 pb-10 pt-14 text-center sm:px-8 lg:pt-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
          TeeLab Collection
        </p>

        <h1 className="mt-3 text-4xl font-semibold uppercase tracking-tight sm:text-5xl">
          Women
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-500">
          Discover modern women’s essentials made for comfort, versatility and
          everyday styling.
        </p>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-20 sm:px-8 lg:px-12">
        {womenProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-7 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-16">
            {womenProducts.map((product, index) => (
              <article key={product.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  <Link
                    to={`/products/${product.id}`}
                    aria-label={`View ${product.name}`}
                    className="block h-full w-full"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading={index > 3 ? "lazy" : "eager"}
                      decoding="async"
                      width="800"
                      height="1000"
                      className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                    />
                  </Link>

                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/[0.03]" />
                </div>

                <div className="pt-5">
                  <Link to={`/products/${product.id}`}>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm">
                      {product.name}
                    </h2>
                  </Link>

                  <p className="mt-2 text-xs tracking-[0.14em] text-neutral-600 sm:text-sm">
                    {formatMoney(product.price)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Women’s collection coming soon
            </p>

            <Link
              to="/products"
              className="mt-7 inline-block border border-black bg-black px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
            >
              Shop Unisex
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default Women;
