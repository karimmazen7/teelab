import { Link } from "react-router";

function ProductCard({ product }) {
  return (
    <article className="group">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <div className="mt-4 text-center">
          <h2 className="font-semibold">{product.name}</h2>

          <p className="mt-2 text-sm font-normal tracking-[0.1em] text-neutral-600">
            {Number(product.price).toFixed(2)} EGP
          </p>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
