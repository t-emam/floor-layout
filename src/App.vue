<script setup>
import Konva from "konva";
import {nextTick, ref, useTemplateRef} from 'vue';
import {onMounted} from 'vue';
import {
  Circle,
  LayoutTemplateIcon,
  Square,
  SquareDashed,
} from 'lucide-vue-next';
import Shape from './components/Shape.vue';
import FloorSection from './components/Section.vue';

const configKonva = {
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true,
};
const tempShape = ref(null)
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
    number_of_seats: 2,
  },
  {
    id: '33',
    text: '33',
    active: true,
    width: 150,
    height: 150,
    x: 950,
    y: 300,
    shape: 'circle',
    type: 'table',
    number_of_seats: 8,
  },
  // {
  //   id: '3',
  //   text: 'Indoor',
  //   x: 400,
  //   y: 250,
  //   width: 400,
  //   height: 400,
  //   shape: 'section',
  // },
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
  {
    "type": "table",
    "shape": "rectangle",
    "id": "SECTION_1_TABLE_UUID_1",
    "text": "Table 1 A",
    "number_of_seats": 1,
    "height": 160,
    "width": 160,
    "x": 1110,
    "y": 10,
    "rotation": 0,
    "revenue_center": null
  },
  {
    "type": "table",
    "shape": "rectangle",
    "id": "SECTION_1_TABLE_UUID_2",
    "text": "Table 22",
    "number_of_seats": 10,
    "height": 160,
    "width": 160,
    "x": 1392,
    "y": 10,
    "rotation": 0,
    "revenue_center": null
  },
  {
    "type": "table",
    "shape": "circle",
    "id": "SECTION_1_TABLE_UUID_3",
    "text": "Table 3",
    "number_of_seats": 5,
    "height": 200,
    "width": 200,
    "x": 130,
    "y": 340,
    "rotation": 0,
    "revenue_center": null
  },
  {
    "type": "label",
    "shape": "label",
    "id": "SECTION_1_LABEL_UUID_1",
    "text": "Fountain",
    "height": 200,
    "width": 110,
    "x": 280,
    "y": 200,
    "rotation": 0,
    "bg_color": "#3e8ef6"
  },
  {
    "type": "barrier",
    "shape": "barrier",
    "id": "SECTION_1_BARRIER_UUID_1",
    "height": 200,
    "width": 10,
    "x": 260,
    "y": 200,
    "rotation": 0,
    "bg_color": "#51e607"
  },
  {
    "type": "barrier",
    "shape": "barrier",
    "id": "SECTION_1_BARRIER_UUID_2",
    "height": 10,
    "width": 110,
    "x": 280,
    "y": 410,
    "rotation": 0,
    "bg_color": "#f4c121"
  },
  {
    "type": "table",
    "shape": "rectangle",
    "id": "SECTION_1_TABLE_UUID_5",
    "text": "Table 5",
    "number_of_seats": 8,
    "height": 110,
    "width": 320,
    "x": 10,
    "y": 530,
    "rotation": 0,
    "revenue_center": null
  },
  {
    "type": "label",
    "shape": "label",
    "id": "LABEL_UUID_1",
    "text": "Pool",
    "height": 460,
    "width": 300,
    "x": 1073,
    "y": 300,
    "rotation": 0,
    "bg_color": "#91a6ff"
  },
  {
    "type": "label",
    "id": "LABEL_UUID_2",
    "shape": "label",
    "text": "Entrance",
    "height": 155,
    "width": 300,
    "x": 630,
    "y": 600,
    "rotation": 0,
    "bg_color": "#f48f41"
  },
  {
    "type": "table",
    "shape": "rectangle",
    "id": "SECTION_2_TABLE_UUID_1",
    "text": "Table 1",
    "number_of_seats": 4,
    "height": 220,
    "width": 150,
    "x": 10,
    "y": 10,
    "rotation": 0,
    "revenue_center": null
  },

  {
    "type": "table",
    "shape": "rectangle",
    "id": "SECTION_2_TABLE_UUID_3_x",
    "text": "Table 6",
    "number_of_seats": 6,
    "height": 120,
    "width": 330,
    "x": 200,
    "y": 10,
    "rotation": 0,
    "revenue_center": null
  },

  {
    "type": "table",
    "shape": "rectangle",
    "id": "SECTION_2_TABLE_UUID_3_y",
    "text": "Table 41",
    "number_of_seats": 6,
    "height": 320,
    "width": 120,
    "x": 710,
    "y": 190,
    "rotation": 0,
    "revenue_center": null
  },

  {
    "type": "table",
    "shape": "circle",
    "id": "SECTION_2_TABLE_UUID_2",
    "text": "Table 2",
    "number_of_seats": 4,
    "height": 200,
    "width": 200,
    "x": 1615,
    "y": 300,
    "rotation": 0,
    "revenue_center": null
  },
  {
    "type": "label",
    "shape": "label",
    "id": "SECTION_2_LABEL_UUID_1",
    "text": "TV Area",
    "height": 80,
    "width": 260,
    "x": 480,
    "y": 330,
    "rotation": 90,
    "bg_color": "#c6c6c6"
  },
  {
    "type": "barrier",
    "shape": "barrier",
    "id": "SECTION_2_BARRIER_UUID_1",
    "height": 10,
    "width": 440,
    "x": 50,
    "y": 640,
    "bg_color": "#373636",
    "rotation": 0
  }
]);

const stageEl = useTemplateRef('stage-el');
const layerEl = useTemplateRef('layer-el');
const itemRefs = useTemplateRef('items');
const transformer = useTemplateRef('transformer');
const selectedShape = ref(null);
const dragAction = ref(null);

