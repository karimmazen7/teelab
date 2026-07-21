import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  Group,
  Image as KonvaImage,
  Layer,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";

import useImage from "use-image";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 700;

const PRINT_AREA = {
  x: 185,
  y: 205,
  width: 230,
  height: 310,
};

const tshirtColors = {
  white: "/images/tshirt-white.png",
  black: "/images/tshirt-black.png",
  blue: "/images/tshirt-blue.png",
};

function CanvasImageElement({
  element,
  isSelected,
  previewMode,
  onSelect,
  onChange,
}) {
  const [image] = useImage(element.src);
  const shapeRef = useRef(null);
  const transformerRef = useRef(null);

  useEffect(() => {
    if (
      isSelected &&
      !previewMode &&
      shapeRef.current &&
      transformerRef.current
    ) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, previewMode]);

  if (element.visible === false) {
    return null;
  }

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        id={element.id}
        name="design-element"
        image={image}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation || 0}
        opacity={element.opacity ?? 1}
        draggable={!previewMode}
        onClick={(event) => {
          event.cancelBubble = true;
          onSelect(element.id);
        }}
        onTap={(event) => {
          event.cancelBubble = true;
          onSelect(element.id);
        }}
        onDragEnd={(event) => {
          onChange(element.id, {
            x: event.target.x(),
            y: event.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;

          if (!node) {
            return;
          }

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange(element.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(30, node.width() * Math.abs(scaleX)),
            height: Math.max(30, node.height() * Math.abs(scaleY)),
            rotation: node.rotation(),
          });
        }}
        dragBoundFunc={(position) => ({
          x: Math.max(0, Math.min(CANVAS_WIDTH - element.width, position.x)),
          y: Math.max(0, Math.min(CANVAS_HEIGHT - element.height, position.y)),
        })}
      />

      {isSelected && !previewMode && (
        <Transformer
          ref={transformerRef}
          name="editor-transformer"
          rotateEnabled
          flipEnabled={false}
          borderStroke="#111111"
          borderStrokeWidth={1.5}
          anchorFill="#ffffff"
          anchorStroke="#111111"
          anchorSize={11}
          rotateAnchorOffset={28}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 30 || Math.abs(newBox.height) < 30) {
              return oldBox;
            }

            return newBox;
          }}
        />
      )}
    </>
  );
}

function CanvasTextElement({
  element,
  isSelected,
  previewMode,
  onSelect,
  onChange,
}) {
  const shapeRef = useRef(null);
  const transformerRef = useRef(null);

  useEffect(() => {
    if (
      isSelected &&
      !previewMode &&
      shapeRef.current &&
      transformerRef.current
    ) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, previewMode]);

  if (element.visible === false) {
    return null;
  }

  const fontStyle = [element.fontWeight, element.fontStyle]
    .filter((value) => value && value !== "normal" && value !== "regular")
    .join(" ");

  return (
    <>
      <Text
        ref={shapeRef}
        id={element.id}
        name="design-element"
        text={element.text}
        x={element.x}
        y={element.y}
        width={element.width}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fill={element.color}
        fontStyle={fontStyle || "normal"}
        textDecoration={element.textDecoration || ""}
        align={element.align || "center"}
        rotation={element.rotation || 0}
        opacity={element.opacity ?? 1}
        draggable={!previewMode}
        padding={5}
        wrap="word"
        onClick={(event) => {
          event.cancelBubble = true;
          onSelect(element.id);
        }}
        onTap={(event) => {
          event.cancelBubble = true;
          onSelect(element.id);
        }}
        onDragEnd={(event) => {
          onChange(element.id, {
            x: event.target.x(),
            y: event.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;

          if (!node) {
            return;
          }

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange(element.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(60, node.width() * Math.abs(scaleX)),
            fontSize: Math.max(10, element.fontSize * Math.abs(scaleY)),
            rotation: node.rotation(),
          });
        }}
        dragBoundFunc={(position) => ({
          x: Math.max(0, Math.min(CANVAS_WIDTH - element.width, position.x)),
          y: Math.max(
            0,
            Math.min(CANVAS_HEIGHT - element.fontSize, position.y),
          ),
        })}
      />

      {isSelected && !previewMode && (
        <Transformer
          ref={transformerRef}
          name="editor-transformer"
          rotateEnabled
          flipEnabled={false}
          borderStroke="#111111"
          borderStrokeWidth={1.5}
          anchorFill="#ffffff"
          anchorStroke="#111111"
          anchorSize={11}
          rotateAnchorOffset={28}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 60 || Math.abs(newBox.height) < 15) {
              return oldBox;
            }

            return newBox;
          }}
        />
      )}
    </>
  );
}

