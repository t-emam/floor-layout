<script setup>
import Konva from "konva";
import {SaveIcon} from "lucide-vue-next";
import {FloorStore} from "../Store/FloorStore.js";
import {ShapeStore} from "../Store/ShapeStore.js";
import {ref, defineEmits} from "vue";

const emit = defineEmits(["drawShapes"]);

const data = ref([])

const onSave = async () => {
  const padding = 5;
  ShapeStore.layerSections.forEach(section => {
    const width = section.width() + (section.scaleX() !== 1 ? padding : 0);
    const height = section.height() + (section.scaleY() !== 1 ? padding : 0);
    const payload = {
      id: section.id(),
      type: section.attrs?.type || "section",
      name: section?.findOne(".text")?.attrs?.text,
      height,
      width,
      x: Number(section.x()),
      y: Number(section.y()),
      rotation: Number(section.rotation()),
      revenue_center: null,
      children: []
    };

    section.children?.forEach((child) => {
      if (!child.attrs?.type) {
        return;
      }
      const name = child.hasName('barrier') ? '' : child?.findOne(".text")?.attrs?.text;
      const bg_color = child.hasName('barrier') ? '' : child?.findOne(".bg_color")?.attrs?.fill;
      const width = child.width() + (child.scaleX() !== 1 ? padding : 0);
      const height = child.height() + (child.scaleY() !== 1 ? padding : 0);
      payload.children.push({
        type: child.attrs?.type,
        shape: child.attrs?.shape,
        id: child.id(),
        name,
        bg_color,
        number_of_seats: child?.attrs?.number_of_seats,
        height,
        width,
        x: Number(child.x()),
        y: Number(child.y()),
        rotation: Number(child.attrs.rotation),
        revenue_center: null
      });
    });

    data.value.push(payload)
  })

  ShapeStore.labels.forEach(label => {
    if (label.parent instanceof Konva.Layer) {
      const width = label.width() + (label.scaleX() !== 1 ? padding : 0);
      const height = label.height() + (label.scaleY() !== 1 ? padding : 0);
      data.value.push({
        type: label.attrs?.type,
        shape: label.attrs?.shape,
        id: label.id(),
        name: label?.findOne(".text")?.attrs?.text,
        bg_color: label?.findOne(".bg_color")?.attrs?.fill,
        height,
        width,
        x: Number(label.x()),
        y: Number(label.y()),
        rotation: Number(label.attrs.rotation),
        revenue_center: null
      })
    }
  })

  // console.log("onSave", data.value);

  // FloorStore.floor = [];
  // ShapeStore.resetShapes();

  // ShapeStore.layerEl.removeChildren();
  // ShapeStore.layerEl.clearCache();
  // ShapeStore.layerEl.batchDraw();
  // console.log("ShapeStore.layerEl.getNode()", ShapeStore.layerEl.getNode(), ShapeStore.layerEl.children);
  console.log(JSON.stringify(data.value));
  navigator.clipboard.writeText(JSON.stringify(data.value))
      .then(() => {
        console.log('JSON copied');
      })

  // await setTimeout(()=>{
  //   FloorStore.initFloor(data.value)
  //   emit('drawShapes');
  //   data.value = []
  // },1000)
  // FloorStore.sections.forEach(section=>{
  //   section.moveToBottom()
  // })
}
</script>

<template>
  <div class="absolute top-0 right-4 mx-auto z-10 w-16 p-2 bg-white rounded-lg">
    <div
        class="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg"
    >
      <button
          class="p-1 hover:bg-violet-100 rounded"
          @click="onSave"
      >
        <SaveIcon size="28"/>
      </button>
    </div>
  </div>
</template>