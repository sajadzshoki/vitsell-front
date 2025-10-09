<template>
  <ClientOnly>
    <NeshanMap
        ref="map"
        mapKey="web.e700c29d8d1a401486bfaeb3e73b2aae"
        service-key="service.fb1104a0cb8042ce86199bef4d827934"
        :poi="true"
        :traffic="true"
        default-type="dreamy-gold"
        :zoom="15"
        :hide-search-container="true"
        :hide-layers="true"
        :cluster="true"
        :center="center"
        :reverse-on-click="false"
        :popup-on-marker-hover="false"
        @on-click="emitData"
    />
    <slot/>
    <div
        class="absolute left-1/50 top-1/40 flex flex-col bg-white-100 rounded-lg px-1 py-2 gap-2 items-center select-none children:(bg-gray-2 w-8 h-8 p-2 flex justify-center items-center rounded-lg cursor-pointer)">
      <TheNuxtIcon @click="zoom(1)" name="charm:plus"/>
      <TheNuxtIcon @click="zoom(-1)" name="charm:minus"/>
    </div>
    <div
        class="absolute right-1/50 top-1/40 flex flex-col bg-white-100 rounded-lg px-1 py-2 gap-2 items-center select-none children:(bg-gray-2 w-8 h-8 p-2 flex justify-center items-center rounded-lg cursor-pointer)">
      <TheNuxtIcon @click="currentLocation" name="bx:current-location"/>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import NeshanMap from "@neshan-maps-platform/vue3-openlayers"
import {Feature} from "ol";
import {Vector} from "ol/layer";
import {Vector as SourceVector} from "ol/source";
import {Style, Icon, Stroke} from "ol/style";
import {Geometry, Point} from "ol/geom";
import {fromLonLat, transform} from "ol/proj";
import {Polyline} from "ol/format";

import type {Address, Point as PointType} from '~/types/app'
import {geoCodingAddress} from "~/composables/global";

const emit = defineEmits(['select-point', 'possibleLocations'])
const props = defineProps<{
  points?: (PointType | undefined)[]
  otherPoints?: (PointType | undefined)[]
  line?: string
  draw?: boolean
  remove?: boolean
  address?: string
  noSearch?: boolean
}>()

const center = ref({latitude: 35.70222201840939, longitude: 51.35178336960962})
const {coords, pause, resume} = useGeolocation()
const Map = computed(() => map.value?.state.map)
watch(() => coords.value, () => {
  pause()
  Map.value?.getView().setCenter(transform([coords.value.longitude, coords.value.latitude], 'EPSG:4326', 'EPSG:3857'))
})
const emitData = (e: any) => {
  emit('select-point', e)
}
const map = ref<InstanceType<typeof NeshanMap> | null>(null)
const filteredPoints = computed(() => props.points.filter(e => e) as PointType[])
const filteredOtherPoints = computed(() => props.otherPoints.filter(e => e) as PointType[])

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

let addedLayers: Vector<SourceVector<Feature<Geometry>>>[] = []
let addedOtherLayers: Vector<SourceVector<Feature<Geometry>>>[] = []

const refreshPoints = async () => {
  if (props.remove) {
    addedLayers.map((l) => {
      const layers = Map.value?.getLayers()
      const ll = layers.getArray().findIndex(e => e.ol_uid === l.ol_uid)
      layers?.removeAt(ll)
    })
    addedLayers = []
    // for (let i = 0; i < layers?.array_?.length; i++) {
    //   const l = layers.array_[i]
    //   console.log(i, l?.style_)
    //   if (l?.style_) {
    //     console.log(i, l)
    //     await map.value?.state?.map?.removeLayer(l)
    //   }
    // }
  }
  filteredPoints.value.forEach((e) => {
    const layer = addVector(e)
    layer?.getSource()?.addFeature(dataToFeature(e));
    addedLayers.push(layer)
  })
  if (props.draw && filteredPoints.value.length === 2) {
    const line = await direction(props.points[0]?.coords as Address, props.points[1]?.coords as Address)
    drawLine(line)
  }
  addedLayers.map(l => Map.value?.addLayer(l))
  // if (props.points?.[0] && !props.noSearch) {
  //   console.log('aaa=>>', props.points?.[0])
  //   map.value?.state.map.getView().setCenter(transform([props.points[0].coords?.[0], props.points[0].coords?.[1]], 'EPSG:4326', 'EPSG:3857'))
  // }
  // map.value?.state?.map?.getLayers().toArray()[0].addFeature(feature)
}


const refreshOtherPoints = async () => {
  addedOtherLayers.map((l) => {
    const layers = Map.value?.getLayers()
    const ll = layers.getArray().findIndex(e => e.ol_uid === l.ol_uid)
    layers.removeAt(ll)
  })
  addedOtherLayers = []
  filteredOtherPoints.value.forEach((e) => {
    const layer = addVector(e)
    layer?.getSource()?.addFeature(dataToFeature(e));
    addedOtherLayers.push(layer)
  })
  addedOtherLayers.map(l => Map.value?.addLayer(l))
}

const setCenter = (coords: Address) => {
  Map.value?.getView().setCenter(transform(coords, 'EPSG:4326', 'EPSG:3857'))
}

watch(() => JSON.stringify(props.points), () => {
  refreshPoints()
})

watch(() => JSON.stringify(props.otherPoints), () => {
  refreshOtherPoints()
})
watch(() => props.line, () => {
  if (!props.line) return
  drawLine(props.line)
})
watch(() => map.value?.state?.map, () => {
  if (props.points?.length && !addedLayers.length) {
    refreshPoints()
  }
  if (props.otherPoints?.length && !addedOtherLayers.length) {
    refreshOtherPoints()
  }
})

watch(() => props.address, _debounce(async () => {
  if (!props.address) return
  const center = Map.value?.getView().getCenter()
  const coords = transform(center, 'EPSG:3857', 'EPSG:4326')
  const area = await geoCodingAddress(props.address || '', coords)
  emit('possibleLocations', area.items)
}, 500))

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
        width: 6, color: '#2A4A86'
      })
    }),
  });
  source.getSource()?.addFeature(feature)
  addedLayers.push(source)
  // map.value?.state?.map?.addLayer(source)
}

const zoom = (number: number) => {
  const view = Map.value?.getView()
  const zoom = view.getZoom()
  view.setZoom(zoom + number);
}

const currentLocation = () => {
  resume()
}

defineExpose({map: Map, setCenter})

</script>


<style>
@import '@neshan-maps-platform/vue3-openlayers/dist/style.css';
</style>



