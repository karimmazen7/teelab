import { Link } from "react-router";

function ProductCard({ product }) {
  return (
    <article className="group">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">{product.name}</h2>

            <p className="mt-1 text-sm text-neutral-500">Oversized T-shirt</p>
          </div>

          <p className="shrink-0 font-semibold">{product.price} EGP</p>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
