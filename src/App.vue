<script setup>
import { nextTick, ref, useTemplateRef } from 'vue';
import { onMounted } from 'vue';
import {
  Circle,
  LayoutTemplateIcon,
  Square,
  SquareDashed,
  AppWindowMac,
} from 'lucide-vue-next';
import {useSectionGroup} from './composable/useSectionGroup.js';
import Shape from './components/Shape.vue';
import FloorSection from './components/Section.vue';
const {buildSection, checkOverlapping, sectionsList} = useSectionGroup();

const configKonva = {
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true,
};

const tables = ref([
  {
    id: '1',
    text: '1',
    height: 50,
    width: 50,
    x: 500,
    y: 300,
    shape: 'rectangle',
    type: 'table',
    table_id: '',
    number_of_seats: 4,
  },
  {
    id: '2',
    text: '2',
    active: true,
    width: 50,
    height: 50,
    x: 450,
    y: 300,
    shape: 'circle',
    type: 'table',
    number_of_seats: 8,
  },
  {
    id: '3',
    text: 'Indoor',
    x: 400,
    y: 250,
    width: 400,
    height: 400,
    shape: 'section',
  },
  {
    id: '4',
    text: 'Label',
    height: 100,
    width: 100,
    x: 500,
    y: 400,
    shape: 'label',
  },
  {
    id: '5',
    height: 7,
    width: 200,
    x: 500,
    y: 200,
    shape: 'barrier',
  },
]);

const stageEl = useTemplateRef('stage-el');
const layerEl = useTemplateRef('layer-el');
const itemRefs = useTemplateRef('items');
const transformer = useTemplateRef('transformer');
const selectedShape = ref(null);
const dragAction = ref(null);

onMounted(() => {
  const stageNode = stageEl.value.getNode();
  const con = stageNode.container();

  con.addEventListener('dragover', (e) => {
    e.preventDefault();
    stageNode.setPointersPositions(e);

    const pointerPosition = stageNode.getPointerPosition(e);
    if (pointerPosition) {
      const scaleX = stageNode.scaleX();
      const scaleY = stageNode.scaleY();
      const stagePosition = stageNode.position();

      const adjustedPosition = {
        x: (pointerPosition.x - stagePosition.x) / scaleX,
        y: (pointerPosition.y - stagePosition.y) / scaleY,
      };

      const newItem = {
        ...dragAction.value,
        ...adjustedPosition,
      };

      // Check for overlap
      const isOverlappingItem = isOverlapping(newItem, tables.value);
      // Change cursor
      const container = stageNode.container();
      container.style.cursor = isOverlappingItem ? 'not-allowed' : 'default';
    }
  });
  con.addEventListener('drop', (e) => {
    e.preventDefault();
    stageNode.setPointersPositions(e);

    const pointerPosition = stageNode.getPointerPosition(e);

    if (pointerPosition) {
      const scaleX = stageNode.scaleX();
      const scaleY = stageNode.scaleY();
      const stagePosition = stageNode.position();

      const adjustedPosition = {
        x: (pointerPosition.x - stagePosition.x) / scaleX,
        y: (pointerPosition.y - stagePosition.y) / scaleY,
      };

      const newItem = {
        ...dragAction.value,
        ...adjustedPosition,
      };

      // Check for overlaps before adding
      if (!isOverlapping(newItem, tables.value)) {
        tables.value.push(newItem);
        dragAction.value = null;
      } else {
        console.warn(
          'The item overlaps with an existing shape and cannot be placed.'
        );
      }
    }

    con.style.cursor = 'default';
  });
  con.addEventListener('dragleave', () => {
    // Reset cursor when leaving the canvas area
    con.style.cursor = 'default';
  });
});

function isOverlapping(newItem, existingItems) {
  return;
  return existingItems.some((item) => {
    // Calculate bounding boxes for new and existing items
    const newItemBounds = {
      left: newItem.x,
      right: newItem.x + newItem.width,
      top: newItem.y,
      bottom: newItem.y + newItem.height,
    };

    const existingItemBounds = {
      left: item.x,
      right: item.x + item.width,
      top: item.y,
      bottom: item.y + item.height,
    };

    // Check if bounding boxes overlap
    const isOverlappingHorizontally =
      newItemBounds.left < existingItemBounds.right &&
      newItemBounds.right > existingItemBounds.left;
    const isOverlappingVertically =
      newItemBounds.top < existingItemBounds.bottom &&
      newItemBounds.bottom > existingItemBounds.top;

    return isOverlappingHorizontally && isOverlappingVertically;
  });
}

