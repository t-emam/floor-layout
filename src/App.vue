<script setup>
import Konva from "konva";
import {useTransformer} from "./composable/useTransformer.js";
import {useBarrier} from "./composable/useBarrier.js";
import {FloorStore} from './Store/FloorStore.js'
import ItemsProprieties from "./components/ItemsProprieties.vue";
import ItemsArea from "./components/ItemsArea.vue";
import {useTable} from "./composable/useTable.js";
import {nextTick, ref, useTemplateRef} from 'vue';
import {onMounted} from 'vue';
import {useSection} from './composable/useSection.js';
import {useLabel} from './composable/useLabel.js';
import {ShapeStore} from './Store/ShapeStore.js';
import Zoom from './components/Zoom.vue';

const isDragOnProgress = ref(false);

const stageEl = useTemplateRef('stage-el');
const layerEl = useTemplateRef('layer-el');
const setCursor = (cursor = 'auto') => {
  stageEl.value.getNode().container().style.cursor = cursor;
}

const {buildSection, onSectionDragEnd} = useSection({setCursor, stageEl, layerEl});
const {buildTable, onTableDragEnd} = useTable({setCursor, stageEl, layerEl});
const {buildLabel, onLabelDragEnd} = useLabel({setCursor, stageEl, layerEl});
const {buildBarrier, onBarrierDragEnd} = useBarrier({setCursor, stageEl, layerEl});

const configKonva = {
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: false,
};

const selectedShape = ref(null);
const drawSection = async (attrs) => {
  return nextTick(() => {
    buildSection(attrs)
  })
}

const drawLabel = async (attrs) => {
  return nextTick(() => {
    const label = buildLabel(attrs)
    ShapeStore.setSectionChild(label, attrs.parent_id)
  })
}

const drawBarrier = async (attrs) => {
  return nextTick(() => {
    const barrier = buildBarrier(attrs)
    ShapeStore.setSectionChild(barrier, attrs.parent_id)
  })
}

const drawTable = async (attrs) => {
  return nextTick(() => {
    const table = buildTable(attrs)
    ShapeStore.setSectionChild(table, attrs.parent_id)
  })
}

const drawFloorEntities = async () => {
  FloorStore.sections.forEach(section => {
    drawSection(section)
  })

  FloorStore.labels.forEach(label => {
    drawLabel(label)
  })

  FloorStore.tables.forEach(table => {
    drawTable(table)
  })

  FloorStore.barriers.forEach(barrier => {
    drawBarrier(barrier)
  })
}

onMounted(async () => {
  FloorStore.initFloor();
  await drawFloorEntities();

  ShapeStore.stageEl = stageEl.value;
  ShapeStore.layerEl = layerEl.value;
});

