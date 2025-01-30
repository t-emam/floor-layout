<script setup>
import Actions from "./components/Actions.vue";
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

const scaleBy = ref(1.009);

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

  ShapeStore.stageEl = stageEl.value.getNode();
  ShapeStore.layerEl = layerEl.value.getNode();

  FloorStore.initFloor();
  await drawFloorEntities();

  const con = stageEl.value.getNode().container();

  con.addEventListener('drop', (event) => {
    event.preventDefault();
  });

  con.addEventListener('dragover', function (e) {
    e.preventDefault();
  });

  layerEl.value.getNode().offsetX(0);
  layerEl.value.getNode().offsetY(0);
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
      const count = ShapeStore.tables.length + 1;
      const table = buildTable({
        width: 50,
        height: 50,
        type: "table",
        shape: type === 'rectangle' ? "rect" : "circle",
        id: new Date().getTime().toString(),
        name: `T${ count }`,
        number_of_seats: 4,
        rotation: 0,
        revenue_center: null,
        fill: '#E5E5EA'
      })

      table.setPosition({x: event.x, y: event.y});
      setTimeout(()=>{
        const section = ShapeStore.shapeOverlapping(table, 'sections');
        const others = ShapeStore.shapeOverlapping(table, 'others');

        if (!section || !!others) {
          ShapeStore.setCursorNotAllowed();
          return ShapeStore.destroyShape(table);
        }

        const {x: sectionX, y: sectionY} = section.getPosition();
        const eventX = event.clientX;
        const eventY = event.clientY;
        let offsetX = Math.max(eventX - sectionX - table.width() / 2, 0);
        let offsetY = Math.max(eventY - sectionY - table.height() / 2, 0);
        if (type !== 'rectangle') {
          offsetX = Math.max(eventX - sectionX - (table.width() / 4), 0);
          offsetY = Math.max(eventY - sectionY - (table.height() / 4), 0);
        }

        table.setPosition({x: offsetX, y: offsetY})
        ShapeStore.setSectionChild(table, section.id());
      }, 2000)
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
        rotation: 0,
        bg_color: "transparent",
      })

      label.moveToTop();
      label.setPosition({x: event.x, y: event.y});
      const others = ShapeStore.shapeOverlapping(label, 'others');
      if (!!others) {
        // Rule:: In case label dropped on top of another shape element ::
        ShapeStore.setCursorNotAllowed();
        return ShapeStore.destroyShape(label);
      }

      const section = ShapeStore.shapeOverlapping(label, 'sections');
      if (section) {
        // Rule:: In case label dropped on section ::
        const {x: sectionX, y: sectionY} = section.getAbsolutePosition();
        const eventX = event.clientX;
        const eventY = event.clientY;
        const offsetX = eventX - sectionX - label.width() / 2;
        const offsetY = eventY - sectionY - label.height() / 2;
        label.setPosition({x: offsetX, y: offsetY})
        ShapeStore.setSectionChild(label, section.id());
      }

    })
  }
}


function onZoom(event) {
  event.evt.preventDefault();
  const stage = stageEl.value.getNode();
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };
  const newScale =
      event.evt.deltaY > 0 ? oldScale * scaleBy.value : oldScale / scaleBy.value;

  stage.scale({x: newScale, y: newScale});
  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
  stage.position(newPos);
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

const onDragMove = (position) =>{
  // return {
  //   x: Math.max(0, position.x),
  //   y: Math.max(0, position.y)
  // };
}
// const onStgDragMove = () =>{
//   const layer = layerEl.value.getNode();
//   layer.position({
//     x:  Math.max(0, layer.x()),
//     y: Math.max(0, layer.y())
//   });
//   layer.batchDraw();
// }

</script>

<template>

  <Actions @drawShapes="drawFloorEntities"/>
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
