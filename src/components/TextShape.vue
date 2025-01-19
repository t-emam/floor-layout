<script lang="ts" setup>
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
    case 'text':
      return 'v-text';
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
  <component
    :is="getTableComponent(config.shape)"
    :config="{
      ...config,
      draggable: true,
      cornerRadius: 4,
      fill: ['circle', 'rectangle'].includes(config.shape) ? 'white' : 'black',
      ...(['circle', 'rectangle'].includes(config.shape)
        ? { stroke: 'black', strokeWidth: selected ? 3 : 1 }
        : {}),
    }"
    @click="$emit('click', config)"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @transformend="$emit('transformend', $event)"
  />
  <v-text
    v-if="config.text"
    :config="{
      ...config,
      width: config.width ?? config.radius,
      height: config.height ?? config.radius,
      fontSize: 18,
      align: 'center',
      verticalAlign: 'middle',
    }"
  />
</template>
