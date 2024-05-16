<script setup lang="ts">
import { useApiFetch } from '@/composables/axios';
import type { ApiResponse } from '@/interfaces/api';
import type { PairingListInterface } from '@/interfaces/pairing';
import { onMounted, ref, watch, type Ref } from 'vue'
import debounce from 'lodash.debounce';
import Pagination from '../PaginationCard.vue';
import StartToastifyInstance from 'toastify-js';

const pairingList: Ref<PairingListInterface[]> = ref([])
const searchInput = ref('')
const textBlank = ref('loading...')
const limit = ref(10)
const offset = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const filter = ref('pending')
const allSelected = ref(false)
const selectedItems: Ref<number[]> = ref([])
const currentTab: any = ref('pending')

const tabs = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
]

const switchTab = (tab: string) => {
  currentTab.value = tab
}

watch(() => currentTab.value, (newValue) => {
  switch (newValue) {
    case 'pending':
      filter.value = 'pending'
      break;
    case 'approved':
      filter.value = 'approved'
      break;
    case 'rejected':
      filter.value = 'rejected'
      break;
    default:
      filter.value = 'pending'
      break;
  }
  
  pairingList.value = []
  fetchPairingList(searchInput.value)
})

onMounted(() => {
  fetchPairingList()
})

const fetchPairingList = debounce(async(params: string='') => {
  textBlank.value = 'loading...'
  try {
    let paramBuilded = `limit=${limit.value}&offset=${offset.value}&status=${filter.value}&`
    if (params != ''){
      paramBuilded += `search=${params}&`
    }

    const fetch = await useApiFetch<ApiResponse>(`/api/v1/ship/pairing-request?${paramBuilded}`)
    
    if (fetch?.meta.code != 200) {
      console.error('failed fetching statistic api ', fetch?.meta.message ?? "", fetch?.meta.code)
      return
    }

    pairingList.value = []

    if(fetch?.data == null) {
      textBlank.value = 'No Submission Found'

      return
    }

    pairingList.value = fetch.data as PairingListInterface[]

    if (fetch?.meta.total ?? 10) {
      totalPages.value = Math.ceil(fetch?.meta.total ?? 10 / limit.value);
    }
  } catch (error) {
    console.error('error on trying fetch', error)
  }
}, 500)

function handlePageChange(page: number) {
  currentPage.value = page;
  offset.value = (page - 1) * limit.value;
  fetchPairingList(searchInput.value);
}

function selectAll() {
  allSelected.value = !allSelected.value;
  selectedItems.value = allSelected.value ? pairingList.value.map(item => item.id) : [];
}

function checkSelectAll() {
  if(selectedItems.value.length === pairingList.value.length) {
    allSelected.value = true
  } else {
    allSelected.value = false
  }
}

async function handleAction(ids: number[], status: string) {
  let pairing_id = ids.join(',')
  try {
    const res: any = await useApiFetch<ApiResponse>(`/api/v1/ship/pairing/action`, {
      method: 'PUT',
      body: {
        'pairing_id': pairing_id,
        'status': status,
      }
    })

    if(res.meta.code != 200) {
      console.error('failed handle pair data ', res.meta.message ?? "", res.meta.code)
      return
    }

    fetchPairingList(searchInput.value)

    StartToastifyInstance({
      text: `Successfully process ${ids.length} data`,
      duration: 3000,
      gravity: "bottom",
      close: true,
      className: "me-5",
    }).showToast();
  } catch (error) {
    console.error('error on trying fetch', error)

    StartToastifyInstance({
      text: `Failed to process ${ids.length} data`,
      duration: 3000,
      gravity: "bottom",
      close: true,
      className: "me-5",
    }).showToast();
  }
}
</script>

