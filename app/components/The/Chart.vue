<template>
  <div class="flex flex-col gap-2 items-stretch">
    <TrendChart
        v-if="dataset?.length && dataset[0]?.data.length > 1"
        id="history-chart"
        :class="[background ? background : 'bg-primary-super-light']"
        :datasets="dataset"
        :grid="grid"
        :interactive="true"
        :labels="labels"
        :min="minValue"
        padding="10 0"
        class="font-semibold w-full grow"
        @mouse-move="chartHover">
    </TrendChart>
    <div v-if="chartLabels?.length" class="flex flex-wrap gap-3 justify-center">
      <label v-for="(item,index) in chartLabels" class="flex items-center gap-2 cursor-pointer">
        <input class="peer" type="checkbox" :value="index" v-model="selected" hidden/>
        <span class="w-3.5 h-3.5 rounded-1 peer-checked:bg-primary-500 outline-(1 solid gray-8 offset-1)"/>
        <b class="text-sm" :class="`text${index}`">
          {{ item }}
        </b>
      </label>
    </div>
    <div class="flex items-center gap-2 bg-white rounded-full py-1.5 px-3 justify-between">
      <label v-for="n in ['1 h','1 w','1 M','6 M','1 y']" class="flex items-center">
        <input v-model="duration" class="peer" type="radio" :value="n" hidden>
        <small
            class="rounded-full border-(1 solid transparent) bg-gray-200 text-gray-7 uppercase px-4 py-0.5 text-xs cursor-pointer peer-checked:(bg-primary-300 border-primary-400 text-primary-500 cursor-default font-bold)">
          {{ n }}
        </small>
      </label>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  dataList?: any[][]
  background?: String
  xLabels?: any[]
  chartLabels?: any[]
  yDecimal?: number
  minValue?: number
  yLabelsTextFormatter?: (e: any) => string
  xLabelsTextFormatter?: (e: any) => string
}>()

const emit = defineEmits(['hover'])
const selected = ref<number[]>([])
const duration = defineModel('duration',{default:'1 M'})
const dataset = computed(() => props.dataList?.map((e, i) => ({
  data: e || [0],
  smooth: true,
  showPoints: false,
  fill: true,
  className: `curve${i}`
}))?.filter((_, i) => selected.value.includes(i)))

const grid = {
  verticalLines: false,
  horizontalLines: true
}

const labels = computed(() => ({
  xLabels: props.xLabels || [],
  yLabels: props.yDecimal || 3,
  yLabelsTextFormatter: props.yLabelsTextFormatter,
  xLabelsTextFormatter: props.xLabelsTextFormatter,
}))

const chartHover = (params) => {
  emit("hover", params)
}

onMounted(() => {
  selected.value = Array.from(props.dataList?.keys())
})
</script>

<style lang="scss">

.text0 {
  @apply text-primary-400
}

.text1 {
  @apply text-red
}

.text2 {
  @apply text-orange
}

.text3 {
  @apply text-green-500
}

#history-chart {
  @apply text-xs;
  .curve0 {
    .stroke {
      @apply stroke-2 stroke-primary-400
    }

    .fill {
      @apply fill-primary-400 opacity-10
    }

    .point {
      @apply fill-primary-400 stroke-primary-400 stroke-0
    }
  }

  .curve1 {
    .stroke {
      @apply stroke-2 stroke-red
    }

    .fill {
      @apply fill-red opacity-5
    }

    .point {
      @apply fill-red stroke-red stroke-1
    }
  }

  .curve2 {
    .stroke {
      @apply stroke-2 stroke-orange
    }

    .fill {
      @apply fill-orange opacity-5
    }

    .point {
      @apply fill-orange stroke-orange stroke-1
    }
  }

  .curve3 {
    .stroke {
      @apply stroke-2 stroke-green-500
    }

    .fill {
      @apply fill-green-500 opacity-5
    }

    .point {
      @apply fill-green-500 stroke-green-500 stroke-1
    }
  }

  .labels {
    .y-labels, .x-labels {
      @apply fill-gray-5 stroke-0 text-2xs
    }

    .x-labels .label:last-child text {
      @apply transform -translate-x-8ch
    }

    .x-labels .label:first-child text {
      @apply transform translate-x-5ch
    }

  }

  .active-line {
    @apply stroke-gray-9/50
  }

  .point {
    @apply stroke-2 transition-all duration-200
  }

  .point.is-active {
    @apply stroke-5
  }
}
</style>
