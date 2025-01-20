<script setup>
import {computed, defineProps, onMounted, ref} from "vue"

const emit = defineEmits(['build']);

const form = ref({
  size: 2,
  shape: 'circle',
  width: 100,
  height: 100,
})

const setValue = (value) => {
  form.value = {
    ...form.value,
    ...value
  }
}

const error = ref({})

const errors = computed(() => Object.values(error.value))

const submitForm = () => {
  const {height, size, width, shape} = form.value;
  error.value = {};
  if (size < 2 || size > 14) {
    error.value['size'] = 'Allowed seats between 2 and 14';
  }

  if (width < 100 || width > 500) {
    error.value['width'] = 'Allowed width is between 100 and 500';
  }

  if (height < 100 || height > 500) {
    error.value['height'] = 'Allowed height is between 100 and 500';
  }

  if (Object.keys(error.value).length > 0) {
    return;
  }

  return emit('build', {height, size, width, shape})
}

</script>

<template>
  <div
      class='fixed end-4 left-auto top-0 bottom-0 my-auto bg-white px-6 py-4 rounded-lg drop-shadow-lg border border-gray-200 w-72 h-[450px] z-20'>
    <div class="relative flex flex-col w-full gap-4 h-full">
      <div class="flex flex-col gap-1">
        <label for="size" class="text-gray-700 text-sm py-2">Size</label>
        <input type="number"
               placeholder="number of seats"
               v-model="form.size"
               @input="({target})=>setValue({size: target.value})"
               :class="{'border-red-400': !!error?.size}"
               min="2"
               step="2"
               max="15"
               class="p-2 rounded-lg bg-white border border-gray-200"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label for="size" class="text-gray-700 text-sm py-2">Shape</label>
        <select
            v-model="form.shape"
            @change="({target})=>setValue({shape:target.value})"
            class="p-2 rounded-lg bg-white border border-gray-200"
        >
          <option value="rectangle">Rectangle</option>
          <option value="rectangle_upside">Up Side Rectangle</option>
          <option value="circle">Circle</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="flex w-full flex-col">
          <label for="size" class="text-gray-700 text-sm py-2">Width</label>
          <input type="number"
                 placeholder="number of seats"
                 :class="{'border-red-400': !!error?.width}"
                 v-model="form.width"
                 @input="({target})=>setValue({width: target.value})"
                 min="50"
                 step="10"
                 max="500"
                 class="p-2 rounded-lg bg-white border border-gray-200"
          />
        </div>
        <div class="flex w-full flex-col">
          <label for="size" class="text-gray-700 text-sm py-2">Height</label>
          <input type="number"
                 placeholder="number of seats"
                 :class="{'border-red-400': !!error?.height}"
                 v-model="form.height"
                 @input="({target})=>setValue({height: target.value})"
                 min="50"
                 step="10"
                 max="500"
                 class="p-2 rounded-lg bg-white border border-gray-200"
          />
        </div>
      </div>

      <div class="flex w-full flex-col gap-2">
        <div
            v-for="(error, index) in errors"
            :key="`error-${index}`"
            class="text-rose-400 text-xs font-medium w-full">
          {{ error }}
        </div>
      </div>
      <div class="absolute bottom-0 flex w-full justify-center ">
        <button
            @click="submitForm"
            class="p-2 rounded-lg bg-black text-white text-md font-medium w-full">
          Build
        </button>
      </div>
    </div>
  </div>
</template>