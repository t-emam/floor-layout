<script setup>
import {AppWindowMac, Circle, LayoutTemplateIcon, Square, SquareDashed, Table2} from "lucide-vue-next";
import {defineEmits} from "vue"

const emit = defineEmits('dragend');

const onDragItem = (item, event) => {
  emit('dragend', {item, event});
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
          @dragend="onDragItem('table_section', $event)"
      >
        <Table2 size="32"/>
      </button>

      <button
          class="p-1 hover:bg-violet-100 rounded"
          draggable="true"
          @dragend="onDragItem('floor_section', $event)"
      >
        <AppWindowMac size="32"/>
      </button>

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
</template>