/**
 * Find overlapping case
 * @param event
 * @returns {*|null}
 */
const hasIntersection = (event) => {
  const shape = event.target
  if (!shape) {
    return null
  }

  const shapes = itemRefs.value
      .map((element) => element.table())
      .filter(table => table.id() !== shape.id())

  const overlappingShape = shapes
      .find(table => Konva.Util.haveIntersection(shape.getClientRect(), table.getClientRect(shape)))

  if (!overlappingShape) {
    return null
  }

  console.log('overlappingShape is', overlappingShape.getAttrs())

  document.body.style.cursor = 'not-allowed';
  setTimeout(() => document.body.style.cursor = 'auto', 2000)
  return overlappingShape
}

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
      const isOverlappingItem = itemRefs.value.find(table =>
          Konva.Util.haveIntersection(newItem, table.nodeRef.getNode().getClientRect(newItem))
      )
      if (isOverlappingItem) {
        document.body.style.cursor = 'not-allowed';
        setTimeout(() => {
          document.body.style.cursor = 'auto';
        }, 2000)
      }

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
  console.log('newItem', newItem, existingItems)
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

async function handleTransformStart(e, shape) {
  setShapeTemp(shape);
}

async function handleTransformEnd(e) {
  const shape = tables.value.find((r) => r.id === selectedShape.value.id);

  shape.x = e.target.x();
  shape.y = e.target.y();

  shape.width = Math.max(
      e.target.width() * e.target.scaleX(), 1
  );
  shape.height = Math.max(
      e.target.height() * e.target.scaleY(), 1
  );
  // reset scale to 1
  e.target.scaleX(1);
  e.target.scaleY(1);

  updateTransformer(true);
  checkOverlappingAndResetItem(e)

}

const setShapeTemp = (shape) => {
  tempShape.value = null
  if (shape) {
    tempShape.value = Object.assign({}, shape);
  }

}

function handleDragStart(e, shape) {
  setShapeTemp(shape);
  // Store the initial position before the drag starts
  // dragAction.value = {
  //   ...dragAction.value,
  //   id: shape.id,
  //   initialX: shape.x,
  //   initialY: shape.y,
  // };
}

function onDragItem(type) {
  let attrs = {
    id: tables.value.length + 1 + '',
    text: type === 'label' ? 'Label' : tables.value.length + 1 + '',
    shape: type,
  };
  if (type === 'circle' || type === 'rectangle' || type === 'label') {
    attrs = {...attrs, width: 50, height: 50, shape:type,number_of_seats:4};
  } else if (type === 'barrier') {
    attrs = {...attrs, width: 100, height: 7, text: null};
  } else if (type === 'section') {
    attrs = {
      ...attrs,
      width: 200,
      height: 200,
      text:
          'Section ' +
          (tables.value.filter((shape) => shape.shape === 'section').length + 1),
    };
  }
  dragAction.value = attrs;
}

function onDropItem(event, shape) {
  shape.x = event.target.x();
  shape.y = event.target.y();
  checkOverlappingAndResetItem(event)
}

const checkOverlappingAndResetItem = (event) => {
  nextTick(()=>{
    const overlapping = hasIntersection(event);
    if (!!overlapping && tempShape.value?.id === event.target.id()) {

      console.log('overlapping', !!overlapping, tempShape.value);

      const config = tables.value.find((r) => r.id === event.target.id());
      config.x = tempShape.value.x;
      config.y = tempShape.value.y;
      config.width = tempShape.value.width;
      config.height = tempShape.value.height;
      // config.rotation = tempShape.value.rotation;

      event.target.setAttrs({
        ...event.target.getAttrs(),
        ...config,
      })

      if (config.rotation) {
        event.target.rotation(config.rotation)
      }

      console.log('event.target', event.target.getAttrs());
      stageEl.value.getNode().draw()
    }

    if (!!overlapping && !tempShape.value?.id) {
      event.target.destroy();
    }

    tempShape.value = null
    updateTransformer(true);
  })
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

  stage.scale({x: newScale, y: newScale});

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
          @dragstart="onDragItem('section')"
      >
        <LayoutTemplateIcon size="32"/>
      </button>
      <button
          class="p-1 hover:bg-violet-100 rounded"
          draggable="true"
          @dragstart="onDragItem('rectangle')"
      >
        <Square size="32"/>
      </button>
      <button
          class="p-1 hover:bg-violet-100 rounded"
          draggable="true"
          @dragstart="onDragItem('circle')"
      >
        <Circle size="32"/>
      </button>
      <button
          class="p-1 hover:bg-violet-100 rounded"
          draggable="true"
          @dragstart="onDragItem('label')"
      >
        <SquareDashed size="32"/>
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
          +
        </button
        >
        <button
            class="px-2 border-y border-e"
            @click="selectedShape.width -= 5"
        >
          -
        </button>
      </label
      >
      <label
      >Height
        <button
            class="px-2 border-y border-x"
            @click="selectedShape.height += 5"
        >
          +
        </button
        >
        <button
            class="px-2 border-y border-e"
            @click="selectedShape.height -= 5"
        >
          -
        </button>
      </label
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
            @transformstart="handleTransformStart"
            @transformend="handleTransformEnd"
            @dragend="onDropItem"
            @click="selectedShape = $event"
        />
        <Shape
            v-else
            ref="items"
            :config="table"
            :selected="selectedShape?.id === table.id"
            @transformstart="handleTransformStart"
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