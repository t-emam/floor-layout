<script setup>
import {LoaderCircle, FileJson} from "lucide-vue-next";
import {defineProps, nextTick, onMounted, ref} from "vue"

const {layer} = defineProps({
  layer: {
    default: () => {},
    type: [Array, Object]
  }
})

const isExporting = ref(false);


const exportFile = async () => {
  isExporting.value = true
  console.log(layer.getStage().toObject(), layer.getStage().toJSON())
  await downloadFile(layer.getStage().toJSON())
  await downloadFile(layer.getStage().toObject(), 'js')
  setTimeout(()=>{
    isExporting.value = false
  },300)
}

const downloadFile = async (data, ext = 'json') => {
    return nextTick(()=>{
      const textString = JSON.stringify(data, null, 2);
      const blob = new Blob([textString], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `tables.${ext}`
      a.click();
    })
}

</script>

<template>
  <div class='flex items-center bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-20'>
    <button
        title='Export Json file'
        class="p-2 rounded-lg disabled:bg-gray-100 disabled:opacity-35"
        :disabled='isExporting'
        @click='exportFile'>
      <FileJson size='23px' v-if="!isExporting"/>
      <LoaderCircle size='23px' v-else class="animate-spin "/>
    </button>
  </div>
</template>