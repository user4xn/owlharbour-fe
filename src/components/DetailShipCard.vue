<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import MapShipDetail from './Maps/MapShipDetail.vue'
import { useApiFetch } from '@/composables/axios'
import type { ApiResponse } from '@/interfaces/api'
import { useRoute } from 'vue-router'
import type { DockingLogsInterface, LocationLogsInterface } from '@/interfaces/ship'

const currentDate = new Date()
const aweekAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000))
const thisRoute = useRoute()
const recenterTrigger = ref(false)
const dockingLogs: Ref<DockingLogsInterface[]> = ref([])
const dateStart = ref(aweekAgo.toISOString().slice(0, 10))
const dateEnd = ref(currentDate.toISOString().slice(0, 10))
const historyLocation: Ref<LocationLogsInterface[]> = ref([])

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

async function searchHistory() {
  var paramId = thisRoute.params.id
  let paramBuilded = `start_date=${dateStart.value}&end_date=${dateEnd.value}`

  try {
    const res: any = await useApiFetch<ApiResponse>(`/api/v1/ship/location-log/${paramId}?${paramBuilded}`)
    if(res.meta.code != 200) {
      console.error('failed fetching location log api ', res.meta.message ?? "", res.meta.code)
      return
    }

    historyLocation.value = res.data.location_logs as LocationLogsInterface[]
  } catch (error) {
    console.error('error on trying fetch', error)
  } finally {
  }
}
</script>

<template>
  <div class="relative" v-if="props.shipData.current_lat && props.shipData.current_long">
    <div class="absolute z-30 right-4 top-4 opacity-50 hover:opacity-100">
      <button @click="triggerRecenter" class="bg-primary hover:bg-opacity-90 text-white px-3 rounded-full py-1 ms-2">Re-Center</button>
    </div>
    <MapShipDetail :shipData="props.shipData" :recenter="recenterTrigger" :locationLogs="historyLocation"/>
  </div>
  <div class="grid grid-cols-5 gap-8 mt-5">
    <div class="col-span-5" v-if="props.shipData.current_lat && props.shipData.current_long">
      <div class="flex justify-center">
        <h3 class="text-md font-medium mb-3">Location History</h3>
      </div>
      <div class="flex justify-center">
        <input class="bg-white p-4 w-4/12" type="date" v-model="dateStart">
        <span class="bg-white p-4 border-x border-gray px-6">to</span>
        <input class="bg-white p-4 w-4/12" type="date" v-model="dateEnd">
  
        <button @click="searchHistory" class="p-4 bg-primary hover:opacity-80 justify-end">
          <svg
            class="fill-white"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
              fill=""
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
              fill=""
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="col-span-5 xl:col-span-3">
      <div
        class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 class="font-medium text-black dark:text-white">Ship Information</h3>
        </div>
        <div class="p-7">
          <div class="flex justify-end">
            <ul class="flex-grow">
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Register Date:</h3>
                <h3 class="font-medium text-black dark:text-white">{{ props.shipData.created_at }}</h3>
              </li>
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
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.type == '' ? '-' : props.shipData.detail.type }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Dimension:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.dimension == '' ? '-' : props.shipData.detail.dimension }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Registered Harbour:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.harbour == '' ? '-' : props.shipData.detail.harbour }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">SIUP:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.siup == '' ? '-' : props.shipData.detail.siup }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">BKP:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.bkp == '' ? '-' : props.shipData.detail.bkp }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Selar Mark:</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.selar_mark == '' ? '-' : props.shipData.detail.selar_mark }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Gross Tonnage (GT):</h3>
                <h3 class="font-medium text-black dark:text-white uppercase">{{ props.shipData.detail.gt == '' ? '-' : props.shipData.detail.gt }}</h3>
              </li>
              <li class="my-2 flex flex-row justify-between border-b border-gray pb-3">
                <h3 class="font-medium text-black dark:text-white">Owner Name:</h3>
                <h3 class="font-medium text-black dark:text-white">{{ props.shipData.detail.owner_name == '' ? '-' : props.shipData.detail.owner_name }}</h3>
              </li>
            </ul>
          </div>
          <button class="bg-primary py-2 mt-3 w-max text-white px-5 rounded-md"> Edit </button>
        </div>
      </div>
    </div>

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
                <h3 class="font-medium uppercase" :class="log.status == 'checkin' ? 'text-success' : 'text-danger'">{{ log.status }}</h3>
              </li>
              <li v-if="dockingLogs == null" class="my-2 flex flex-row justify-center">
                <h3 class="font-medium text-muted dark:text-white">No Data</h3>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