function onDragItem(type, event) {
  if (type === 'section') {
    const label = new Date().getTime().toString()
    const labelLength = label.length;

    const attrs = {
      id: `_NEW_${ new Date().getTime().toString() }`,
      x: event.clientX,
      y: event.clientY,
      width: 200,
      height: 200,
      type: "section",
      name: `Section ${ label.substring(labelLength - 4, labelLength) }`,
      rotation: 0,
      revenue_center: null,
      children: [],
      is_new: true
    }

    const section = buildSection(attrs);
    return nextTick(() => {
      layerEl.value.getNode().add(section);
      layerEl.value.getNode().batchDraw();
      onSectionDragEnd(event, section)
    })
  }

  if (type === 'rectangle' || type === 'circle') {
    return nextTick(() => {

      const label = new Date().getTime().toString()
      const labelLength = label.length;

      const table = buildTable({
        x: event.x,
        y: event.y,
        width: 200,
        height: 200,
        type: "table",
        shape: type === 'rectangle' ? "rect" : "circle",
        id: new Date().getTime(),
        name: `Table ${ label.substring(labelLength - 4, labelLength) }`,
        number_of_seats: 4,
        rotation: 0,
        revenue_center: null,
        is_new: true
      })

      const section = ShapeStore.shapeOverlapping(table, 'sections');
      if (!section) {
        setCursor('not-allowed');
        table.destroy()
        setTimeout(() => {
          setCursor();
        }, 1000);
        return;
      }


      // set table position
      const {x: sectionX, y: sectionY} = section.getPosition();
      const eventX = event.clientX;
      const eventY = event.clientY;
      const offsetX = Math.max(eventX - sectionX - table.getWidth() / 2, 0);
      const offsetY = eventY - sectionY - table.getHeight() / 2;
      ShapeStore.setSectionChild(table, section.id());
      table.setPosition({x: offsetX, y: offsetY})
      onTableDragEnd(event, table)
    })
  }

  if (type === 'barrier') {
    return nextTick(() => {
      const barrier = buildBarrier({
        type: "barrier",
        defaultFill: "#f4c121",
        id: new Date().getTime().toString(),
        height: 10,
        width: 110,
        x: event.x,
        y: event.y,
        rotation: 0,
        bg_color: "#f4c121",
        is_new: true
      })

      barrier.moveToTop();

      const section = ShapeStore.shapeOverlapping(barrier, 'sections');
      if (!section) {
        setCursor('not-allowed');
        barrier.destroy()
        setTimeout(() => {
          setCursor();
        }, 1000);
        return;
      }

      // set table position
      const {x: sectionX, y: sectionY} = section.getPosition();
      const eventX = event.clientX;
      const eventY = event.clientY;
      const offsetX = eventX - sectionX - barrier.getWidth() / 2;
      const offsetY = eventY - sectionY - barrier.getHeight() / 2;
      ShapeStore.setSectionChild(barrier, section.id());
      barrier.setPosition({x: offsetX, y: offsetY})
      onBarrierDragEnd(event, barrier)
    })
  }

  if (type === 'label') {
    return nextTick(() => {
      const label = buildLabel({
        type: "label",
        id: new Date().getTime().toString(),
        name: "Label Area",
        height: 80,
        width: 260,
        x: event.layerX,
        y: event.layerY,
        rotation: 0,
        bg_color: "#c6c6c6",
        is_new: true
      })

      label.moveToTop();

      const section = ShapeStore.shapeOverlapping(label, 'sections');

      const {x: sectionX, y: sectionY} = section.getPosition();
      const eventX = event.clientX;
      const eventY = event.clientY;
      const offsetX = eventX - sectionX - label.getWidth() / 2;
      const offsetY = eventY - sectionY - label.getHeight() / 2;
      ShapeStore.setSectionChild(label, section.id());
      label.setPosition({x: offsetX, y: offsetY})
      onLabelDragEnd(event, label)
    })
  }
}

function onZoom(e) {
  e.evt.preventDefault();
  const stage = stageEl.value.getNode();
  const scaleBy = 1.6;
  let oldScale = stage.scaleX();  // Get the current scale

  // Zoom in or out based on wheel direction
  const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

  // Apply the new scale to the stage
  stage.scale({x: newScale, y: newScale});

  // Adjust the stage position to keep the mouse pointer at the same position
  const pointerPos = stage.getPointerPosition();
  const mousePointTo = {
    x: (pointerPos.x - stage.x()) / oldScale,
    y: (pointerPos.y - stage.y()) / oldScale
  };

  // Update the position of the stage to "zoom in" or "zoom out" on the mouse pointer
  stage.position({
    x: pointerPos.x - mousePointTo.x * newScale,
    y: pointerPos.y - mousePointTo.y * newScale
  });

  // Redraw the stage to apply the zoom
  stage.batchDraw();
}


const onDragMove = (event) => {
  return
  event.evt.stopPropagation();
  if (isDragOnProgress.value) {
    console.log('inprogress')
    return
  }
  isDragOnProgress.value = true
  nextTick(() => {
    const target = event.target;

    ShapeStore.tables.forEach((group) => {
      if (target.id() === group.id()) {
        return false;
      }

      if (haveIntersection(group.getClientRect(), target.getClientRect())) {
        onTableDragEnd(target, group, event.evt)
      }
    });


    setTimeout(() => {
      isDragOnProgress.value = false
    }, 500)
  })
}

function haveIntersection(r1, r2) {
  return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
  );
}


const updateZoom = (zoom = 100) => {
  const stage = stageEl.value.getNode();
  const pointer = stage.getPointerPosition();
  const scale = zoom / 100;
  const oldScale = stage.scaleX();
  stage.scale({x: scale, y: scale});
  const newPos = {
    x: pointer.x - pointer.x * scale / oldScale,
    y: pointer.y - pointer.y * scale / oldScale,
  };
  stage.position(newPos);
  stage.batchDraw();
};
</script>

<template>

  <ItemsArea @dragend="({item, event})=>onDragItem(item, event)"/>
  <ItemsProprieties v-model="selectedShape" @update="value=>selectedShape=value"/>
  <div class="flex gap-4 absolute start-4 bottom-2">
    <Zoom @zoom="updateZoom"/>
  </div>
  <v-stage
      :config="configKonva"
      ref="stage-el"
      @wheel="onZoom"
  >
    <v-layer @dragend="onDragMove" ref="layer-el">
    </v-layer>
  </v-stage>
</template>
