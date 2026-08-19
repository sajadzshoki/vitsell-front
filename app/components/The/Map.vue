<template>
  <ClientOnly>
    <NeshanMap
        ref="map"
        mapKey="web.e700c29d8d1a401486bfaeb3e73b2aae"
        service-key="service.fb1104a0cb8042ce86199bef4d827934"
        :poi="true"
        :traffic="true"
        default-type="dreamy-gold"
        :zoom="13"
        :hide-search-container="true"
        :hide-layers="true"
        :cluster="true"
        :center="center"
        :reverse-on-click="false"
        :popup-on-marker-hover="false"
        @on-click="emitData"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import NeshanMap from "@neshan-maps-platform/vue3-openlayers"
import {Feature} from "ol";
import {Vector} from "ol/layer";
import {Vector as SourceVector} from "ol/source";
import {Style, Icon, Stroke, Fill} from "ol/style";
import {Point} from "ol/geom";
import {fromLonLat,transform} from "ol/proj";
import {Polyline} from "ol/format";

import type {Point as PointType} from '~/@types/app'

const emit = defineEmits(['select-point'])
const props = defineProps<{
  points: (PointType | undefined)[]
  line?: string
  draw?: boolean
  remove?: boolean,
}>()

const center = ref({ latitude: 35.70222201840939, longitude: 51.35178336960962 })
const {coords, pause} = useGeolocation()
watch(() => coords.value,(e)=>{
  console.log(e)
  pause()
  map.value?.state.map.getView().setCenter(transform([coords.value.longitude, coords.value.latitude], 'EPSG:4326', 'EPSG:3857'))
})
const emitData = (e: any) => {
  emit('select-point', e)
}
const map = ref<InstanceType<typeof NeshanMap> | null>(null)
const filteredPoints = computed(() => props.points.filter(e => e) as PointType[])

const addVector = (e: PointType) => {
  return new Vector({
    source: new SourceVector(),
    style: new Style({
      image: new Icon({
        src: e?.image,
        anchor: e?.anchor || [0.5, 0],
        anchorOrigin: 'bottom-left'
      }),
    }),
  });
}

const dataToFeature = (e: PointType) => {
  return new Feature(new Point(fromLonLat(e.coords)))
}

const refreshPoints = async () => {
  if (props.remove) {
    const layers = map.value?.state?.map?.getLayers()
    for (let i = 0; i < layers?.array_?.length; i++) {
      const l = layers.array_[i]
      if (l?.style_) {
        await map.value?.state?.map?.removeLayer(l)
      }
    }
  }
  filteredPoints.value.forEach((e) => {
    const layer = addVector(e)
    map.value?.state?.map?.addLayer(layer);
    layer?.getSource()?.addFeature(dataToFeature(e));
  })
  if (props.draw && filteredPoints.value.length === 2) {
    const line = await direction(props.points[0]?.coords as [number, number], props.points[1]?.coords as [number, number])
    drawLine(line)
  }
  // map.value?.state?.map?.getLayers().toArray()[0].addFeature(feature)
}
watch(() => JSON.stringify(props.points), () => {
  refreshPoints()
})
watch(() => props.line, () => {
  if (!props.line) return
  drawLine(props.line)
})
watch(() => map.value?.state?.map, () => {
  if (props.points.length) {
    refreshPoints()
  }
})

const drawLine = (l: string) => {
  const format = new Polyline({factor: 1e5})
  const line = format.readGeometry(l, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });
  const feature = new Feature({type: 'route', geometry: line});
  const source = new Vector({
    source: new SourceVector(),
    style: new Style({
      stroke: new Stroke({
        width: 6, color: '#255'
      })
    }),
  });
  source.getSource()?.addFeature(feature)
  map.value?.state?.map?.addLayer(source)
}

</script>


<style>
@import '../../../node_modules/@neshan-maps-platform/vue3-openlayers/dist/style.css';
</style>