function handleStageMouseDown(e) {
  // clicked on stage - clear selection
  if (e.target === e.target.getStage()) {
    selectedShape.value = null;
    updateTransformer();
    return;
  }

  // clicked on transformer - do nothing
  const clickedOnTransformer = e.target.getParent().className === 'Transformer';
  if (clickedOnTransformer) {
    return;
  }

  // find clicked rect by its name
  const id = e.target.id();
  const shape = tables.value.find((r) => r.id === id);

  if (shape) {
    selectedShape.value = shape;
  } else {
    selectedShape.value = null;
  }
  updateTransformer();
}

function updateTransformer(force = false) {
  const transformerNode = transformer.value.getNode();

  if (!selectedShape.value) {
    transformerNode.nodes([]);
    return;
  }
  const tableIndex = tables.value.findIndex(
    (tabel) => tabel.id === selectedShape.value?.id
  );
  const selectedNode = itemRefs.value[tableIndex].nodeRef.getNode();

  // do nothing if selected node is already attached
  if (selectedNode === transformerNode.node() && !force) {
    return;
  }

  if (force) {
    transformerNode.nodes([]);
  }

  if (selectedNode) {
    // attach to another node
    nextTick(() => transformerNode.nodes([selectedNode]));
  } else {
    // remove transformer
    transformerNode.nodes([]);
  }
}

async function handleTransformEnd(e) {
  const shape = tables.value.find((r) => r.id === selectedShape.value.id);

  shape.x = e.target.x();
  shape.y = e.target.y();

  shape.width = Math.max(
    e.target.width() * e.target.scaleX(),
    shape.shape === 'barrier' ? 1 : 30
  );
  shape.height = Math.max(
    e.target.height() * e.target.scaleY(),
    shape.shape === 'barrier' ? 1 : 30
  );
  // reset scale to 1
  e.target.scaleX(1);
  e.target.scaleY(1);

  updateTransformer(true);
}

function handleDragStart(e, shape) {
  // Store the initial position before the drag starts
  // dragAction.value = {
  //   ...dragAction.value,
  //   id: shape.id,
  //   initialX: shape.x,
  //   initialY: shape.y,
  // };
}

function onDragItem(type, event) {
  if(type==='floor_section') {
    return nextTick(() => {
      const section = buildSection(event)
      layerEl.value.getNode().add(section);
      layerEl.value.getNode().batchDraw();

      checkOverlapping(event, section, ()=> {
        section.getStage().container().style.cursor = 'auto';
        const index = sectionsList.value.findIndex(item=>item.attrs.id ===section.attrs.id);
        sectionsList.value.splice(index, 1);
        section.remove()
      })
    })
  }
  let attrs = {
    id: tables.value.length + 1 + '',
    text: type === 'label' ? 'Label' : tables.value.length + 1 + '',
    shape: type,
  };
  if(type === 'circle' || type === 'rectangle'){
    attrs.name = 'table'
  }
  if (type === 'circle' || type === 'rectangle' || type === 'label') {
    attrs = { ...attrs, width: 50, height: 50 };
  } else if (type === 'barrier') {
    attrs = { ...attrs, width: 100, height: 7, text: null };
  } else if (type === 'section') {
    attrs = {
      ...attrs,
      name: 'section',
      width: 200,
      height: 200,
      text:
        'Section ' +
        (tables.value.filter((shape) => shape.shape === 'section').length + 1),
    };
  }
  dragAction.value = attrs;
}

function onDropItem(e, shape) {
  shape.x = e.target.x();
  shape.y = e.target.y();
}

function onZoom(e) {
  e.evt.preventDefault();
  const stage = stageEl.value.getNode();
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  // how to scale? Zoom in? Or zoom out?
  let direction = e.evt.deltaY > 0 ? 1 : -1;

  // when we zoom on trackpad, e.evt.ctrlKey is true
  // in that case lets revert direction
  if (e.evt.ctrlKey) {
    direction = -direction;
  }
  const scaleBy = 1.1;
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  stage.scale({ x: newScale, y: newScale });

  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
  stage.position(newPos);
}
</script>

