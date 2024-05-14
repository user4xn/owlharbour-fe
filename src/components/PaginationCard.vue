<template>
  <div class="flex items-center justify-center mt-5">
    <button
      class="rounded-s-full bg-primary p-2 text-white hover:opacity-80 w-16.5"
      :disabled="currentPage === 1"
      @click="prevPage"
    >
      Prev
    </button>
    <button
      v-for="page in pagesToShow"
      :key="page"
      class="bg-primary p-2 text-white hover:opacity-80 w-14.5"
      :class="{ 'opacity-50': page === currentPage }"
      :disabled="page === currentPage"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>
    <button
      class="rounded-e-full bg-primary p-2 text-white hover:opacity-80 w-16.5"
      :disabled="currentPage === totalPages"
      @click="nextPage"
    >
      Next
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['pageChange']);

const prevPage = () => {
  if (props.currentPage > 1) {
    emit('pageChange', props.currentPage - 1);
  }
};

const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('pageChange', props.currentPage + 1);
  }
};

const goToPage = (page: number) => {
  emit('pageChange', page);
};

const pagesToShow = computed(() => {
  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, props.currentPage - 2);
  let endPage = Math.min(props.totalPages, props.currentPage + 2);

  if (props.totalPages > maxPagesToShow) {
    if (endPage - startPage + 1 < maxPagesToShow) {
      if (startPage === 1) {
        endPage = maxPagesToShow;
      } else if (endPage === props.totalPages) {
        startPage = props.totalPages - maxPagesToShow + 1;
      }
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});
</script>
