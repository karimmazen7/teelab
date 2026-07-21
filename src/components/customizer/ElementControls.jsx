function ElementControls({
  element,
  onUpdate,
  onDelete,
  onCenter,
  onBringForward,
  onSendBackward,
}) {
  if (!element) {
    return (
      <section>
        <h2 className="text-lg font-bold">Element controls</h2>

        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Select an image or text element on the T-shirt to display its
          controls.
        </p>
      </section>
    );
  }

  const handleSizeChange = (value) => {
    if (element.type !== "image") {
      return;
    }

    const newWidth = Number(value);
    const aspectRatio =
      element.aspectRatio || element.width / Math.max(element.height, 1);

    onUpdate(element.id, {
      width: newWidth,
      height: newWidth / aspectRatio,
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Element controls</h2>

        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize">
          {element.type}
        </span>
      </div>

      <div className="mt-4 space-y-5">
        {element.type === "image" && (
          <div>
            <label className="flex justify-between text-sm font-semibold">
              <span>Image size</span>
              <span>{Math.round(element.width)}px</span>
            </label>

            <input
              type="range"
              min="40"
              max="400"
              value={element.width}
              onChange={(event) => handleSizeChange(event.target.value)}
              className="mt-3 w-full accent-black"
            />
          </div>
        )}

        <div>
          <label className="flex justify-between text-sm font-semibold">
            <span>Rotation</span>
            <span>{Math.round(element.rotation)}°</span>
          </label>

          <input
            type="range"
            min="-180"
            max="180"
            value={element.rotation}
            onChange={(event) =>
              onUpdate(element.id, {
                rotation: Number(event.target.value),
              })
            }
            className="mt-3 w-full accent-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onCenter(element.id)}
            className="border border-neutral-300 px-3 py-3 text-sm font-semibold hover:border-black"
          >
            Center
          </button>

          <button
            type="button"
            onClick={() => onDelete(element.id)}
            className="border border-red-300 px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={() => onBringForward(element.id)}
            className="border border-neutral-300 px-3 py-3 text-sm font-semibold hover:border-black"
          >
            Bring forward
          </button>

          <button
            type="button"
            onClick={() => onSendBackward(element.id)}
            className="border border-neutral-300 px-3 py-3 text-sm font-semibold hover:border-black"
          >
            Send backward
          </button>
        </div>
      </div>
    </section>
  );
}

export default ElementControls;