const TshirtCanvas = forwardRef(function TshirtCanvas(
  {
    tshirtColor,
    elements,
    selectedElementId,
    previewMode,
    onSelectElement,
    onUpdateElement,
  },
  ref,
) {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const backgroundLayerRef = useRef(null);
  const designLayerRef = useRef(null);
  const printableAreaRef = useRef(null);

  const [tshirtImage] = useImage(
    tshirtColors[tshirtColor] || tshirtColors.white,
  );

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return undefined;
    }

    const updateScale = () => {
      const availableWidth = wrapper.clientWidth;

      const nextScale = Math.min(availableWidth / CANVAS_WIDTH, 1);

      setScale(nextScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, []);

  const hideEditorControls = () => {
    const stage = stageRef.current;

    if (!stage) {
      return [];
    }

    const controls = stage.find(".editor-transformer");

    const previousStates = controls.map((node) => ({
      node,
      visible: node.visible(),
    }));

    controls.forEach((node) => {
      node.visible(false);
    });

    return previousStates;
  };

  const restoreEditorControls = (states) => {
    states.forEach(({ node, visible }) => {
      node.visible(visible);
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      exportPreview() {
        const stage = stageRef.current;
        const printableArea = printableAreaRef.current;

        if (!stage) {
          return null;
        }

        const previousPrintableAreaVisibility =
          printableArea?.visible() ?? false;

        const transformerStates = hideEditorControls();

        printableArea?.visible(false);

        stage.batchDraw();

        try {
          return stage.toDataURL({
            x: 0,
            y: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            pixelRatio: 2,
            mimeType: "image/png",
            quality: 1,
          });
        } finally {
          printableArea?.visible(previousPrintableAreaVisibility);

          restoreEditorControls(transformerStates);

          stage.batchDraw();
        }
      },

      exportPrintFile() {
        const designLayer = designLayerRef.current;

        if (!designLayer) {
          return null;
        }

        const transformerStates = hideEditorControls();

        designLayer.batchDraw();

        try {
          /*
           * Exports only the printable area.
           * No T-shirt image, no gray background,
           * no printable border and no transformer.
           *
           * The exported PNG keeps transparency.
           */
          return designLayer.toDataURL({
            x: PRINT_AREA.x,
            y: PRINT_AREA.y,
            width: PRINT_AREA.width,
            height: PRINT_AREA.height,
            pixelRatio: 3,
            mimeType: "image/png",
            quality: 1,
          });
        } finally {
          restoreEditorControls(transformerStates);

          designLayer.batchDraw();
        }
      },
    }),
    [],
  );

  const sortedElements = [...elements].sort(
    (first, second) => first.zIndex - second.zIndex,
  );

  const clearSelection = (event) => {
    const target = event.target;

    const clickedEmptyArea =
      target === target.getStage() ||
      target.name() === "background" ||
      target.name() === "tshirt-image" ||
      target.name() === "print-area";

    if (clickedEmptyArea) {
      onSelectElement(null);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="customizer-canvas mx-auto w-full max-w-[600px] overflow-hidden"
    >
      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH * scale}
        height={CANVAS_HEIGHT * scale}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={clearSelection}
        onTouchStart={clearSelection}
        className="overflow-hidden bg-neutral-100"
      >
        <Layer ref={backgroundLayerRef}>
          <Rect
            name="background"
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="#f5f5f5"
          />

          <KonvaImage
            name="tshirt-image"
            image={tshirtImage}
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            listening
          />

          <Rect
            ref={printableAreaRef}
            name="print-area"
            x={PRINT_AREA.x}
            y={PRINT_AREA.y}
            width={PRINT_AREA.width}
            height={PRINT_AREA.height}
            stroke="#111111"
            strokeWidth={1}
            dash={[7, 7]}
            opacity={previewMode ? 0 : 0.35}
            listening
          />
        </Layer>

        <Layer ref={designLayerRef}>
          <Group name="design-group">
            {sortedElements.map((element) =>
              element.type === "image" ? (
                <CanvasImageElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElementId === element.id}
                  previewMode={previewMode}
                  onSelect={onSelectElement}
                  onChange={onUpdateElement}
                />
              ) : (
                <CanvasTextElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElementId === element.id}
                  previewMode={previewMode}
                  onSelect={onSelectElement}
                  onChange={onUpdateElement}
                />
              ),
            )}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
});

export default TshirtCanvas;
