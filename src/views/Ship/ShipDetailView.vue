<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DetailShipCard from '@/components/DetailShipCard.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useRoute } from 'vue-router'
import { useApiFetch } from '@/composables/axios'
import type { ApiResponse } from '@/interfaces/api'

const pageTitle = ref('SHIP')
const thisRoute = useRoute()
const shipData = ref({})
const loading = ref(true)

onMounted(() => {
    fetchShipDetail()
})

async function fetchShipDetail() {
  var paramId = thisRoute.params.id

  try {
    const res: any = await useApiFetch<ApiResponse>(`/api/v1/ship/detail/${paramId}`)
    if(res.meta.code != 200) {
      console.error('failed fetching ship detail api ', res.meta.message ?? "", res.meta.code)
      loading.value = false
      return
    }

    shipData.value = res.data
    pageTitle.value = `${res.data.ship_name.toUpperCase()}`
  } catch (error) {
    console.error('error on trying fetch', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto">
      <!-- Breadcrumb Start -->
      <BreadcrumbDefault :pageTitle="pageTitle" pageFrom="Ship" urlFrom="/ship" />
      <!-- Breadcrumb End -->
      <DetailShipCard  v-if="!loading && shipData" :shipData="shipData" />
    </div>
  </DefaultLayout>
</template>
