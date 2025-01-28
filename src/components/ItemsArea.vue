<script setup>
import {AppWindowMac, Circle, LayoutTemplateIcon, Square, SquareDashed, Table2} from "lucide-vue-next";
import {defineEmits} from "vue"

const emit = defineEmits('select');

const onDragItem = (item, event) => {
  emit('select', {item, event});
}
</script>

<template>
  <div class="absolute top-0 left-0 right-0 mx-auto z-10 w-[400px] py-2">
    <div
        class="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg"
    >
      <button
          class="p-1 hover:bg-violet-100 rounded"
          draggable="true"
          @dragend="onDragItem('section', $event)"
      >
        <LayoutTemplateIcon size="32"/>
      </button>
      <button
          class="p-1 hover:bg-violet-100 rounded"
          draggable="true"
          @dragend="onDragItem('rectangle', $event)"
      >
        <Square size="32"/>
      </button>
      <button
          class="p-1 hover:bg-violet-100 rounded"
          draggable="true"
          @dragend="onDragItem('circle', $event)"
      >
        <Circle size="32"/>
      </button>
      <button
          class="p-1 hover:bg-violet-100 rounded"
          draggable="true"
          @dragend="onDragItem('label', $event)"
      >
        <SquareDashed size="32"/>
      </button>
      <button
          class="p-1 hover:bg-violet-100 rounded h-10"
          draggable="true"
          @dragend="onDragItem('barrier', $event)"
      >
        <div class="h-2 w-8 bg-black"></div>
      </button>
    </div>
  </div>
</template>