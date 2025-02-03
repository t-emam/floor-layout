<script setup>
import Konva from "konva";
import {useTemplateRef} from 'vue';

const props = defineProps({
  config: {
    type: Object, default: () => {
    }
  },
  selected: Boolean,
});

const emit = defineEmits([
  'transformstart',
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
const circleTableSeats = (config) => {
  const seats = [];
  const tableRadius = (config.width / 2);
  const numSeats = config.number_of_seats;
  const seatWidth = 10;
  const seatHeight = 40;
  const angleStep = (2 * Math.PI) / numSeats;

  for (let i = 0; i < numSeats; i++) {
    const angle = i * angleStep;  // Calculate the angle for the current seat

    const seatX = tableRadius * Math.cos(angle);
    const seatY = tableRadius * Math.sin(angle);

    const x = seatX - seatWidth / 2;
    const y = seatY - seatHeight / 2;

    const seat = new Konva.Shape({
      id: `${ config.id }-seat-${ seats.length }`,
      x,
      y,
      width: seatWidth,
      height: seatHeight,
      fill: '#000',
      sceneFunc: (context, shape) => {
        context.save();
        context.translate(shape.getAttr('width') / 2, shape.getAttr('height') / 2);
        context.rotate(angle);
        context.translate(-shape.getAttr('width') / 2, -shape.getAttr('height') / 2);
        const cornerRadius = 10;

        // DON'T TOUCH
        context.beginPath();
        context.moveTo(0, cornerRadius);  // Move to the top left and down by the corner radius
        context.arcTo(0, shape.getAttr('height'), tableRadius, shape.getAttr('height'), cornerRadius);  // bottom left rounded corner
        context.lineTo(shape.getAttr('width'), shape.getAttr('height'));  // draw straight line to the bottom right corner
        context.lineTo(shape.getAttr('width'), 0);  // draws straight line to the top right corner
        context.arcTo(0, 0, 0, cornerRadius, cornerRadius);  // top to the left rounded corner (back to start)
        // DON'T TOUCH

        context.closePath();
        context.fillStrokeShape(shape);
        context.restore();
      }
    });
    console.log(seat.getAttrs());

    seats.push(seat);
  }

  return seats;
};
const calculatePositions = (config) => {
  console.log('config', config)
  let rectangles = [];
  const size = Math.min(config.width, config.height) * 0.1; // Seat size (10% of the smallest dimension)
  const padding = 10; // Space between the table and the seats

  if (config.shape === 'circle') {
    const radius = (config.height / 2 + padding + size/2)
    for (let i = 0; i < config.number_of_seats; i++) {
      const angleStep = (i / config.number_of_seats) * (2 * Math.PI);
      const x = radius * Math.cos(angleStep) - size / 2;
      const y = radius * Math.sin(angleStep) - size / 2;
      rectangles.push({x, y, width: size, height: size});
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

    const topSeats = 1;
    const bottomSeats = 1;
    const leftSeats = Math.max(1, Math.floor(totalHeightSeats / 2));
    const rightSeats = Math.max(1, totalHeightSeats - leftSeats);

    // Top side
    for (let i = 0; i < topSeats; i++) {
      const x = (i + 1) * (config.width / (topSeats + 1)) - size / 2;
      rectangles.push({x, y: -size - padding, width: size, height: size});
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
      rectangles.push({x: -size - padding, y, width: size, height: size});
    }
  }

  return rectangles;
};

defineExpose({
  nodeRef,
  table: () => nodeRef.value.getNode()
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
      rotation: config.rotation,
      zIndex: 10,
    }"
      ref="shape"
      @transformend="$emit('transformend', $event)"
      @transformstart="$emit('transformstart', $event, config)"
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

    <template v-if="config.type === 'table' && config.number_of_seats">
      <v-rect
          v-for="(config, index) in calculatePositions(config)"
          :key="`${config.id}-rect-${index}`"
          :config="{
            ...config,
            fill: '#000',
            stroke: '#000',
            strokeWidth: 0,
            fillOpacity: 0.5,
            name: 'seat',
            strokeScaleEnabled: false,
            shadowOpacity: 0.5,
          }"
      />

    </template>
  </v-group>
</template>