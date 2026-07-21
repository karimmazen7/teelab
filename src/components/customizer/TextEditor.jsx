import { useEffect, useState } from "react";

const fontFamilies = [
  "Arial",
  "Poppins",
  "Montserrat",
  "Bebas Neue",
  "Playfair Display",
  "Oswald",
];

function TextEditor({ selectedText, onAddText, onUpdateText, onDeleteText }) {
  const [newText, setNewText] = useState("");
  const [fontFamily, setFontFamily] = useState("Poppins");
  const [color, setColor] = useState("#111111");

  useEffect(() => {
    if (!selectedText) {
      return;
    }

    setNewText(selectedText.text);
    setFontFamily(selectedText.fontFamily);
    setColor(selectedText.color);
  }, [selectedText]);

  const handleAdd = () => {
    const value = newText.trim();

    if (!value) {
      return;
    }

    onAddText({
      text: value,
      fontFamily,
      color,
    });

    setNewText("");
  };

  const updateSelected = (changes) => {
    if (!selectedText) {
      return;
    }

    onUpdateText(selectedText.id, changes);
  };

  return (
    <section>
      <h2 className="text-lg font-bold">
        {selectedText ? "Edit text" : "Add text"}
      </h2>

      <div className="mt-4 space-y-4">
        <input
          type="text"
          value={newText}
          onChange={(event) => {
            const value = event.target.value;
            setNewText(value);

            if (selectedText) {
              updateSelected({ text: value });
            }
          }}
          placeholder="Enter your text"
          className="w-full border border-neutral-300 px-4 py-3 outline-none transition focus:border-black"
        />

        {!selectedText && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="w-full bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            Add Text
          </button>
        )}

        <div>
          <label className="text-sm font-semibold">Font family</label>

          <select
            value={selectedText ? selectedText.fontFamily : fontFamily}
            onChange={(event) => {
              setFontFamily(event.target.value);
              updateSelected({
                fontFamily: event.target.value,
              });
            }}
            className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-black"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-semibold">
            <span>Text color</span>

            <span className="font-normal text-neutral-500">
              {selectedText?.color ?? color}
            </span>
          </label>

          <input
            type="color"
            value={selectedText?.color ?? color}
            onChange={(event) => {
              setColor(event.target.value);
              updateSelected({ color: event.target.value });
            }}
            className="mt-2 h-12 w-full cursor-pointer border border-neutral-300 bg-white p-1"
          />
        </div>

        {selectedText && (
          <>
            <div>
              <label className="flex justify-between text-sm font-semibold">
                <span>Font size</span>
                <span>{Math.round(selectedText.fontSize)}px</span>
              </label>

              <input
                type="range"
                min="12"
                max="100"
                value={selectedText.fontSize}
                onChange={(event) =>
                  updateSelected({
                    fontSize: Number(event.target.value),
                  })
                }
                className="mt-3 w-full accent-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  updateSelected({
                    fontWeight:
                      selectedText.fontWeight === "bold" ? "normal" : "bold",
                  })
                }
                className={`border px-4 py-3 text-sm font-bold ${
                  selectedText.fontWeight === "bold"
                    ? "border-black bg-black text-white"
                    : "border-neutral-300"
                }`}
              >
                Bold
              </button>

              <button
                type="button"
                onClick={() =>
                  updateSelected({
                    fontStyle:
                      selectedText.fontStyle === "italic" ? "normal" : "italic",
                  })
                }
                className={`border px-4 py-3 text-sm italic ${
                  selectedText.fontStyle === "italic"
                    ? "border-black bg-black text-white"
                    : "border-neutral-300"
                }`}
              >
                Italic
              </button>
            </div>

            <div>
              <label className="text-sm font-semibold">Text alignment</label>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {["left", "center", "right"].map((alignment) => (
                  <button
                    key={alignment}
                    type="button"
                    onClick={() => updateSelected({ align: alignment })}
                    className={`border px-3 py-3 text-sm capitalize ${
                      selectedText.align === alignment
                        ? "border-black bg-black text-white"
                        : "border-neutral-300"
                    }`}
                  >
                    {alignment}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex justify-between text-sm font-semibold">
                <span>Rotation</span>
                <span>{Math.round(selectedText.rotation)}°</span>
              </label>

              <input
                type="range"
                min="-180"
                max="180"
                value={selectedText.rotation}
                onChange={(event) =>
                  updateSelected({
                    rotation: Number(event.target.value),
                  })
                }
                className="mt-3 w-full accent-black"
              />
            </div>

            <button
              type="button"
              onClick={() => onDeleteText(selectedText.id)}
              className="w-full border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete Text
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default TextEditor;
