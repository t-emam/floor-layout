<script setup>
import {defineEmits, nextTick, ref, shallowRef} from "vue"
import {ZoomIn, ZoomOut} from 'lucide-vue-next';

const emit = defineEmits(['zoom']);

const zoom = shallowRef(15);
const fixPageZoom = ref(100);
const pageZoom = ref(fixPageZoom.value);

const zoomOut = () => {
  zoom.value -= 1;
  pageZoom.value -= 5
  nextTick(()=>{
    emit('zoom', pageZoom.value);
    document.documentElement.style.setProperty('--grid-size', zoom.value + 'px');
  })
}

const zoomIn = () => {
  zoom.value += 1;
  pageZoom.value += 5
  nextTick(()=>{
    emit('zoom', pageZoom.value);
    document.documentElement.style.setProperty('--grid-size', zoom.value + 'px');
  })
}
</script>

<template>
  <div
      class='flex items-center gap-2 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-20'>
    <button class="p-2 rounded-lg disabled:bg-gray-100 disabled:opacity-35" :disabled='zoom <=5' @click='zoomOut'>
      <ZoomIn size='23px'/>
    </button>
    <button class="p-2 rounded-lg disabled:bg-gray-100 disabled:opacity-35" :disabled='zoom >=25' @click='zoomIn'>
      <ZoomOut size='23px'/>
    </button>
  </div>
</template>
