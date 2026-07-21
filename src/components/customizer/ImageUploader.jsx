import { useRef, useState } from "react";

const acceptedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

function ImageUploader({ onUpload }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handleFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!acceptedTypes.includes(file.type)) {
      setError("Please upload a PNG, JPG, JPEG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        onUpload({
          src: reader.result,
          name: file.name,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
        });
      };

      image.src = reader.result;
    };

    reader.onerror = () => {
      setError("The image could not be loaded.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <section>
      <h2 className="text-lg font-bold">Upload image</h2>

      <p className="mt-2 text-sm leading-6 text-neutral-500">
        PNG, JPG, JPEG or WEBP. Maximum file size: 5 MB.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 w-full border border-black px-5 py-4 text-sm font-semibold transition hover:bg-black hover:text-white"
      >
        Upload Your Image
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}

export default ImageUploader;
