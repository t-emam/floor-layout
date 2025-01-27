<script setup>
import {defineProps,defineEmits, watch, ref} from "vue"

const emit = defineEmits(['update'])

const selectedShape = ref(null);

const {modelValue} = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  }
})


watch(() => modelValue, (value) => {
  selectedShape.value = value
}, {immediate: true, flush: 'post'})

watch(() => selectedShape, (value) => {
  emit('update', value)
}, {immediate: true, deep: true})


</script>

<template>
  <div v-if="selectedShape" class="absolute bottom-0 z-10 w-full py-2">
    <div
        class="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg"
    >
      <input
          v-if="selectedShape.shape !== 'barrier'"
          type="text"
          v-model="selectedShape.text"
          class="rounded-md border px-2"
      />
      <!-- <label
        v-if="
          selectedShape.shape !== 'rectangle' &&
          selectedShape.shape !== 'label' &&
          selectedShape.shape !== 'barrier'
        "
        >Radius
        <button
          class="px-2 border-y border-x"
          @click="selectedShape.radius += 5"
        >
          +</button
        ><button
          class="px-2 border-y border-e"
          @click="selectedShape.radius -= 5"
        >
          -
        </button></label
      > -->
      <label
      >Width
        <button
            class="px-2 border-y border-x"
            @click="selectedShape.width += 5"
        >
          +
        </button
        >
        <button
            class="px-2 border-y border-e"
            @click="selectedShape.width -= 5"
        >
          -
        </button>
      </label>
      <label>
        Height
        <button
            class="px-2 border-y border-x"
            @click="selectedShape.height += 5">
          +
        </button>
        <button
            class="px-2 border-y border-e"
            @click="selectedShape.height -= 5">
          -
        </button>
      </label
      >
    </div>
  </div>
</template>