<template>
  <div class="absolute top-0 z-10 w-full py-2">
    <div
      class="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg"
    >
      <button
          class="p-1 hover:bg-violet-100 rounded"
          draggable="true"
          @dragend="onDragItem('floor_section', $event)"
      >
        <AppWindowMac size="32" />
      </button>

      <button
        class="p-1 hover:bg-violet-100 rounded"
        draggable="true"
        @dragstart="onDragItem('section')"
      >
        <LayoutTemplateIcon size="32" />
      </button>
      <button
        class="p-1 hover:bg-violet-100 rounded"
        draggable="true"
        @dragstart="onDragItem('rectangle')"
      >
        <Square size="32" />
      </button>
      <button
        class="p-1 hover:bg-violet-100 rounded"
        draggable="true"
        @dragstart="onDragItem('circle')"
      >
        <Circle size="32" />
      </button>
      <button
        class="p-1 hover:bg-violet-100 rounded"
        draggable="true"
        @dragstart="onDragItem('label')"
      >
        <SquareDashed size="32" />
      </button>
      <button
        class="p-1 hover:bg-violet-100 rounded h-10"
        draggable="true"
        @dragstart="onDragItem('barrier')"
      >
        <div class="h-2 w-8 bg-black"></div>
      </button>
    </div>
  </div>
  <div v-if="selectedShape" class="absolute bottom-0 z-10 w-full py-2">
    <div
      class="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg"
    >
      <input
        v-if="selectedShape.shape !== 'barrier'"
        type="text"
        v-model="selectedShape.text"
        class="rounded-md border px-2"
      />
      <!-- <label
        v-if="
          selectedShape.shape !== 'rectangle' &&
          selectedShape.shape !== 'label' &&
          selectedShape.shape !== 'barrier'
        "
        >Radius
        <button
          class="px-2 border-y border-x"
          @click="selectedShape.radius += 5"
        >
          +</button
        ><button
          class="px-2 border-y border-e"
          @click="selectedShape.radius -= 5"
        >
          -
        </button></label
      > -->
      <label
        >Width
        <button
          class="px-2 border-y border-x"
          @click="selectedShape.width += 5"
        >
          +</button
        ><button
          class="px-2 border-y border-e"
          @click="selectedShape.width -= 5"
        >
          -
        </button></label
      >
      <label
        >Height
        <button
          class="px-2 border-y border-x"
          @click="selectedShape.height += 5"
        >
          +</button
        ><button
          class="px-2 border-y border-e"
          @click="selectedShape.height -= 5"
        >
          -
        </button></label
      >
    </div>
  </div>
  <v-stage
    :config="configKonva"
    ref="stage-el"
    @mousedown="handleStageMouseDown"
    @touchstart="handleStageMouseDown"
    @wheel="onZoom"
  >
    <v-layer ref="layer-el">
      <template v-for="table of tables" :key="table.id">
        <FloorSection
          v-if="table.shape === 'section'"
          ref="items"
          :config="table"
          :selected="selectedShape?.id === table.id"
          @transformend="handleTransformEnd"
          @dragend="onDropItem"
          @click="selectedShape = $event"
        />
        <Shape
          v-else
          ref="items"
          :config="table"
          :selected="selectedShape?.id === table.id"
          @transformend="handleTransformEnd"
          @dragend="onDropItem"
          @click="selectedShape = $event"
          @dragstart="handleDragStart"
        />
      </template>
      <v-transformer
        ref="transformer"
        :config="{
          rotateEnabled: selectedShape?.shape === 'rectangle',
          centeredScaling: true,
          rotationSnaps: [0, 90, 180, 270],
          boundBoxFunc: (oldBoundBox, newBoundBox) => {
            if (
              Math.abs(newBoundBox.width) < 30 ||
              Math.abs(newBoundBox.height) < 30
            ) {
              return oldBoundBox;
            }

            return newBoundBox;
          },
        }"
      />
    </v-layer>
  </v-stage>
</template>
