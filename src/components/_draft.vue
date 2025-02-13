<script setup>
/**
 * Temporarily commented out the following functions until a new ticket is available
 * for Validation and Overlapping Business details:
 *
 * - hasOverlapping<Function>
 * - destroyShape<Function>
 * - onDragEnd<Function>
 * - resetElement<Function>
 * - cloneShape<Function>
 */
import Barrier from '@/Components/tableLayout/Elements/Barrier.vue';
import Shape from '@/Components/tableLayout/Elements/Shape.vue';
import ShapesDrawer from '@/Components/tableLayout/ShapesDrawer.vue';
import Zoom from './Zoom.vue';
import Konva from 'konva';
import { ref, computed, nextTick } from 'vue';

const stageRef = ref(null);
const layerRef = ref(null);
const shapesRef = ref(null);
// const tempShape = ref(null);
const selectedElement = ref(null);
const transformRef = ref(null);
const enabledAnchors = ref(null);
const gridSize = ref('15px');
const config = computed(() => {
  return {
    width: window.innerWidth - 320,
    height: window.innerHeight - 80,
    draggable: true,
  };
});

const list = ref([]);

/**
 * All Available Shapes in layer
 */
const layerElements = computed(() =>
    shapesRef.value.map((element) => element.shape())
);

/**
 * Check if the Shape has intersection with another shape in the editor
 * @param shape
 * @returns {*|null}
 */
// const hasOverlapping = (shape) => {
//   if (!shape) {
//     return null;
//   }
//
//   // Get the intersection elements
//   const overlappingShape = layerElements.value
//     .filter((element) => element.id() !== shape.id())
//     .find((element) =>
//       Util.haveIntersection(
//         shape.getClientRect(),
//         element.getClientRect({ relativeTo: shape })
//       )
//     );
//
//   // Does not have intersections with other elements
//   if (!overlappingShape) {
//     return null;
//   }
//
//   // Show the cursor as not allowed for 2 seconds
//   document.body.style.cursor = 'not-allowed';
//   setTimeout(() => (document.body.style.cursor = 'auto'), 2000);
//   return overlappingShape;
// };

// /**
//  * Check if the Shape has intersection with another shape in the editor
//  * @param shape
//  * @returns {*|null}
//  */
// const hasOverlapping = (shape) => {
//   if (!shape) {
//     return null;
//   }
//
//   // Get the intersection elements
//   const overlappingShape = layerElements.value
//     .filter((element) => element.id() !== shape.id())
//     .find((element) =>
//       Konva.Util.haveIntersection(
//         shape.getClientRect(),
//         element.getClientRect({ relativeTo: shape })
//       )
//     );
//
//   // Does not have intersections with other elements
//   if (!overlappingShape) {
//     return null;
//   }
//
//   // Show the cursor as not allowed for 2 seconds
//   document.body.style.cursor = 'not-allowed';
//   setTimeout(() => (document.body.style.cursor = 'auto'), 2000);
//   return overlappingShape;
// };

// /**
//  * Destroy Shape Element from list and Stage
//  * @param shape
//  */
// const destroyShape = (shape) => {
//   const index = list.value.findIndex((element) => element.id === shape.id());
//   shape.destroy();
//   list.value.splice(index, 1);
// };

/**
 * On Drag Item from the Left Side Menu
 * @param event
 * @param item
 */
const onDragItem = ({ event, item }) => {
  event.preventDefault();
  const stageNode = stageRef.value.getNode();
  stageNode.setPointersPositions(event);
  const pointerPosition = stageNode.getPointerPosition(event);
  const stagePosition = stageNode.position();
  const spaceWidth = item.shape === 'rect' ? item.width / 2 : 0;
  const spaceHeight = item.shape === 'rect' ? item.height / 2 : 0;
  const text = item.type === 'table' ? `${1 + list.value.length}` : item.type;
  list.value.push({
    ...item,
    text,
    x: (pointerPosition.x - stagePosition.x) / stageNode.scaleX() - spaceWidth,
    y: (pointerPosition.y - stagePosition.y) / stageNode.scaleY() - spaceHeight,
  });

  // TODO: Skip Check Overlapping
  // nextTick(() => {
  //   const shape = layerElements.value.find(
  //     (element) => element.id() === item.id
  //   );
  //
  //   if (hasOverlapping(shape)) {
  //     return destroyShape(shape);
  //   }
  // });
};

/**
 * Handle on drag Start & transform start (Save clone of element before drag Temporary)
 * @param event
 */
// const cloneShape = (event) => {
//   tempShape.value = event.target.clone();
// };

/**
 * Handle on Drag End (Reset Shape in Case Overlapping)
 * @param event
 */
// const onDragEnd = (event) => {
//   if (hasOverlapping(event.target)) {
//     // Role-::-Reset shape position in case overlapping other element-::-
//     event.target.setAttrs(tempShape.value.getAttrs());
//     tempShape.value = null;
//   }
// };

/**
 * Handle on MouseDown (Transform Selected Shape)
 * @param event
 */
const onMouseDown = (event) => {
  if (event.target === event.target.getStage()) {
    selectedElement.value = null;
    setupTransform(true);
    return;
  }

  const parent = event.target.getParent();
  if (parent instanceof Konva.Transformer) {
    return;
  }

  // event.target.attrs?.type === 'barrier' ? event.target.id() : parent.id();
  const elementId = parent?.id() || event.target.id();
  selectedElement.value = layerElements.value.find(
      (element) => element.id() === elementId
  );
  setupEnabledAnchors();
  setupTransform();
};

