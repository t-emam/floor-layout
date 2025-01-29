<script setup>
import Konva from "konva";
import Actions from "./components/Actions.vue";
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
const {buildSection} = useSection();
const {buildTable} = useTable();
const {buildLabel} = useLabel();
const {buildBarrier} = useBarrier();

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

  ShapeStore.stageEl = stageEl.value;
  ShapeStore.layerEl = layerEl.value;

  FloorStore.initFloor();
  await drawFloorEntities();

  const con = stageEl.value.getNode().container();

  con.addEventListener('drop', (e) => {
    e.preventDefault()
  });

  con.addEventListener('dragover', function (e) {
    e.preventDefault();
  });
});

function onDragItem(type, event) {
  event.preventDefault();
  if (type === 'section') {
    const label = new Date().getTime().toString()
    const labelLength = label.length;

    const attrs = {
      id: `_NEW_${ new Date().getTime().toString() }`,
      x: event.x - 150,
      y: event.y - 150,
      width: 450,
      height: 450,
      type: "section",
      name: `Section ${ label.substring(labelLength - 4, labelLength) }`,
      rotation: 0,
      revenue_center: null,
      children: [],
    }

    const section = buildSection(attrs);
    const others = ShapeStore.shapeOverlapping(section);
    if (!!others) {
      // Role:: In case section dropped on shape element ::
      ShapeStore.setCursorNotAllowed()
      return ShapeStore.destroyShape(section)
    }
    return nextTick(() => {
      layerEl.value.getNode().add(section);
      layerEl.value.getNode().batchDraw();
    })
  }

  if (type === 'rectangle' || type === 'circle') {
    return nextTick(() => {

      const count = ShapeStore.tables.length +1;
      const table = buildTable({
        x: event.x,
        y: event.y,
        width: 50,
        height: 50,
        type: "table",
        shape: type === 'rectangle' ? "rect" : "circle",
        id: new Date().getTime().toString(),
        name: `T${ count }`,
        number_of_seats: 4,
        rotation: 0,
        revenue_center: null,
        fill:'#E5E5EA'
      })

      const section = ShapeStore.shapeOverlapping(table, 'sections');
      const others = ShapeStore.shapeOverlapping(table, 'others');

      if (!section || !!others) {
        ShapeStore.setCursorNotAllowed();
        return ShapeStore.destroyShape(table);
      }

      const {x: sectionX, y: sectionY} = section.absolutePosition();
      const eventX = event.clientX;
      const eventY = event.clientY;
      let offsetX = Math.max(eventX - sectionX - table.width() / 2, 0);
      let offsetY = Math.max(eventY - sectionY - table.height() / 2, 0);
      if( type !== 'rectangle'){
        offsetX = Math.max(eventX - sectionX - (table.width() / 4 ), 0);
        offsetY = Math.max(eventY - sectionY - (table.height() / 4 ), 0);
      }
      table.setPosition({x: offsetX, y: offsetY})
      ShapeStore.setSectionChild(table, section.id());
      ShapeStore.addOrEdit(table);
    })
  }

  if (type === 'barrier') {
    return nextTick(() => {
      const barrier = buildBarrier({
        type: "barrier",
        id: new Date().getTime().toString(),
        height: 10,
        width: 110,
        x: event.x,
        y: event.y,
        rotation: 0,
      })

      barrier.moveToTop();

      const section = ShapeStore.shapeOverlapping(barrier, 'sections');
      const others = ShapeStore.shapeOverlapping(barrier, 'others');
      if (!section || !!others) {
        // Rule:: In case barrier dropped on section but not on top of shape element ::
        ShapeStore.setCursorNotAllowed();
        return ShapeStore.destroyShape(barrier);
      }

      const {x: sectionX, y: sectionY} = section.getAbsolutePosition();
      const eventX = event.clientX;
      const eventY = event.clientY;
      const offsetX = eventX - sectionX - barrier.width() / 2;
      const offsetY = eventY - sectionY - barrier.height() / 2;
      barrier.setPosition({x: offsetX, y: offsetY})
      ShapeStore.setSectionChild(barrier, section.id());
      ShapeStore.addOrEdit(barrier);
    })
  }

  if (type === 'label') {
    return nextTick(() => {
      const label = buildLabel({
        type: "label",
        id: new Date().getTime().toString(),
        name: "Label Area",
        height: 80,
        width: 120,
        x: event.x,
        y: event.y,
        rotation: 0,
        bg_color: "transparent",
      })

      label.moveToTop();

      const others = ShapeStore.shapeOverlapping(label, 'others');
      if (!!others) {
        // Rule:: In case label dropped on top of another shape element ::
        ShapeStore.setCursorNotAllowed();
        return ShapeStore.destroyShape(label);
      }

      const section = ShapeStore.shapeOverlapping(label, 'sections');
      if(section) {
        // Rule:: In case label dropped on section ::
        const {x: sectionX, y: sectionY} = section.getAbsolutePosition();
        const eventX = event.clientX;
        const eventY = event.clientY;
        const offsetX = eventX - sectionX - label.width() / 2;
        const offsetY = eventY - sectionY - label.height() / 2;
        ShapeStore.setSectionChild(label, section.id());
        label.setPosition({x: offsetX, y: offsetY})
      }

      ShapeStore.addOrEdit(label);
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
        // onTableDragEnd(target, group, event.evt)
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

  <Actions @drawShapes="drawFloorEntities" />
  <ItemsArea @select="({item, event})=>onDragItem(item, event)"/>
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
