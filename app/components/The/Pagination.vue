<!-- components/ThePagination.vue -->
<template>
  <div>
    <!-- Slot برای محتوای اصلی -->
    <div class="flex gap-4 flex-wrap mt-4">
      <slot :paginatedData="paginatedData" />
    </div>

    <!-- Pagination -->
    <div v-if="data?.length > itemsPerPage" class="flex justify-center mt-6">
      <vue-awesome-paginate
        :total-items="data.length"
        v-model="currentPage"
        :items-per-page="itemsPerPage"
        :max-pages-shown="4"
        @click="onClickHandler"
        dir="ltr"
        :disable-breakpoint-buttons="true"
        :hide-prev-next-when-ends="true"
      >
        <template #prev-button>
          <TheNuxtIcon name="Arrow-right2" icon-type="svg" class="!svg:h-3 !svg:w-3 !text-primary-500" />
        </template>
        <template #next-button>
          <TheNuxtIcon name="Arrow-left" icon-type="svg" class="!svg:h-3 !svg:w-3 !text-primary-500" />
        </template>
      </vue-awesome-paginate>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  data: any[]
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 9
})

// pagination setup
const currentPage = ref(1);

const paginatedData = computed(() => {
  const allData = props.data || [];
  const start = (currentPage.value - 1) * props.itemsPerPage;
  return allData.slice(start, start + props.itemsPerPage);
});

const onClickHandler = (page: number) => {
  currentPage.value = page;
};
</script>

<style>
.pagination-container {
  display: flex;
  column-gap: 10px;
}

.paginate-buttons {
  height: 40px;
  width: 40px;
  border-radius: 10px;
  cursor: pointer;
  background-color: transparent;
  border: 1px solid transparent;
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
}

.paginate-buttons:hover {
  background-color: #d8d8d8;
}

.active-page {
  background-color: #6e6641;
  color: white;
}
</style>