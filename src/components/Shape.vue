<script setup>
import { useTemplateRef } from 'vue';

const props = defineProps({
  config: { type: Object, default: () => {} },
  selected: Boolean,
});

const emit = defineEmits([
  'transformend',
  'dragstart',
  'dragend',
  'dragmove',
  'click',
]);

const nodeRef = useTemplateRef('shape');

const getTableComponent = (shape) => {
  switch (shape) {
    case 'rectangle':
      return 'v-rect';
    case 'circle':
      return 'v-ellipse';
    case 'section':
      return 'v-rect';
    case 'label':
      return 'v-rect';
    case 'barrier':
      return 'v-rect';
  }
  return 'v-ellipse';
};

const handleDragEnd = (e) => {
  emit('dragend', e, props.config);
};

const calculatePositions = (config) => {
  const rectangles = [];
  const size = Math.min(config.width, config.height) * 0.1; // Relative size (10% of the smallest dimension)
  const padding = 5; // Space between the table and the rectangles

  if (config.shape === 'circle') {
    // Elliptical seat arrangement
    const radiusX = config.width / 2 + size + padding; // Adjust radius for x-axis
    const radiusY = config.height / 2 + size + padding; // Adjust radius for y-axis

    for (let i = 0; i < config.number_of_seats; i++) {
      const angle = (i / config.number_of_seats) * 2 * Math.PI;
      const x = radiusX * Math.cos(angle); // Elliptical x-coordinate
      const y = radiusY * Math.sin(angle); // Elliptical y-coordinate
      rectangles.push({ x, y, width: size, height: size });
    }
  } else {
    // Rectangular seat arrangement
    const aspectRatio = config.width / config.height;
    const totalSeats = config.number_of_seats;

    const totalWidthSeats = Math.max(
      2,
      Math.round((aspectRatio / (1 + aspectRatio)) * (totalSeats - 4))
    ); // Ensure at least 1 seat per side
    const totalHeightSeats = totalSeats - totalWidthSeats;

    const topSeats = Math.max(1, Math.floor(totalWidthSeats / 2));
    const bottomSeats = Math.max(1, totalWidthSeats - topSeats);
    const leftSeats = Math.max(1, Math.floor(totalHeightSeats / 2));
    const rightSeats = Math.max(1, totalHeightSeats - leftSeats);

    // Top side
    for (let i = 0; i < topSeats; i++) {
      const x = (i + 1) * (config.width / (topSeats + 1)) - size / 2;
      rectangles.push({ x, y: -size - padding, width: size, height: size });
    }

    // Right side
    for (let i = 0; i < rightSeats; i++) {
      const y = (i + 1) * (config.height / (rightSeats + 1)) - size / 2;
      rectangles.push({
        x: config.width + padding,
        y,
        width: size,
        height: size,
      });
    }

    // Bottom side
    for (let i = 0; i < bottomSeats; i++) {
      const x = (i + 1) * (config.width / (bottomSeats + 1)) - size / 2;
      rectangles.push({
        x,
        y: config.height + padding,
        width: size,
        height: size,
      });
    }

    // Left side
    for (let i = 0; i < leftSeats; i++) {
      const y = (i + 1) * (config.height / (leftSeats + 1)) - size / 2;
      rectangles.push({ x: -size - padding, y, width: size, height: size });
    }
  }

  return rectangles;
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
    @click="$emit('click', config)"
    @dragstart="$emit('dragstart', $event, config)"
    @dragend="handleDragEnd"
    @dragmove="$emit('dragmove', $event, config)"
  >
    <component
      :is="getTableComponent(config.shape)"
      :config="{
        id: config.id,
        width: config.width,
        height: config.height,
        radiusX: config.width / 2,
        radiusY: config.height / 2,
        fill: ['circle', 'rectangle', 'label'].includes(config.shape)
          ? '#E5E5EA'
          : 'black',
      }"
    />
    <v-text
      v-if="config.text"
      :config="{
        id: config.id,
        text: config.text,
        width: config.shape === 'circle' ? config.width / 2 : config.width,
        height: config.shape === 'circle' ? config.height / 2 : config.height,
        x: config.shape === 'circle' ? -config.width / 4 : 0,
        y: config.shape === 'circle' ? -config.height / 4 : 0,
        fontSize: 16,
        fontStyle: 'bold',
        align: 'center',
        verticalAlign: 'middle',
      }"
    />

    <!-- <template v-if="config.type === 'table' && config.number_of_seats">
      <v-rect
        v-for="(rect, index) in calculatePositions(config)"
        :key="`${config.id}-rect-${index}`"
        :config="{
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          fill: '#000',
        }"
      />
    </template> -->
  </v-group>
</template>
