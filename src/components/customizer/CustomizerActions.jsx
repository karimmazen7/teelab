function CustomizerActions({
  canUndo,
  canRedo,
  previewMode,
  isSaving,
  onUndo,
  onRedo,
  onReset,
  onPreview,
  onEdit,
  onSave,
  onAddToCart,
}) {
  return (
    <section>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="border border-neutral-300 px-3 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="border border-neutral-300 px-3 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Redo
        </button>

        <button
          type="button"
          onClick={onReset}
          className="border border-red-300 px-3 py-3 text-sm font-semibold text-red-600"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {previewMode ? (
          <button
            type="button"
            onClick={onEdit}
            className="w-full border border-black px-5 py-4 font-semibold"
          >
            Edit Design
          </button>
        ) : (
          <button
            type="button"
            onClick={onPreview}
            className="w-full border border-black px-5 py-4 font-semibold transition hover:bg-black hover:text-white"
          >
            Preview Design
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full bg-neutral-800 px-5 py-4 font-semibold text-white transition hover:bg-black disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Design"}
        </button>

        <button
          type="button"
          onClick={onAddToCart}
          className="w-full bg-black px-5 py-5 text-lg font-semibold text-white transition hover:bg-neutral-800"
        >
          Add to Cart
        </button>
      </div>
    </section>
  );
}

export default CustomizerActions;