/**
 * Set up the Transform Shape Anchors
 */
const setupEnabledAnchors = () => {
  enabledAnchors.value = null;
  selectedElement.value.moveToTop();
  if (selectedElement.value?.getAttr('shape') === 'circle') {
    enabledAnchors.value = [
      'top-left',
      'bottom-right',
      'bottom-left',
      'top-right',
    ];
  }
};

/**
 * Setup Transform
 * @param force
 */
const setupTransform = (force = false) => {
  const transformNode = transformRef.value.getNode();

  if (!selectedElement.value || !!force) {
    transformNode.nodes([]);
    return;
  }

  if (selectedElement.value === transformNode.node() && !force) {
    return;
  }

  nextTick(() => {
    transformNode.nodes([selectedElement.value]);
    selectedElement.value.moveToTop();
  });
};

/**
 * Handle on transform end (Update Element)
 * @param event
 */
const onTransformEnd = (event) => {
  if (!selectedElement.value) return;

  const shape = list.value.find(
      (item) => item.id === selectedElement.value.id()
  );

  shape.x = event.target.x();
  shape.y = event.target.y();
  shape.rotation = event.target.rotation();

  shape.width = Math.max(event.target.width() * event.target.scaleX(), 1);
  shape.height = Math.max(event.target.height() * event.target.scaleY(), 1);

  event.target.scaleX(1);
  event.target.scaleY(1);
  setupTransform(true);

  // TODO: Skip Check Overlapping
  // nextTick(() => {
  //   if (hasOverlapping(event.target)) {
  //     // Role-::-Reset shape position in case overlapping other element-::-
  //     return resetElement(event.target.id());
  //   }
  // });
};

// /**
//  * Reset Element & Shape onDemand!
//  * @param id
//  */
// const resetElement = (id) => {
//   if (!id) return;
//
//   const shape = list.value.find((item) => item.id === id);
//   const element = layerElements.value.find((element) => element.id() === id);
//
//   element.setAttrs(tempShape.value.getAttrs());
//   shape.x = element.x();
//   shape.y = element.y();
//   shape.width = element.width();
//   shape.height = element.height();
//   shape.rotation = element.rotation();
//
//   return nextTick(() => {
//     tempShape.value = null;
//   });
// };

/**
 * Transform Resize Handler
 * @param oldBoundBox
 * @param newBoundBox
 * @returns {*}
 */
const boundBoxFunc = (oldBoundBox, newBoundBox) => {
  let MIN_WIDTH = 30;
  let MIN_HEIGHT = 30;

  const attrs = selectedElement.value?.attrs;
  if (attrs?.type === 'barrier') {
    MIN_HEIGHT = 5;
  }

  if (
      Math.abs(newBoundBox.width) <= MIN_WIDTH ||
      Math.abs(newBoundBox.height) <= MIN_HEIGHT
  )
    return oldBoundBox;

  return newBoundBox;
};
/**
 * Update the Stage Zoom
 * @param zoom
 */
const updateStageZoom = (zoom = 100) => {
  const stage = stageRef.value.getNode();
  const scale = zoom / 100;
  gridSize.value = `${15 + Math.floor(Math.abs(zoom - 100) / 25)}px`;
  stage.scale({ x: scale, y: scale });

  if (stage.getPointerPosition()) {
    const pointer = stage.getPointerPosition();
    const oldScale = stage.scaleX();
    stage.setPointersPositions({
      x: pointer.x - (pointer.x * scale) / oldScale,
      y: pointer.y - (pointer.y * scale) / oldScale,
    });
  }
};
</script>

<template>
  <div class="relative bg-white h-full w-full grid grid-cols-[1fr_auto]">
    <div id="editor" class="konva-editor" @dragover.prevent>
      <div class="h-full">
        <v-stage ref="stageRef" :config="config" @mousedown="onMouseDown">
          <v-layer ref="layerRef">
            <template v-for="(item, index) in list" :key="`group-${index}`">
              <component
                  :is="item.type !== 'barrier' ? Shape : Barrier"
                  ref="shapesRef"
                  :config="item"
                  @transformend="onTransformEnd"
              />
            </template>
            <v-transformer
                ref="transformRef"
                :config="{
                rotateLineVisible: true,
                rotateEnabled: false,
                centeredScaling: true,
                resizeEnabled: true,
                padding: 5,
                // rotationSnaps: [0, 90, 180, 270],
                boundBoxFunc,
                enabledAnchors,
              }"
            />
          </v-layer>
        </v-stage>
        <Zoom @zoom="updateStageZoom" />
      </div>
      <div
          v-if="!list.length"
          class="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
      >
        <span class="text-md font-medium text-gray-500 select-none">
          {{ __('No sections available yet. Create your first one!') }}
        </span>
      </div>
    </div>

    <div class="w-auto">
      <ShapesDrawer @drag-item="onDragItem" />
    </div>
  </div>
</template>

<style>
.konva-editor {
  background: linear-gradient(to right, #f4f4f4 0.1px, transparent 0.1px) 0 0,
  linear-gradient(to bottom, #f4f4f4 0.1px, transparent 0.1px) 0 0;
  background-size: 5px 5px;
  @apply bg-white w-full h-full relative;
}
.konvajs-content {
  background: linear-gradient(to right, #f4f4f4 1px, transparent 1px) 0 0,
  linear-gradient(to bottom, #f4f4f4 1px, transparent 1px) 0 0;
  background-size: v-bind(gridSize) v-bind(gridSize);
  @apply cursor-pointer w-full h-full relative;
}
</style>
