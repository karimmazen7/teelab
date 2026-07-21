const colors = [
  {
    id: "white",
    name: "White",
    value: "#ffffff",
  },
  {
    id: "black",
    name: "Black",
    value: "#111111",
  },
  {
    id: "blue",
    name: "Blue",
    value: "#1d4ed8",
  },
];

function ColorSelector({ selectedColor, onChange }) {
  return (
    <section>
      <h2 className="text-lg font-bold">T-shirt color</h2>

      <div className="mt-4 flex flex-wrap gap-4">
        {colors.map((color) => {
          const isSelected = selectedColor === color.id;

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onChange(color.id)}
              className="group flex flex-col items-center gap-2"
              aria-pressed={isSelected}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                  isSelected
                    ? "border-black ring-2 ring-black ring-offset-2"
                    : "border-neutral-300 hover:border-black"
                }`}
                style={{ backgroundColor: color.value }}
              >
                {color.id === "black" && isSelected && (
                  <span className="text-lg text-white">✓</span>
                )}

                {color.id !== "black" && isSelected && (
                  <span className="text-lg text-black">✓</span>
                )}
              </span>

              <span
                className={`text-sm ${
                  isSelected ? "font-semibold text-black" : "text-neutral-500"
                }`}
              >
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ColorSelector;
