<script setup>
import {useImageTable} from "./composable/useImageTable.js";
import {useCircleTable} from "./composable/useCircleTable.js";
import {useRectangleTable} from "./composable/useRectangleTable.js";
import {nextTick, onBeforeMount, ref, useTemplateRef} from 'vue';
import {onMounted} from 'vue';
import {
  Circle,
  Diamond,
  Square,
  SquareDashed,
  Grip,
  Columns4,
  CircleEllipsis,
  LayoutGrid,
  GalleryVertical,
  GalleryHorizontal
} from 'lucide-vue-next';
import Shape from './components/Shape.vue';
import Editor from './components/Editor.vue';
import Zoom from './components/Zoom.vue';
import Export from './components/Export.vue';

const {buildRectTable} = useRectangleTable();
const {buildCircleTable} = useCircleTable();
const {buildImageTable, section} = useImageTable();
const shapeList = ref([])
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
const itemRefs = useTemplateRef('items');
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

  shape.width = e.target.width() * e.target.scaleX();
  shape.height = e.target.height() * e.target.scaleY();
  // reset scale to 1
  e.target.scaleX(1);
  e.target.scaleY(1);

  updateTransformer(true);
}

function onDragItem(type, event) {
  if (type === 'table-image-8') {
    return nextTick(() => {
      const table = buildImageTable(8, event)
      shapeList.value.push(table);
      layerEl.value.getNode().add(table);
      layerEl.value.getNode().batchDraw();
    });
  }

  if (type === 'table-image-4') {
    return nextTick(() => {
      const table = buildImageTable(4, event)
      shapeList.value.push(table);
      layerEl.value.getNode().add(table);
      layerEl.value.getNode().batchDraw();
    });
  }

  if (type === 'table-image-2') {
    return nextTick(() => {
      const table = buildImageTable(2, event)
      shapeList.value.push(table);
      layerEl.value.getNode().add(table);
      layerEl.value.getNode().batchDraw();
    });
  }


  if (type === 'table') {
    return nextTick(() => {
      const table = buildRectTable(12, event)
      shapeList.value.push(table);
      layerEl.value.getNode().add(table);
      layerEl.value.getNode().batchDraw();
    });
  }

  if (type === 'table-up-side') {
    return nextTick(() => {
      const table = buildRectTable(12, event, 'UPSIDE')
      shapeList.value.push(table);
      layerEl.value.getNode().add(table);
      layerEl.value.getNode().batchDraw();
    });
  }

  if (type === 'table-circle') {
    return nextTick(() => {
      const table = buildCircleTable(5, event);
      shapeList.value.push(table);
      layerEl.value.getNode().add(table);
      layerEl.value.getNode().batchDraw();
    });
  }
  let attrs = {
    id: tables.value.length + 1 + '',
    text: type === 'label' ? 'Label' : tables.value.length + 1 + '',
    shape: type,
  };
  if (type !== 'rectangle' && type !== 'label' && type !== 'barrier') {
    attrs = {...attrs, radius: 25};
  } else if (type === 'rectangle' || type === 'label') {
    attrs = {...attrs, width: 50, height: 50};
  } else if (type === 'barrier') {
    attrs = {...attrs, width: 100, height: 25};
  }
  dragAction.value = attrs;
}

function onDropItem(e, item) {
  item.x = e.target.x();
  item.y = e.target.y();
}

function onZoom(e) {
  return
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

const updateZoom = (zoom = 100) => {
  const stage = stageEl.value.getNode();
  // const pointer = stage.getPointerPosition();
  const scale = zoom / 100;
  // const oldScale = stage.scaleX();
  stage.scale({x: scale, y: scale});
  // const newPos = {
  //   x: pointer.x - pointer.x * scale / oldScale,
  //   y: pointer.y - pointer.y * scale / oldScale,
  // };
  // stage.position(newPos);
  stage.batchDraw();
};

const handleOnBuild = (params) => {
  let table = null;
  const event = {
    x: window.innerWidth/ 2,
    y: window.innerHeight / 2,
  }
  if (params.shape === 'circle') {
    table = buildCircleTable(params.size, event, params.width, params.height);
  } else {
    table = buildRectTable(params.size, event, params.shape === 'rectangle_upside' ? 'UPSIDE' : null, params.width, params.height)
  }

  return nextTick(() => {
    shapeList.value.push(table);
    layerEl.value.getNode().add(table);
    layerEl.value.getNode().batchDraw();
  });

}
</script>

<template>
  <div class="stage-container" id="stageContainer">
    <Editor @build="handleOnBuild"/>

    <div class="flex gap-4 absolute start-4 bottom-2">
       <Zoom @zoom="updateZoom"/>
       <Export :layer="layerEl" />
    </div>
    <div class="absolute top-0 z-10 w-full py-2">
      <div
          class="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg z-1 bg-white"
      >
        <button
            class="p-1 hover:bg-violet-100 rounded"
            draggable="true"
            @dragend="(event)=>onDragItem('table-image-8', event)"
        >
          <Columns4 size="32"/>
        </button>

        <button
            class="p-1 hover:bg-violet-100 rounded"
            draggable="true"
            @dragend="(event)=>onDragItem('table-image-4', event)"
        >
          <LayoutGrid size="32"/>
        </button>

        <button
            class="p-1 hover:bg-violet-100 rounded"
            draggable="true"
            @dragend="(event)=>onDragItem('table-image-2', event)"
        >
          <GalleryVertical size="32"/>
        </button>

        <button
            class="p-1 hover:bg-violet-100 rounded"
            draggable="true"
            @dragend="(event)=>onDragItem('table', event)"
        >
          <Grip size="32"/>
        </button>

        <button
            class="p-1 hover:bg-violet-100 rounded"
            draggable="true"
            @dragend="(event)=>onDragItem('table-up-side', event)"
        >
          <GalleryHorizontal size="32"/>
        </button>

        <button
            class="p-1 hover:bg-violet-100 rounded"
            draggable="true"
            @dragend="(event)=>onDragItem('table-circle', event)"
        >
          <CircleEllipsis size="32"/>
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
            @dragstart="onDragItem('polygon')"
        >
          <Diamond size="32"/>
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
            +
          </button
          >
          <button
              class="px-2 border-y border-e"
              @click="selectedShape.radius -= 5"
          >
            -
          </button>
        </label
        >
        <template v-else>
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
        </template>
      </div>
    </div>
    <v-stage
        :config="configKonva"
        ref="stage-el"
        @mousedown="handleStageMouseDown"
        @touchstart="handleStageMouseDown"
        @wheel="onZoom"
        class="v-stage"
    >
      <v-layer ref="layer-el">
        <Shape
            v-for="table of tables"
            :key="table.id"
            ref="items"
            :config="table"
            :selected="selectedShape?.id === table.id"
            @transformend="handleTransformEnd"
            @dragend="onDropItem"
            @click="selectedShape = $event"
        />
        <v-transformer
            ref="transformer"
            :config="{
          rotateEnabled: false,
        }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>
