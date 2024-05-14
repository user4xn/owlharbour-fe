<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import MapShipDetail from './Maps/MapShipDetail.vue'
import { useApiFetch } from '@/composables/axios'
import type { ApiResponse } from '@/interfaces/api'
import { useRoute } from 'vue-router'
import type { DockingLogsInterface } from '@/interfaces/ship'

const thisRoute = useRoute()
const recenterTrigger = ref(false)
const dockingLogs: Ref<DockingLogsInterface[]> = ref([])

onMounted(() => {
  fetchDockingLog()
})

const props = defineProps(['shipData'])

function triggerRecenter() {
  recenterTrigger.value = !recenterTrigger.value
}

function currentStatus(status: string) {
  switch (status){
    case 'out of scope':
      return `bg-secondary rounded-full px-3 py-1 text-white`
    case 'checkin':
      return `bg-success rounded-full px-3 py-1 text-white`
    case 'checkout':
      return `bg-danger rounded-full px-3 py-1 text-white`
  }    
}

async function fetchDockingLog() {
  var paramId = thisRoute.params.id

  try {
    const res: any = await useApiFetch<ApiResponse>(`/api/v1/ship/dock-log/${paramId}`)
    if(res.meta.code != 200) {
      console.error('failed fetching dock-log api ', res.meta.message ?? "", res.meta.code)
      return
    }

    dockingLogs.value = res.data.docking_logs as DockingLogsInterface[]
  } catch (error) {
    console.error('error on trying fetch', error)
  } finally {
  }
}
</script>

<template>
  <div class="relative">
    <div class="absolute z-999 right-4 top-4 opacity-50 hover:opacity-100">
      <button @click="triggerRecenter" class="bg-primary hover:bg-opacity-90 text-white px-3 rounded-full py-1 ms-2">Re-Center</button>
    </div>
    <MapShipDetail :shipData="props.shipData" :recenter="recenterTrigger"/>
  </div>
  <div class="grid grid-cols-5 gap-8 mt-5">
    <!-- Personal Information Section -->
    <div class="col-span-5 xl:col-span-3">
      <div
        class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 class="font-medium text-black dark:text-white">Ship Information</h3>
        </div>
        <div class="p-7">
          <div class="flex">
            <ul class="flex-grow">
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Responsible Person:</h3>
                <h3 class="font-medium text-black dark:text-white">{{ props.shipData.responsible_name }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Device ID:</h3>
                <h3 class="font-medium text-black dark:text-white">{{ props.shipData.device_id }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Contact / Phone:</h3>
                <h3 class="font-medium text-black dark:text-white">{{ props.shipData.phone }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Current Satus:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">
                  <span :class="currentStatus(props.shipData.status)">{{ props.shipData.status }}</span>
                  <span v-if="props.shipData.on_ground" class="bg-danger rounded-full px-3 py-1 text-white ms-1">ON GROUND</span>
                </h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Ship Type:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.type }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Dimension:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.dimension }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Registered Harbour:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.harbour }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">SIUP:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.siup }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">BKP:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.bkp }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Selar Mark:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.selar_mark }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">GT:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.gt }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Owner Name:</h3>
                <h3 class="font-medium text-black dark:text-white">{{ props.shipData.detail.owner_name }}</h3>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Your Photo Section -->
    <div class="col-span-5 xl:col-span-2">
      <div
        class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 class="font-medium text-black dark:text-white">Docking Logs</h3>
        </div>
        <div class="p-7">
          <div class="flex">
            <ul class="flex-grow">
              <li v-for="(log, index) in dockingLogs" :key="index" class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">[{{ log.created_at }}]</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ log.status }}</h3>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
