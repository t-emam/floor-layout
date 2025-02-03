<script lang="ts" setup>
import { useTemplateRef } from 'vue';

const props = defineProps({
  config: { type: Object, default: () => {} },
  selected: Boolean,
});

const emit = defineEmits(['transformend','transformstart', 'dragend', 'click']);
const nodeRef = useTemplateRef('shape');
const handleDragEnd = (e) => {
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
      zIndex: 10,
    }"
    ref="shape"
    @transformend="$emit('transformend', $event)"
    @transformstart="$emit('transformstart', $event, config)"
    @click="$emit('click', config)"
    @dragend="handleDragEnd"
  >
    <v-text
      v-if="config.text"
      :config="{
        id: config.id,
        y: -20,
        text: config.text,
        width: config.width,
        height: config.height,
        fontSize: 16,
      }"
    />
    <v-rect
      :config="{
        id: config.id,
        width: config.width,
        height: config.height,
        radius: config.radius,
        stroke: '#000',
        strokeWidth: 1,
      }"
    />
  </v-group>
</template>
