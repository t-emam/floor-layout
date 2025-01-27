<script setup>
import Konva from "konva";
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

const stageEl = useTemplateRef('stage-el');
const layerEl = useTemplateRef('layer-el');
const setCursor = (cursor = 'auto') => {
  stageEl.value.getNode().container().style.cursor = cursor;
}

const {buildSection, onSectionDragEnd} = useSection({setCursor, stageEl, layerEl});
const {buildTable} = useTable({setCursor, stageEl, layerEl});
const {buildLabel} = useLabel({setCursor, stageEl, layerEl});
const {buildBarrier} = useBarrier({setCursor, stageEl, layerEl});

const configKonva = {
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true,
  scale: 2,
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
});

function onDragItem(type, event) {
  if (type === 'floor_section') {
    const label = new Date().getTime().toString()
    const labelLength = label.length;

    const attrs = {
      id: `_NEW_${new Date().getTime()}`,
      x: event.offsetX - 150,
      y: event.offsetY,
      width: 300,
      height: 400,
      type: "section",
      name: `Section ${ label.substring(labelLength - 4, labelLength) }`,
      rotation: 0,
      revenue_center: null,
      children: [],
    }

    const section = buildSection(attrs);
    return nextTick(() => {
      layerEl.value.getNode().add(section);
      layerEl.value.getNode().batchDraw();
      onSectionDragEnd(event, section)
    })
  }

  if (type === 'table_section') {
    return nextTick(() => {

      const label = new Date().getTime().toString()
      const labelLength = label.length;

      const table = buildTable({
        x: event.x,
        y: event.y,
        width: 200,
        height: 200,
        type: "table",
        shape: "rect",
        id: new Date().getTime(),
        name: `Table ${ label.substring(labelLength - 4, labelLength) }`,
        number_of_seats: 4,
        rotation: 0,
        revenue_center: null
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
      const offsetX = eventX - sectionX - table.getWidth() / 2;
      const offsetY = eventY - sectionY - table.getHeight() / 2;
      ShapeStore.setSectionChild(table, section.id());
      table.setPosition({x: offsetX, y: offsetY})
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
  stage.scale({ x: newScale, y: newScale });

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
</script>

<template>
  <ItemsArea @dragend="({item, event})=>onDragItem(item, event)"/>
  <ItemsProprieties v-model="selectedShape" @update="value=>selectedShape=value"/>
  <v-stage
      :config="configKonva"
      ref="stage-el"
      @wheel="onZoom"
  >
    <v-layer ref="layer-el">
    </v-layer>
  </v-stage>
</template>
