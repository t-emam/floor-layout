<script setup>
import { ref } from 'vue';

defineProps({
  config: { type: Object, default: () => {} },
  selected: Boolean,
});

const emit = defineEmits(['transformend', 'dragend', 'click']);

const isDragging = ref(false);

const getTableComponent = (shape) => {
  switch (shape) {
    case 'rectangle':
      return 'v-rect';
    case 'rectangle':
      return 'v-circle';
    case 'polygon':
      return 'v-regular-polygon';
    case 'label':
      return 'v-rect';
    case 'barrier':
      return 'v-rect';
  }
  return 'v-circle';
};

const handleDragStart = () => {
  isDragging.value = true;
  emit;
};
const handleDragEnd = (e) => {
  isDragging.value = false;
  emit('dragend', e);
};
</script>

<template>
  <v-text
    v-if="config.text"
    :config="{
      ...config,
      fontSize: 18,
      align: 'center',
      verticalAlign: 'middle',
    }"
  />
  <component
    :is="getTableComponent(config.shape)"
    :config="{
      ...config,
      draggable: true,
      cornerRadius: 4,
      sides: 4,
      fill: ['circle', 'rectangle', 'polygon', 'label'].includes(config.shape)
        ? 'transparent'
        : 'black',
      ...(['circle', 'rectangle', 'polygon', 'label'].includes(config.shape)
        ? { stroke: 'black', strokeWidth: selected ? 3 : 1 }
        : {}),
      ...(['label'].includes(config.shape) ? { dash: [5, 5] } : {}),
    }"
    @click="$emit('click', config)"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @transformend="$emit('transformend', $event)"
  />
</template>
