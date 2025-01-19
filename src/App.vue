<script setup>
import { ref, useTemplateRef } from 'vue';
import { onMounted } from 'vue';
import { Circle, Diamond, Square, SquareDashed } from 'lucide-vue-next';
import Shape from './components/Shape.vue';

const configKonva = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const tables = ref([
  {
    id: '1',
    text: '1',
    height: 50,
    width: 50,
    x: 100,
    y: 100,
    shape: 'rectangle',
    type: 'table',
    table_id: '',
    number_of_seats: 4,
  },
  {
    id: '2',
    text: '2',
    active: true,
    radius: 25,
    x: 100,
    y: 100,
    shape: 'circle',
  },
  {
    id: '3',
    text: '3',
    x: 400,
    y: 400,
    radius: 25,
    shape: 'polygon',
  },
  {
    id: '4',
    text: 'Label',
    height: 50,
    width: 50,
    x: 500,
    y: 400,
    shape: 'label',
  },
  {
    id: '5',
    height: 25,
    width: 100,
    x: 500,
    y: 200,
    shape: 'barrier',
  },
]);

const stageEl = useTemplateRef('stage-el');
const layerEl = useTemplateRef('layer-el');
const transformer = useTemplateRef('transformer');
const selectedShape = ref(null);
const dragAction = ref(null);

onMounted(() => {
  const stageNode = stageEl.value.getNode();
  const con = stageNode.container();

  con.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  con.addEventListener('drop', (e) => {
    e.preventDefault();
    stageNode.setPointersPositions(e);
    tables.value.push({
      ...dragAction.value,
      ...stageNode.getPointerPosition(e),
    });
    dragAction.value = null;
  });
});

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

function updateTransformer() {
  const transformerNode = transformer.value.getNode();
  const stage = transformerNode.getStage();

  const selectedNode = stage.findOne('.' + selectedShape.value?.id);
  // do nothing if selected node is already attached
  if (selectedNode === transformerNode.node()) {
    return;
  }

  if (selectedNode) {
    // attach to another node
    transformerNode.nodes([selectedNode]);
  } else {
    // remove transformer
    transformerNode.nodes([]);
  }
}

function handleTransformEnd(e) {
  const shape = tables.value.find((r) => r.id === selectedShape.value.id);

  shape.x = e.target.x();
  shape.y = e.target.y();
  shape.rotation = e.target.rotation();
  shape.scaleX = e.target.scaleX();
  shape.scaleY = e.target.scaleY();
}

function onDragItem(type) {
  let attrs = {
    id: tables.value.length + 1 + '',
    text: type === 'label' ? 'Label' : tables.value.length + 1 + '',
    shape: type,
  };
  if (type !== 'rectangle' && type !== 'label' && type !== 'barrier') {
    attrs = { ...attrs, radius: 25 };
  } else if (type === 'rectangle' || type === 'label') {
    attrs = { ...attrs, width: 50, height: 50 };
  } else if (type === 'barrier') {
    attrs = { ...attrs, width: 100, height: 25 };
  }
  dragAction.value = attrs;
}

// function onZoom(e) {
//   e.evt.preventDefault();
//   console.log(stageEl);
//   const oldScale = stageEl.value.scaleX();
//   const pointer = stageEl.value.getPointerPosition();

//   const mousePointTo = {
//     x: (pointer.x - stageEl.value.x()) / oldScale,
//     y: (pointer.y - stageEl.value.y()) / oldScale,
//   };

//   // how to scale? Zoom in? Or zoom out?
//   let direction = e.evt.deltaY > 0 ? 1 : -1;

//   // when we zoom on trackpad, e.evt.ctrlKey is true
//   // in that case lets revert direction
//   if (e.evt.ctrlKey) {
//     direction = -direction;
//   }
//   const scaleBy = 1.1;
//   const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

//   stageEl.value.scale({ x: newScale, y: newScale });

//   const newPos = {
//     x: pointer.x - mousePointTo.x * newScale,
//     y: pointer.y - mousePointTo.y * newScale,
//   };
//   stageEl.value.position(newPos);
// }
</script>

<template>
  <div class="absolute top-0 z-10 w-full py-2">
    <div
      class="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg"
    >
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
        @dragstart="onDragItem('polygon')"
      >
        <Diamond size="32" />
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
      <label
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
      >
      <template v-else>
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
      </template>
    </div>
  </div>
  <v-stage
    :config="configKonva"
    ref="stage-el"
    @mousedown="handleStageMouseDown"
    @touchstart="handleStageMouseDown"
  >
    <v-layer ref="layer-el">
      <Shape
        v-for="table of tables"
        :key="table.id"
        :config="table"
        :selected="selectedShape?.id === table.id"
        @transformend="handleTransformEnd"
        @dragend="handleTransformEnd"
        @click="
          selectedShape = $event;
          console.log(selectedShape);
        "
      />
      <v-transformer ref="transformer" />
    </v-layer>
  </v-stage>
</template>
