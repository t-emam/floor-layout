<script setup>
import {computed, ref, defineProps, onMounted, defineExpose} from "vue"

const emit = defineEmits(['transformend'])
const textRef = ref(null);
const tableRef = ref(null);
const groupRef = ref(null);
const {attrs} = defineProps({
  attrs: {
    type: Object,
    default: () => ({
      id: null,
      type: 'string',
      shape: 'circle',
      rotation: 0,
      number_of_seats: 1,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }),
  }
})

const isCircle = computed(() => attrs?.shape === 'circle').value

const component = computed(() => !isCircle ? 'v-rect' : 'v-circle')

const groupConfig = computed(() => ({
  id: attrs.id,
  x: attrs.x,
  y: attrs.y,
  type: attrs.type,
  shape: attrs.shape,
  rotation: attrs.rotation,
  name: 'table-group',
  draggable: true,
  number_of_seats: attrs.number_of_seats,
  strokeScaleEnabled: false,
}))

const tableConfig = computed(() => ({
  id: attrs.id,
  width: attrs.width,
  height: attrs.height,
  fill: '#E5E5EA',
  ...(isCircle ? {radius: attrs.width / 2} : null),
}))

const textConfig = computed(() => {
  return {
    id: attrs.id,
    text: attrs.name || 'T#',
    fontSize: 14,
    fontStyle: 'bold',
    fill: "#000",
  }
})

const textAlignment = () => {
  const text = textRef.value.getNode();
  const table = tableRef.value.getNode();

  if (!isCircle) {
    text.x(table.width() / 2 - text.width() / 2);
    text.y(table.height() / 2 - text.height() / 2);
  } else {
    text.x((table.getAttr('radius') - table.width() / 2) - text.width() / 2);
    text.y((table.getAttr('radius') - table.height() / 2) - text.height() / 2);
  }
}

onMounted(() => {
  textAlignment()
})

defineExpose({
  group: () => groupRef.value.getNode(),
  table: () => tableRef.value.getNode(),
  text: () => textRef.value.getNode(),
})

</script>

<template>
  <v-group :config="groupConfig"
           ref="groupRef"
           @transformend="emit('transformend', $event)"
  >
    <component ref="tableRef" :is="component" :config="tableConfig"/>
    <v-text ref="textRef" :config="textConfig"/>
  </v-group>
</template>