<template>
  <div class="flex space-x-4 mb-4 justify-between">
    <div class="flex space-x-4">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="switchTab(tab.value)"
        :class="{
          'bg-primary text-white': currentTab === tab.value,
          'bg-gray-200 text-gray-600': currentTab !== tab.value
        }"
        class="px-4 py-2 rounded"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="flex space-x-2">
      <button class="border-2 border-success text-success font-medium px-4 py-2 rounded-full" :class="!allSelected ? 'opacity-80' : 'hover:bg-success hover:text-white'" @click="handleAction(selectedItems, 'approved')" :disabled="!allSelected">
        Approve All
      </button>
      <button class="border-2 border-danger text-danger font-medium px-4 py-2 rounded-full" :class="!allSelected ? 'opacity-80' : 'hover:bg-danger hover:text-white'" @click="handleAction(selectedItems, 'rejected')" :disabled="!allSelected">
        Reject All
      </button>
    </div>
  </div>
  <div
    class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
  >
    <div class="max-w-full overflow-x-auto">
      <div class="flex justify-between mb-4">
        <div class="relative">
          <button class="absolute top-1/2 left-0 -translate-y-1/2">
            <svg
              class="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
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

          <input
            type="text"
            placeholder="Search ( Ship / Device ID / Responsible Person / Phone ) ..."
            class="w-full xl:w-125 bg-transparent pr-4 pl-9 focus:outline-none text-ellipsis overflow-hidden"
            v-model="searchInput"
            @keyup="fetchPairingList(searchInput)"
          />
        </div>

        <select class="bg-gray dark:bg-primary dark:text-white px-3 py-1 rounded-full" v-model="limit" @change="fetchPairingList()">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
        </select>
      </div>
      <table class="w-full table-auto">
        <thead>
          <tr class="bg-gray-2 text-left dark:bg-meta-4">
            <th :class="'min-w-[60px] py-4 px-4 font-medium text-black dark:text-white' + (currentTab != 'pending' ? 'flex justify-center' : '')">
              <input v-if="currentTab === 'pending'" type="checkbox" @click="selectAll" :checked="allSelected" />
              <span v-else>No</span>
            </th>
            <th class="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
              Ship Name
            </th>
            <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
              Responsible Person
            </th>
            <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
              Phone
            </th>
            <th class="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
              {{ currentTab === 'approved' ? 'Approved Date' : 'Submission Date' }}
            </th>
            <th v-if="currentTab === 'pending'" class="py-4 px-4 font-medium text-black dark:text-white">Actions / Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in pairingList" :key="index">
            <td v-if="currentTab === 'pending'" class="py-5 px-4">
              <input type="checkbox" v-model="selectedItems" :value="item.id" @change="checkSelectAll">
            </td>
            <td v-else class="py-5 px-4">
              <p class="text-black dark:text-white flex justify-center">{{ index+1 }}</p>
            </td>
            <td class="py-5 px-4 pl-9 xl:pl-11">
              <h5 class="text-black dark:text-white">{{ item.ship_name }}</h5>
            </td>
            <td class="py-5 px-4">
              <p class="text-black dark:text-white">{{ item.responsible_name }}</p>
            </td>
            <td class="py-5 px-4">
              <p class="text-black dark:text-white">{{ item.phone }}</p>
            </td>
            <td class="py-5 px-4">
              <p class="text-black dark:text-white">{{ item.created_at }}</p>
            </td>
            <td v-if="currentTab === 'pending'" class="py-5 px-4">
              <div class="flex items-center space-x-3.5">
                <button class="hover:opacity-80 bg-success text-white px-3 py-1 rounded-md min-w-[110px] flex items-center" @click="handleAction([item.id], 'approved')">
                  <svg class="me-2" width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12.9L7.14286 16.5L15 7.5" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M20 7.5625L11.4283 16.5625L11 16" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                  Approve
                </button>
                <button class="hover:opacity-80 bg-danger text-white px-3 py-1 rounded-md min-w-[110px] flex items-center" @click="handleAction([item.id], 'rejected')">
                  <svg class="me-2" width="20px" height="20px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.96967 16.4697C6.67678 16.7626 6.67678 17.2374 6.96967 17.5303C7.26256 17.8232 7.73744 17.8232 8.03033 17.5303L6.96967 16.4697ZM13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697L13.0303 12.5303ZM11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303L11.9697 11.4697ZM18.0303 7.53033C18.3232 7.23744 18.3232 6.76256 18.0303 6.46967C17.7374 6.17678 17.2626 6.17678 16.9697 6.46967L18.0303 7.53033ZM13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303L13.0303 11.4697ZM16.9697 17.5303C17.2626 17.8232 17.7374 17.8232 18.0303 17.5303C18.3232 17.2374 18.3232 16.7626 18.0303 16.4697L16.9697 17.5303ZM11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697L11.9697 12.5303ZM8.03033 6.46967C7.73744 6.17678 7.26256 6.17678 6.96967 6.46967C6.67678 6.76256 6.67678 7.23744 6.96967 7.53033L8.03033 6.46967ZM8.03033 17.5303L13.0303 12.5303L11.9697 11.4697L6.96967 16.4697L8.03033 17.5303ZM13.0303 12.5303L18.0303 7.53033L16.9697 6.46967L11.9697 11.4697L13.0303 12.5303ZM11.9697 12.5303L16.9697 17.5303L18.0303 16.4697L13.0303 11.4697L11.9697 12.5303ZM13.0303 11.4697L8.03033 6.46967L6.96967 7.53033L11.9697 12.5303L13.0303 11.4697Z" fill="#FFFFFF"></path> </g></svg>
                  Reject
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!pairingList || pairingList.length == 0">
            <td colspan="6" class="py-5 px-4 text-center">
              <span class="text-md text-muted">{{ textBlank }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination class="pb-3" :currentPage="currentPage" :totalPages="totalPages" @pageChange="handlePageChange" />
    </div>
  </div>
</template>
