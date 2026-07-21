function LayersPanel({
  elements,
  selectedElementId,
  onSelect,
  onToggleVisibility,
  onDelete,
  onBringForward,
  onSendBackward,
}) {
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Layers</h2>

        <span className="text-sm text-neutral-500">{elements.length}</span>
      </div>

      {sortedElements.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Uploaded images and text elements will appear here.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {sortedElements.map((element) => {
            const isSelected = element.id === selectedElementId;

            return (
              <div
                key={element.id}
                className={`border p-3 transition ${
                  isSelected
                    ? "border-black bg-neutral-50"
                    : "border-neutral-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(element.id)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {element.type === "text"
                        ? element.text || "Empty text"
                        : element.name || "Uploaded image"}
                    </p>

                    <p className="mt-1 text-xs capitalize text-neutral-500">
                      {element.type}
                    </p>
                  </div>

                  {isSelected && (
                    <span className="text-xs font-semibold">Selected</span>
                  )}
                </button>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    title={
                      element.visible === false ? "Show layer" : "Hide layer"
                    }
                    onClick={() => onToggleVisibility(element.id)}
                    className="border border-neutral-200 py-2 text-xs"
                  >
                    {element.visible === false ? "Show" : "Hide"}
                  </button>

                  <button
                    type="button"
                    title="Bring forward"
                    onClick={() => onBringForward(element.id)}
                    className="border border-neutral-200 py-2 text-xs"
                  >
                    Up
                  </button>

                  <button
                    type="button"
                    title="Send backward"
                    onClick={() => onSendBackward(element.id)}
                    className="border border-neutral-200 py-2 text-xs"
                  >
                    Down
                  </button>

                  <button
                    type="button"
                    title="Delete layer"
                    onClick={() => onDelete(element.id)}
                    className="border border-red-200 py-2 text-xs text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default LayersPanel;
