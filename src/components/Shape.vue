<script setup>
import { ref, useTemplateRef } from 'vue';

const props = defineProps({
  config: { type: Object, default: () => {} },
  selected: Boolean,
});

const emit = defineEmits(['transformend', 'dragend', 'click']);

const isDragging = ref(false);
const nodeRef = useTemplateRef('shape');

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
  emit('dragend', e, props.config);
};

defineExpose({
  nodeRef,
});
</script>

<template>
  <v-group
    :config="{
      draggable: true,
      id: config.id,
      x: config.x,
      y: config.y,
      width: config.width,
      height: config.height,
      radius: config.radius,
    }"
    ref="shape"
    @transformend="$emit('transformend', $event)"
    @click="$emit('click', config)"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <component
      :is="getTableComponent(config.shape)"
      :config="{
        id: config.id,
        width: config.width,
        height: config.height,
        radius: config.radius,
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
    />
    <v-text
      v-if="config.text"
      :config="{
        id: config.id,
        text: config.text,
        width: config.width ?? config.radius,
        height: config.height ?? config.radius,
        fontSize: 18,
        align: 'center',
        verticalAlign: 'middle',
      }"
    />
  </v-group>
</template>
