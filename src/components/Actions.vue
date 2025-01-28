<script setup>
import Konva from "konva";
import {SaveIcon} from "lucide-vue-next";
import {FloorStore} from "../Store/FloorStore.js";
import {ShapeStore} from "../Store/ShapeStore.js";
import {ref, defineEmits} from "vue";
const emit = defineEmits(["drawShapes"]);

const data = ref([])

const onSave = async () => {
  ShapeStore.sections.forEach(section => {
    const payload = {
      id: section.id(),
      type: section.attrs?.type || "section",
      name: section?.findOne(".text")?.attrs?.text,
      height: section.height(),
      width: section.width(),
      x: Number(section.x()),
      y: Number(section.y()),
      rotation: Number(section.rotation()),
      revenue_center: null,
      children: []
    };

    section.children?.forEach((child) => {
      if(!child.attrs?.type){
        return;
      }
      const name = child.hasName('barrier')?'':child?.findOne(".text")?.attrs?.text;
      const bg_color = child.hasName('barrier')?'':child?.findOne(".bg_color")?.attrs?.fill;
      const childPayload = {
        type: child.attrs?.type,
        shape: child.attrs?.shape,
        id: child.id(),
        name,
        bg_color,
        number_of_seats: child?.attrs?.number_of_seats,
        height: child.height(),
        width: child.width(),
        x: Number(child.x()),
        y: Number(child.y()),
        rotation: Number(child.attrs.rotation),
        revenue_center: null
      }

      payload.children.push(childPayload);
    });

    data.value.push(payload)
  })

  ShapeStore.labels.forEach(label => {
    if(label.parent instanceof Konva.Layer){
      const labelPayload = {
        type: label.attrs?.type,
        shape: label.attrs?.shape,
        id: label.id(),
        name: label?.findOne(".text")?.attrs?.text,
        bg_color: label?.findOne(".bg_color")?.attrs?.fill,
        height: label.height(),
        width: label.width(),
        x: Number(label.x()),
        y: Number(label.y()),
        rotation: Number(label.attrs.rotation),
        revenue_center: null
      }
      data.value.push(labelPayload)
    }
  })

  console.log("onSave", data.value);

  FloorStore.floor = [];
  ShapeStore.resetShapes();

  ShapeStore.layerEl.getNode().removeChildren();
  ShapeStore.layerEl.getNode().clearCache();
  ShapeStore.layerEl.getNode().batchDraw();
  console.log("ShapeStore.layerEl.getNode()", ShapeStore.layerEl.getNode(), ShapeStore.layerEl.getNode().children);

  await setTimeout(()=>{
    FloorStore.initFloor(data.value)
    emit('drawShapes');
    data.value = []
  },1000)
  FloorStore.sections.forEach(section=>{
    section.moveToBottom()
  })
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