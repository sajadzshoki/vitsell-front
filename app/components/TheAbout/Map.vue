<template>
  <div class="about-neshan relative h-72 md:h-96 rounded-2xl overflow-hidden border border-muted bg-muted">
    <ClientOnly>
      <NeshanMap
        ref="mapRef"
        class="about-neshan__canvas"
        :map-key="mapKey"
        :service-key="serviceKey"
        :poi="false"
        :traffic="false"
        default-type="dreamy-gold"
        :zoom="15"
        :hide-search-container="true"
        :hide-layers="true"
        :cluster="false"
        :center="center"
        :reverse-on-click="false"
        :popup-on-marker-hover="false"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import NeshanMap from '@neshan-maps-platform/vue3-openlayers'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Vector } from 'ol/layer'
import { Vector as SourceVector } from 'ol/source'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { fromLonLat } from 'ol/proj'

const props = defineProps<{
  latitude: number
  longitude: number
}>()

const config = useRuntimeConfig()
const mapKey = String(config.public.neshanMapKey || '')
const serviceKey = String(config.public.neshanServiceKey || '')

const mapRef = ref<InstanceType<typeof NeshanMap> | null>(null)
const center = computed(() => ({
  latitude: props.latitude,
  longitude: props.longitude,
}))

let markerLayer: Vector<SourceVector> | null = null

function placeMarker() {
  const olMap = mapRef.value?.state?.map
  if (!olMap) return

  const view = olMap.getView()
  view.setCenter(fromLonLat([props.longitude, props.latitude]))
  view.setZoom(15)

  if (markerLayer) olMap.removeLayer(markerLayer)

  const styles = import.meta.client ? getComputedStyle(document.documentElement) : null
  const brand = styles?.getPropertyValue('--ui-primary').trim() || '#2563EB'
  const ring = styles?.getPropertyValue('--ui-bg').trim() || '#ffffff'

  markerLayer = new Vector({
    source: new SourceVector({
      features: [
        new Feature(new Point(fromLonLat([props.longitude, props.latitude]))),
      ],
    }),
    style: new Style({
      image: new CircleStyle({
        radius: 9,
        fill: new Fill({ color: brand }),
        stroke: new Stroke({ color: ring, width: 2 }),
      }),
    }),
  })
  olMap.addLayer(markerLayer)
}

watch(() => mapRef.value?.state?.map, (map) => {
  if (map) placeMarker()
})

watch(() => [props.latitude, props.longitude], () => {
  placeMarker()
})
</script>

<style>
@import '../../../node_modules/@neshan-maps-platform/vue3-openlayers/dist/style.css';

.about-neshan__canvas,
.about-neshan .ol-viewport {
  width: 100%;
  height: 100%;
  min-height: 18rem;
}
</style>
