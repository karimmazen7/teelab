import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import ColorSelector from "../components/customizer/ColorSelector";
import CustomizerActions from "../components/customizer/CustomizerActions";
import ElementControls from "../components/customizer/ElementControls";
import ImageUploader from "../components/customizer/ImageUploader";
import LayersPanel from "../components/customizer/LayersPanel";
import SizeSelector from "../components/customizer/SizeSelector";
import TextEditor from "../components/customizer/TextEditor";
import TshirtCanvas from "../components/customizer/TshirtCanvas";

import { useCart } from "../context/CartContext";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 700;

const PRINT_AREA = {
  x: 185,
  y: 205,
  width: 230,
  height: 310,
};

const CUSTOM_TSHIRT_PRICE = 850;

const createId = () =>
  `element-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const waitForCanvasUpdate = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

function Customizer() {
  const canvasRef = useRef(null);
  const messageTimerRef = useRef(null);

  const navigate = useNavigate();
  const { addCustomToCart } = useCart();

  const [tshirtColor, setTshirtColor] = useState("white");
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);

  const [previewMode, setPreviewMode] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const [savedPreview, setSavedPreview] = useState(null);
  const [savedPrintFile, setSavedPrintFile] = useState(null);

  /*
   * Stores the original browser File objects separately.
   * Do not place File objects inside designData because JSON cannot
   * serialize them correctly.
   */
  const [originalUploads, setOriginalUploads] = useState([]);

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedElementId) ?? null,
    [elements, selectedElementId],
  );

  const selectedText =
    selectedElement?.type === "text" ? selectedElement : null;

  const sortedElements = useMemo(
    () => [...elements].sort((first, second) => first.zIndex - second.zIndex),
    [elements],
  );

  const commitElements = (nextElements) => {
    setPast((currentPast) => [...currentPast, elements]);

    setElements(nextElements);
    setFuture([]);

    setSavedPreview(null);
    setSavedPrintFile(null);
  };

  const updateElementsWith = (updater) => {
    const nextElements =
      typeof updater === "function" ? updater(elements) : updater;

    commitElements(nextElements);
  };

  const showMessage = (value) => {
    if (messageTimerRef.current) {
      window.clearTimeout(messageTimerRef.current);
    }

    setMessage(value);

    messageTimerRef.current = window.setTimeout(() => {
      setMessage("");
    }, 3500);
  };

  const handleColorChange = (color) => {
    setTshirtColor(color);
    setSavedPreview(null);
    setSavedPrintFile(null);
  };

  /*
   * ImageUploader should ideally return:
   *
   * {
   *   file,
   *   src,
   *   name,
   *   naturalWidth,
   *   naturalHeight
   * }
   *
   * This function still works if file is temporarily missing.
   */
  const handleUploadImage = ({
    file,
    src,
    name,
    naturalWidth,
    naturalHeight,
  }) => {
    if (!src) {
      showMessage("The uploaded image could not be read.");
      return;
    }

    const safeNaturalWidth = Math.max(Number(naturalWidth) || 1, 1);

    const safeNaturalHeight = Math.max(Number(naturalHeight) || 1, 1);

    const maxInitialWidth = 160;
    const maxInitialHeight = 190;

    const aspectRatio = safeNaturalWidth / safeNaturalHeight;

    let width = Math.min(maxInitialWidth, safeNaturalWidth);

    let height = width / aspectRatio;

    if (height > maxInitialHeight) {
      height = maxInitialHeight;
      width = height * aspectRatio;
    }

    const uploadId = createId();

    const newElement = {
      id: uploadId,
      type: "image",
      name: name || "Uploaded image",
      src,

      x: PRINT_AREA.x + (PRINT_AREA.width - width) / 2,

      y: PRINT_AREA.y + (PRINT_AREA.height - height) / 2,

      width,
      height,
      aspectRatio,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1,
      visible: true,
    };

    updateElementsWith([...elements, newElement]);

    if (file instanceof File) {
      setOriginalUploads((currentUploads) => [
        ...currentUploads,
        {
          id: uploadId,
          file,
          name: file.name,
          type: file.type,
          size: file.size,
        },
      ]);
    }

    setSelectedElementId(newElement.id);
    setPreviewMode(false);
  };

  const handleAddText = ({ text, fontFamily, color }) => {
    const cleanText = text?.trim();

    if (!cleanText) {
      showMessage("Enter text before adding it.");
      return;
    }

    const width = 200;

    const newElement = {
      id: createId(),
      type: "text",
      text: cleanText,

      x: PRINT_AREA.x + (PRINT_AREA.width - width) / 2,

      y: PRINT_AREA.y + PRINT_AREA.height / 2 - 20,

      width,
      fontSize: 32,
      fontFamily: fontFamily || "Poppins",
      color: color || "#000000",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "",
      align: "center",
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1,
      visible: true,
    };

    updateElementsWith([...elements, newElement]);

    setSelectedElementId(newElement.id);
    setPreviewMode(false);
  };

  const handleUpdateElement = (id, changes) => {
    const nextElements = elements.map((element) =>
      element.id === id
        ? {
            ...element,
            ...changes,
          }
        : element,
    );

    commitElements(nextElements);
  };

  const handleDeleteElement = (id) => {
    const deletedElement = elements.find((element) => element.id === id);

    const nextElements = elements.filter((element) => element.id !== id);

    commitElements(nextElements);

    if (deletedElement?.type === "image") {
      setOriginalUploads((currentUploads) =>
        currentUploads.filter((upload) => upload.id !== id),
      );
    }

    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleCenterElement = (id) => {
    const element = elements.find((item) => item.id === id);

    if (!element) {
      return;
    }

    const elementWidth = Number(element.width) || 100;

    const elementHeight =
      element.type === "image"
        ? Number(element.height) || 100
        : Number(element.fontSize) * 1.4 || 44;

    handleUpdateElement(id, {
      x: PRINT_AREA.x + (PRINT_AREA.width - elementWidth) / 2,

      y: PRINT_AREA.y + (PRINT_AREA.height - elementHeight) / 2,
    });
  };

  const moveLayer = (id, direction) => {
    const sorted = [...elements].sort(
      (first, second) => first.zIndex - second.zIndex,
    );

    const currentIndex = sorted.findIndex((element) => element.id === id);

    const targetIndex =
      direction === "forward" ? currentIndex + 1 : currentIndex - 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sorted.length) {
      return;
    }

    const currentElement = sorted[currentIndex];
    const targetElement = sorted[targetIndex];

    const nextElements = elements.map((element) => {
      if (element.id === currentElement.id) {
        return {
          ...element,
          zIndex: targetElement.zIndex,
        };
      }

      if (element.id === targetElement.id) {
        return {
          ...element,
          zIndex: currentElement.zIndex,
        };
      }

      return element;
    });

    commitElements(nextElements);
  };

  const handleToggleVisibility = (id) => {
    const nextElements = elements.map((element) =>
      element.id === id
        ? {
            ...element,
            visible: element.visible === false,
          }
        : element,
    );

    commitElements(nextElements);
  };

  const handleUndo = () => {
    if (past.length === 0) {
      return;
    }

    const previousElements = past[past.length - 1];

    setFuture((currentFuture) => [elements, ...currentFuture]);

    setPast((currentPast) => currentPast.slice(0, -1));

    setElements(previousElements);
    setSelectedElementId(null);
    setSavedPreview(null);
    setSavedPrintFile(null);
  };

  const handleRedo = () => {
    if (future.length === 0) {
      return;
    }

    const nextElements = future[0];

    setPast((currentPast) => [...currentPast, elements]);

    setFuture((currentFuture) => currentFuture.slice(1));

    setElements(nextElements);
    setSelectedElementId(null);
    setSavedPreview(null);
    setSavedPrintFile(null);
  };

  const handleReset = () => {
    if (elements.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Remove every image and text element from this design?",
    );

    if (!confirmed) {
      return;
    }

    commitElements([]);

    setOriginalUploads([]);
    setSelectedElementId(null);
    setPreviewMode(false);
    setSavedPreview(null);
    setSavedPrintFile(null);

    showMessage("Design reset successfully.");
  };

  const buildDesignData = () => ({
    version: 1,
    productType: "custom-tshirt",
    tshirtColor,

    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,

    printArea: {
      ...PRINT_AREA,
    },

    elements: sortedElements.map((element) => ({
      ...element,
    })),

    createdWith: "TeeLab Customizer",
    updatedAt: new Date().toISOString(),
  });

  const generatePreview = () => {
    if (!canvasRef.current?.exportPreview) {
      return null;
    }

    return canvasRef.current.exportPreview();
  };

  const generatePrintFile = () => {
    if (!canvasRef.current?.exportPrintFile) {
      return null;
    }

    return canvasRef.current.exportPrintFile();
  };

  const generateDesignFiles = async () => {
    setSelectedElementId(null);

    await waitForCanvasUpdate();

    const previewImage = generatePreview();
    const printFile = generatePrintFile();

    if (!previewImage) {
      throw new Error("The T-shirt preview could not be generated.");
    }

    if (!printFile) {
      throw new Error(
        "The transparent print file could not be generated. Add exportPrintFile() to TshirtCanvas.",
      );
    }

    return {
      previewImage,
      printFile,
    };
  };

  const handlePreview = () => {
    setSelectedElementId(null);
    setPreviewMode(true);
  };

  const handleSave = async () => {
    if (elements.length === 0) {
      showMessage("Add an image or text before saving your design.");

      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const { previewImage, printFile } = await generateDesignFiles();

      const savedDesign = {
        id: `design-${Date.now()}`,
        ...buildDesignData(),
        previewImage,
        printFile,
      };

      /*
       * Local storage is only a temporary browser backup.
       * Final files are uploaded to Supabase during checkout.
       */
      const localStorageDesign = {
        ...savedDesign,

        /*
         * The high-resolution transparent file may be very
         * large, so avoid storing it in localStorage.
         */
        printFile: null,
      };

      localStorage.setItem(
        "teelab-saved-design",
        JSON.stringify(localStorageDesign),
      );

      setSavedPreview(previewImage);
      setSavedPrintFile(printFile);

      showMessage("Your design was saved successfully.");
    } catch (error) {
      console.error(error);

      showMessage(error.message || "Your design could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart) {
      return;
    }

    if (!selectedSize) {
      showMessage("Please select a T-shirt size before adding it to the cart.");

      return;
    }

    if (elements.length === 0) {
      showMessage(
        "Add an image or text before adding the T-shirt to your cart.",
      );

      return;
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      showMessage("Enter a valid quantity.");
      return;
    }

    setIsAddingToCart(true);

    try {
      let previewImage = savedPreview;
      let printFile = savedPrintFile;

      if (!previewImage || !printFile) {
        const generatedFiles = await generateDesignFiles();

        previewImage = generatedFiles.previewImage;

        printFile = generatedFiles.printFile;
      }

      const designData = buildDesignData();

      addCustomToCart({
        productName: "Custom T-Shirt",
        name: "Custom T-Shirt",

        tshirtColor,
        selectedColor: tshirtColor,

        tshirtSize: selectedSize,
        selectedSize,

        quantity: Number(quantity),
        designData,
        previewImage,
        printFile,

        /*
         * orderService.js uploads these File objects into
         * the customer-uploads bucket during checkout.
         */
        originalUploads,

        image: previewImage,
        price: CUSTOM_TSHIRT_PRICE,
        isCustom: true,
      });

      setSavedPreview(previewImage);
      setSavedPrintFile(printFile);

      showMessage("Custom T-shirt added to your cart.");

      window.setTimeout(() => {
        navigate("/cart");
      }, 500);
    } catch (error) {
      console.error(error);

      showMessage(
        error.message || "The custom T-shirt could not be added to your cart.",
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <section className="min-h-screen bg-white">
      <div className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
            TeeLab Studio
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Create Your Design
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-neutral-600">
            Upload your artwork, add custom text and create a T-shirt designed
            entirely by you.
          </p>
        </div>
      </div>

      {message && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-24 z-[100] w-[calc(100%-32px)] max-w-md -translate-x-1/2 bg-black px-5 py-4 text-center text-sm font-semibold text-white shadow-xl"
        >
          {message}
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
        <div className="order-2 divide-y divide-neutral-200 border border-neutral-200 lg:order-1">
          <div className="p-6">
            <ColorSelector
              selectedColor={tshirtColor}
              onChange={handleColorChange}
            />
          </div>

          <div className="p-6">
            <ImageUploader onUpload={handleUploadImage} />

            {originalUploads.length > 0 && (
              <p className="mt-3 text-xs text-neutral-500">
                {originalUploads.length} original{" "}
                {originalUploads.length === 1 ? "file" : "files"} ready for
                checkout.
              </p>
            )}
          </div>

          <div className="p-6">
            <TextEditor
              selectedText={selectedText}
              onAddText={handleAddText}
              onUpdateText={handleUpdateElement}
              onDeleteText={handleDeleteElement}
            />
          </div>

          <div className="p-6">
            <ElementControls
              element={selectedElement}
              onUpdate={handleUpdateElement}
              onDelete={handleDeleteElement}
              onCenter={handleCenterElement}
              onBringForward={(id) => moveLayer(id, "forward")}
              onSendBackward={(id) => moveLayer(id, "backward")}
            />
          </div>

          <div className="p-6">
            <LayersPanel
              elements={sortedElements}
              selectedElementId={selectedElementId}
              onSelect={(id) => {
                setSelectedElementId(id);
                setPreviewMode(false);
              }}
              onToggleVisibility={handleToggleVisibility}
              onDelete={handleDeleteElement}
              onBringForward={(id) => moveLayer(id, "forward")}
              onSendBackward={(id) => moveLayer(id, "backward")}
            />
          </div>

          <div className="p-6">
            <SizeSelector
              selectedSize={selectedSize}
              quantity={quantity}
              onSizeChange={setSelectedSize}
              onQuantityChange={(value) => {
                const nextQuantity = Math.max(
                  1,
                  Math.min(20, Number(value) || 1),
                );

                setQuantity(nextQuantity);
              }}
            />
          </div>

          <div className="p-6">
            <CustomizerActions
              canUndo={past.length > 0}
              canRedo={future.length > 0}
              previewMode={previewMode}
              isSaving={isSaving || isAddingToCart}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onReset={handleReset}
              onPreview={handlePreview}
              onEdit={() => setPreviewMode(false)}
              onSave={handleSave}
              onAddToCart={handleAddToCart}
            />

            {isAddingToCart && (
              <p className="mt-3 text-center text-sm text-neutral-500">
                Generating your production files...
              </p>
            )}
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <div className="border border-neutral-200 bg-neutral-100 p-3 sm:p-6">
              <TshirtCanvas
                ref={canvasRef}
                tshirtColor={tshirtColor}
                elements={sortedElements}
                selectedElementId={selectedElementId}
                previewMode={previewMode}
                onSelectElement={(id) => {
                  setSelectedElementId(id);

                  if (id) {
                    setPreviewMode(false);
                  }
                }}
                onUpdateElement={handleUpdateElement}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-500">
                {previewMode
                  ? "Clean preview mode"
                  : "Select, drag, resize or rotate an element."}
              </p>

              <div className="text-right">
                <p className="text-lg font-bold">{CUSTOM_TSHIRT_PRICE} EGP</p>

                <p className="text-xs text-neutral-500">Per T-shirt</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Customizer;
