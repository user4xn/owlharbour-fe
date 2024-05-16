<script setup lang="ts">
import DataStatsOne from '@/components/DataStats/DataStatsOne.vue'
import MapDashboard from '@/components/Maps/MapDashboard.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { ref } from 'vue';

const recenterTrigger = ref(false);
const isHiddenStatistic = ref(false);

function triggerRecenter() {
  recenterTrigger.value = !recenterTrigger.value
}

function hideStatistic() {
  isHiddenStatistic.value = !isHiddenStatistic.value
}

</script>

<template>
  <DefaultLayout>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 relative">
      <div class="absolute top-4 right-4 z-30 hover:opacity-100 opacity-50">
        <button class="bg-primary hover:bg-opacity-90 text-white px-3 rounded-full py-1" @click="hideStatistic">{{ isHiddenStatistic ? 'Show': 'Hide' }} Statistic</button>
        <button @click="triggerRecenter" class="bg-primary hover:bg-opacity-90 text-white px-3 rounded-full py-1 ms-2">Re-Center</button>
      </div>
      <MapDashboard class="z-20" :recenter="recenterTrigger" />
    </div>
    <div 
      class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-3 xl:grid-cols-4 2xl:gap-7.5 z-999 xl:absolute xl:bottom-50 xl:opacity-50 hover:opacity-100 xl:relative xl:px-4 lg:static mt-5 lx:mt-0"
      :class="isHiddenStatistic ? 'hidden': ''"
    >
      <DataStatsOne />
    </div>
  </DefaultLayout>
</template>
