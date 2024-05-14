<script setup lang="ts">
import { useApiFetch } from '@/composables/axios'
import type { ApiResponse } from '@/interfaces/api'
import type { ShipDataInterface } from '@/interfaces/ship'
import { onMounted, reactive, ref, type Ref } from 'vue'
import { RouterLink } from 'vue-router'
import WalkGif from '@/assets/images/map/walk.gif'
import SeaGif from '@/assets/images/map/sea.gif'
import debounce from 'lodash.debounce'
import Pagination from '@/components/PaginationCard.vue'

const shipsData: Ref<ShipDataInterface[]> = ref([])
const searchInput = ref('')
const textBlank = ref('loading...')
const limit = 6
const offset = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)

onMounted(() => {
  fetchShips()
})

const fetchShips = debounce(async(params: string='') => {
  textBlank.value = 'loading...'
  try {
    let paramBuilded = `limit=${limit}&offset=${offset.value}&`
    if (params != ''){
      paramBuilded += `search=${params}&`
    }

    const fetch: any = await useApiFetch<ApiResponse>(`/api/v1/ship/list?${paramBuilded}`)

    if(fetch.meta.code != 200) {
      console.error('failed fetching statistic api ', fetch.meta.message ?? "", fetch.meta.code)
    }

    shipsData.value = []

    if(fetch.data == null) {
      textBlank.value = 'no ship found'

      return
    }

    shipsData.value = fetch.data as ShipDataInterface[]

    if (fetch.meta.total ?? 10) {
      totalPages.value = Math.ceil(fetch.meta.total ?? 10 / limit);
    }
  } catch (error) {
    console.error('error on trying fetch', error)
  }
}, 500)

function borderByStatus(status: string) {
  switch (status) {
    case "checkin":
      return "border-green-300"
    case "checkout":
      return "border-red"
    case "out of scope":
      return "border-gray"
      break;
  
    default:
      return "border-gray"
      break;
  }
}

function handlePageChange(page: number) {
  currentPage.value = page;
  offset.value = (page - 1) * limit;
  fetchShips(searchInput.value);
}
</script>

<template>
  <div
    class="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4"
  >
    <div class="px-5">
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
          placeholder="Search ship..."
          class="w-full xl:w-125 bg-transparent pr-4 pl-9 focus:outline-none"
          v-model="searchInput"
          @keyup="fetchShips(searchInput)"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-3 px-5 mt-5">
      <template v-for="(ship, index) in shipsData" :key="index" class="flex flex-col gap-9">
        <RouterLink
          :to="`/ship/${ship.id}/detail`"
          class="flex items-center gap-5 py-4 px-7.5 hover:opacity-80 dark:hover:bg-meta-4 text-white rounded-2xl area"
        >
        <div class="flex-grow grid grid-cols-4 grid-flow-col gap-4">
          <div class="flex-grow col-span-4 md:col-span-4">
            <div class="flex flex-col mb-3">
              <span class="text-lg font-extrabold text-white uppercase">🚢 {{ ship.ship_name }}</span>
              <span class="text-lg font-extrabold text-white uppercase">🤵🏻 {{ ship.responsible_name }}</span>
            </div>
            <hr>
            <div class="flex mt-3 flex-col relative">
              <span class="text-md font-medium text-white uppercase">📱 {{ ship.device_id }}</span>
              <span class="text-md font-medium text-white uppercase">📅 {{ ship.created_at }}</span>
            </div>
          </div>
          <div class="flex justify-center content-center items-center hidden md:block z-20">
            <div 
              class="flex h-17.5 w-17.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 border border-4"
              :class="borderByStatus(ship.status)"
            >
              <img :src="ship.on_ground == 1 ? WalkGif : SeaGif" class="rounded-full">
            </div>
          </div>
        </div>
        <ul class="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        </RouterLink>
      </template>
      <div v-if="!shipsData || shipsData.length == 0" class="text-center col-span-2">
        <span class="text-lg">{{ textBlank }}</span>
      </div>
    </div>
    <Pagination :currentPage="currentPage" :totalPages="totalPages" @pageChange="handlePageChange" />
  </div>
</template>

<style scoped>
/*Start Animations*/
@-webkit-keyframes animatetop {
	from {
		top: -300px;
		opacity: 0;
	}
	to {
		top: 0;
		opacity: 1;
	}
}
@keyframes animatetop {
	from {
		top: -300px;
		opacity: 0;
	}
	to {
		top: 0;
		opacity: 1;
	}
}
@-webkit-keyframes zoomIn {
	0% {
		opacity: 0;
		-webkit-transform: scale3d(0.3, 0.3, 0.3);
		transform: scale3d(0.3, 0.3, 0.3);
	}
	50% {
		opacity: 1;
	}
}
@keyframes zoomIn {
	0% {
		opacity: 0;
		-webkit-transform: scale3d(0.3, 0.3, 0.3);
		transform: scale3d(0.3, 0.3, 0.3);
	}
	50% {
		opacity: 1;
	}
}
/*End Animations*/
/*
-- Start BackGround Animation 
*/
.area {
	background: #3c50e0;
	background: -webkit-linear-gradient(to left, #8f94fb, #3c50e0);
	position: sticky;
	z-index: 200;
}

.circles {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 96%;
	overflow: hidden;
}

.circles li {
	position: absolute;
	display: block;
	list-style: none;
	width: 20px;
	height: 20px;
	background: rgba(255, 255, 255, 0.2);
	animation: animate 25s linear infinite;
	bottom: -150px;
}

.circles li:nth-child(1) {
	left: 25%;
	width: 80px;
	height: 80px;
	animation-delay: 0s;
}

.circles li:nth-child(2) {
	left: 10%;
	width: 20px;
	height: 20px;
	animation-delay: 2s;
	animation-duration: 12s;
}

.circles li:nth-child(3) {
	left: 70%;
	width: 20px;
	height: 20px;
	animation-delay: 4s;
}

.circles li:nth-child(4) {
	left: 40%;
	width: 60px;
	height: 60px;
	animation-delay: 0s;
	animation-duration: 18s;
}

.circles li:nth-child(5) {
	left: 65%;
	width: 20px;
	height: 20px;
	animation-delay: 0s;
}

.circles li:nth-child(6) {
	left: 75%;
	width: 110px;
	height: 110px;
	animation-delay: 3s;
}

.circles li:nth-child(7) {
	left: 35%;
	width: 150px;
	height: 150px;
	animation-delay: 7s;
}

.circles li:nth-child(8) {
	left: 50%;
	width: 25px;
	height: 25px;
	animation-delay: 15s;
	animation-duration: 45s;
}

.circles li:nth-child(9) {
	left: 20%;
	width: 15px;
	height: 15px;
	animation-delay: 2s;
	animation-duration: 35s;
}

.circles li:nth-child(10) {
	left: 85%;
	width: 150px;
	height: 150px;
	animation-delay: 0s;
	animation-duration: 11s;
}

@keyframes animate {
	0% {
		transform: translateY(0) rotate(0deg);
		opacity: 1;
		border-radius: 0;
	}

	100% {
		transform: translateY(-1000px) rotate(720deg);
		opacity: 0;
		border-radius: 50%;
	}
}
/*
-- End BackGround Animation 
*/
</style>