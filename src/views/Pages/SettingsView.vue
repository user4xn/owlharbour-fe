<script setup lang="ts">
import { ref } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import HarbourSettingsCard from '@/components/HarbourSettingsCard.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const pageTitle = ref('Harbour Setting')
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto">
      <!-- Breadcrumb Start -->
      <BreadcrumbDefault :pageTitle="pageTitle" />
      <!-- Breadcrumb End -->
      <HarbourSettingsCard />
    </div>
  </DefaultLayout>
</template>
