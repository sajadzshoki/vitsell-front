<template>
  <div class="w-full">
    <div class="max-w-[380px] mx-auto w-full select-none">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        class="compare-radar-svg w-full h-auto overflow-visible"
        role="img"
        :aria-label="$t('نمودار راداری مقایسه محصولات')"
      >
        <polygon
          v-for="(points, ringIndex) in rings"
          :key="ringIndex"
          :points="points"
          :fill="ringIndex === rings.length - 1 ? 'var(--ui-bg-muted)' : 'none'"
          stroke="var(--ui-border-muted)"
          stroke-width="1"
        />

        <line
          v-for="(_, axisIndex) in criteria"
          :key="`axis-${axisIndex}`"
          :x1="centerX"
          :y1="centerY"
          :x2="axisPoint(axisIndex, radius).x"
          :y2="axisPoint(axisIndex, radius).y"
          stroke="var(--ui-border-muted)"
          stroke-width="1"
        />

        <g
          v-for="{ item: seriesItem, index: seriesIndex } in seriesRenderOrder"
          :key="seriesItem.name"
          class="cursor-pointer"
          :style="{ transition: 'opacity 200ms', opacity: seriesOpacity(seriesIndex) }"
          @mouseenter="activeSeries = seriesIndex"
          @mouseleave="activeSeries = null"
          @click="toggleSeries(seriesIndex)"
        >
          <polygon
            :points="polygonFor(seriesItem.values)"
            :fill="seriesItem.color"
            fill-opacity="0.14"
            :stroke="seriesItem.color"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <circle
            v-for="(value, valueIndex) in seriesItem.values"
            :key="`${seriesItem.name}-${valueIndex}`"
            :cx="dataPoint(valueIndex, value).x"
            :cy="dataPoint(valueIndex, value).y"
            r="3.2"
            :fill="seriesItem.color"
            stroke="#fff"
            stroke-width="1.5"
          />
        </g>

        <text
          v-for="(criterion, criterionIndex) in criteria"
          :key="criterion"
          :x="labelMeta(criterionIndex).x"
          :y="labelMeta(criterionIndex).y"
          :text-anchor="labelMeta(criterionIndex).anchor"
          :dominant-baseline="labelMeta(criterionIndex).baseline"
        >
          {{ criterion }}
        </text>
      </svg>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 mt-3">
      <button
        v-for="(seriesItem, seriesIndex) in series"
        :key="seriesItem.name"
        type="button"
        class="flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[11px] font-medium transition-all  border-2"
        :class="legendClass(seriesIndex)"
        :style="legendStyle(seriesIndex)"
        @mouseenter="activeSeries = seriesIndex"
        @mouseleave="activeSeries = null"
        @click="toggleSeries(seriesIndex)"
      >
        <span
          class="size-2.5 rounded-full shrink-0"
          :style="{ background: seriesItem.color }"
        />
        <span class="max-w-28 truncate">{{ seriesItem.name }}</span>
      </button>
    </div>

    <p class="text-center text-[10px] text-dimmed mt-2">
      {{ $t('امتیازهای نرمال‌شده بر اساس معیارهای هر دسته‌بندی (۰ تا ۱۰۰)') }}
    </p>
  </div>
</template>

<script setup lang="ts">
export type RadarSeries = {
  name: string
  color: string
  values: number[]
}

const props = defineProps<{
  criteria: string[]
  series: RadarSeries[]
}>()

const width = 360
const height = 360
const centerX = width / 2
const centerY = height / 2
const radius = 88

const activeSeries = ref<number | null>(null)

const count = computed(() => props.criteria.length)

const seriesRenderOrder = computed(() =>
  props.series.map((item, index) => ({ item, index })).reverse(),
)

const rings = computed(() =>
  [0.25, 0.5, 0.75, 1].map((ratio) => {
    return props.criteria.map((_, index) => {
      const point = axisPoint(index, radius * ratio)
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`
    }).join(' ')
  }),
)

function angle(index: number) {
  return -Math.PI / 2 + (index * 2 * Math.PI) / count.value
}

function axisPoint(index: number, distance: number) {
  const currentAngle = angle(index)
  return {
    x: centerX + distance * Math.cos(currentAngle),
    y: centerY + distance * Math.sin(currentAngle),
  }
}

function dataPoint(index: number, value: number) {
  const clamped = Math.max(0, Math.min(100, value))
  return axisPoint(index, (clamped / 100) * radius)
}

function polygonFor(values: number[]) {
  return values
    .map((value, index) => {
      const point = dataPoint(index, value)
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`
    })
    .join(' ')
}

function labelMeta(index: number) {
  const cos = Math.cos(angle(index))
  const sin = Math.sin(angle(index))
  const point = axisPoint(index, radius + 22)
  const anchor: 'middle' | 'start' | 'end' =
    Math.abs(cos) < 0.35 ? 'middle' : cos > 0 ? 'start' : 'end'
  const baseline: 'middle' | 'hanging' | 'auto' =
    sin < -0.55 ? 'auto' : sin > 0.55 ? 'hanging' : 'middle'

  return {
    x: point.x,
    y: point.y,
    anchor,
    baseline,
  }
}

function seriesOpacity(seriesIndex: number) {
  if (activeSeries.value === null || activeSeries.value === seriesIndex) return 1
  return 0.15
}

function toggleSeries(seriesIndex: number) {
  activeSeries.value = activeSeries.value === seriesIndex ? null : seriesIndex
}

function legendClass(seriesIndex: number) {
  const isActive = activeSeries.value === seriesIndex
  const isDimmed = activeSeries.value !== null && !isActive

  if (isActive) {
    return 'bg-muted text-highlighted'
  }

  return [
    'border-transparent bg-muted/60 text-toned hover:bg-muted',
    isDimmed ? 'opacity-40' : '',
  ]
}

function legendStyle(seriesIndex: number) {
  const color = props.series[seriesIndex]?.color
  if (!color) return undefined
  return activeSeries.value === seriesIndex
    ? { borderColor: color }
    : undefined
}
</script>

<style scoped>
.compare-radar-svg text {
  font-size: 10px;
  font-weight: 700;
  fill: var(--ui-text-toned);
  pointer-events: none;
}
</style>
