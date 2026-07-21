const sizes = ["M", "L", "XL"];

function SizeSelector({
  selectedSize,
  quantity,
  onSizeChange,
  onQuantityChange,
}) {
  return (
    <section>
      <h2 className="text-lg font-bold">Size and quantity</h2>

      <div className="mt-4">
        <p className="text-sm font-semibold">Select T-shirt size</p>

        <div className="mt-3 grid grid-cols-5 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onSizeChange(size)}
              className={`border px-2 py-3 text-sm font-semibold transition ${
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

      <div className="mt-5">
        <label className="text-sm font-semibold">Quantity</label>

        <div className="mt-3 flex w-fit items-center border border-neutral-300">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="h-12 w-12 text-xl"
          >
            −
          </button>

          <span className="min-w-12 text-center font-semibold">{quantity}</span>

          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
            className="h-12 w-12 text-xl"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}

export default SizeSelector;
