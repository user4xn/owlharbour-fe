<script setup lang="ts">
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import 'leaflet-rotatedmarker'
import ShipMarker from '@/assets/images/map/ship-marker.png'
import FishermanMarker from '@/assets/images/map/fisherman-marker.png'
import PinMarker from '@/assets/images/map/pin-marker.png'

// @ts-ignore
import { onMounted, watch, props } from 'vue'
import { useApiFetch } from '@/composables/axios'
import type { ApiResponse } from '@/interfaces/api'
import type { LocationLogsInterface } from '@/interfaces/ship'
import StartToastifyInstance from 'toastify-js'

const props = defineProps(['recenter', 'shipData', 'locationLogs'])

let center = { lat : -6.846155, lng : 109.128892 }
let leaflet_map: any = null
let leaflet_markers:any = []
let leaflet_layer_groups:any = null
let harbour_geo: any = []

watch(() => props.recenter, (_) => {
    reCenter()
})

watch(() => props.locationLogs, (data) => {
    initHistoryShip(data)
})

onMounted(() => {
  fetchSetting()
  initiateMap()
  processMarker(props.shipData)
  center.lat = props.shipData.current_lat
  center.lng = props.shipData.current_long
  reCenter()
})

function reCenter() {
  leaflet_map.setView([center.lat, center.lng], 15)
}

async function initiateMap() {
  const street = "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=ufCf3dbMdr7VkfVI6gjQ"

  leaflet_map = L.map("map", {attributionControl:false}).setView([center.lat, center.lng], 15)
  L.tileLayer(street, {
    maxNativeZoom: 19,
    maxZoom: 30,
    minZoom: 14,
    noWrap: true,
    attribution: ''
  }).addTo(leaflet_map)

  leaflet_layer_groups = L.layerGroup().addTo(leaflet_map)

  leaflet_map.on('zoomend', resizeMarkers)
}

async function processHarbourGeofences(geofences: any) {
  var harbour_geofence = geofences.map((item: any) => [item.lat, item.long])

  L.polygon(harbour_geofence, {
    color: "#7367F0",
    fillColor: "#A1B4FF",
    fillOpacity: 0.5
  }).addTo(leaflet_map)
}

function fetchSetting() {
  try {
    const setting = useApiFetch<ApiResponse>('/api/v1/setting/web')

    setting.then((res: any) => {
      if(res.meta.code != 200) {
        console.error('failed fetching setting api ', res.meta.message ?? "", res.meta.code)
      }

      harbour_geo = res.data.geofences

      processHarbourGeofences(harbour_geo)
    })
  } catch (error) {
    console.error('error on trying fetch', error)
  }   
}

async function processMarker(ship: any) {
  try {
    const sizeByZoom = calculateIconSize(leaflet_map.getZoom())

    var shipIcon = L.icon({
      iconUrl: ShipMarker,
      iconSize: [sizeByZoom[0], sizeByZoom[1]],
      iconAnchor: [sizeByZoom[0] / 2, sizeByZoom[1]],
    })

    var fishermanIcon = L.icon({
      iconUrl: FishermanMarker,
      iconSize: [sizeByZoom[0], sizeByZoom[1]],
    })

    var marker = L.marker([ship.current_lat, ship.current_long], {
      icon: ship.on_ground === 1 ? fishermanIcon : shipIcon
    })
    .bindTooltip(`${ship.ship_name} :Current Location`)
    .addTo(leaflet_layer_groups)
    .on("click", clickZoom)

    if(ship.on_ground == 0) {
      // @ts-ignore
      marker.setRotationAngle(ship.deg_north)
    }

    leaflet_markers[ship.ship_id] = marker
  } catch (error) {
    console.log("error add marker", error)
  }
}

function resizeMarkers() {
  const newSize = calculateIconSize(leaflet_map.getZoom())
  for (let id in leaflet_markers) {
    const marker = leaflet_markers[id]
    const newIcon = L.icon({
      iconUrl: marker.options.icon.options.iconUrl,
      iconSize: [newSize[0], newSize[1]],
      iconAnchor: [newSize[0] / 2, newSize[1]],
    })
    marker.setIcon(newIcon)
  }
}

function calculateIconSize(zoom: number) {
  const baseSize = 15
  const scaleFactor = 15 
  const size = baseSize * (zoom / scaleFactor)
  return [size, size * 2]
}

function clickZoom(e: any) {
  leaflet_map.flyTo(e.target.getLatLng(), 16, {
    duration: 5
  })
}

function initHistoryShip(data: LocationLogsInterface[]) {
  leaflet_layer_groups.clearLayers();

  if(data == null) {
    processMarker(props.shipData)

    StartToastifyInstance({
      text: "No History Found",
      duration: 3000,
      gravity: "bottom",
      close: true,
      className: "me-5",
    }).showToast();
    return
  }

  var pinIcon =  L.icon({
    iconUrl: PinMarker, 
    iconSize: [22, 44]
  })

  const dataLast = data[0]

  let markers: any = []
  leaflet_layer_groups.removeLayer(markers);
  data.forEach((log) => {
    const { lat, long, deg_north, created_at } = log
    const marker = L.marker([parseFloat(lat), parseFloat(long)], { icon: pinIcon }).bindTooltip(`${props.shipData.ship_name} at ${created_at}`)
    
    if(log.log_id == dataLast.log_id) {
      // @ts-ignore
      marker.setRotationAngle(deg_north)
    }

    marker.addTo(leaflet_layer_groups)
    markers.push(marker)

    if(log.log_id != dataLast.log_id) {
      const markerElement: any = marker.getElement();
      markerElement.classList.add('mt-2'); 
    }

    marker.on("click", () => {
      leaflet_map.flyTo([parseFloat(lat), parseFloat(long)], 16, {
        duration: 1
      })
    })
  })

  if (markers.length > 0) {
    const lastMarker = markers[0]
    const firtsMarker = markers[markers.length - 1]

    firtsMarker.setIcon(L.icon({ iconUrl: PinMarker, iconSize: [22, 44] }))

    const sizeByZoom = calculateIconSize(leaflet_map.getZoom())

    var shipIcon = L.icon({
      iconUrl: ShipMarker,
      iconSize: [sizeByZoom[0], sizeByZoom[1]],
      iconAnchor: [sizeByZoom[0] / 2, sizeByZoom[1]],
    })

    lastMarker.setIcon(shipIcon)

    firtsMarker.setZIndexOffset(1000)
    lastMarker.setZIndexOffset(1001)
  }

  
  L.polyline(
    markers.map((marker: any) => marker.getLatLng()),
    { dashArray: "6, 6", color: "blue" }
  ).addTo(leaflet_layer_groups);

  StartToastifyInstance({
    text: `${data.length} Location History Found`,
    duration: 3000,
    gravity: "bottom",
    close: true,
    className: "me-5"
  }).showToast();
}
</script>

<template>
  <div
    class="col-span-12 rounded-sm border border-stroke bg-white py-1 px-1 shadow-default dark:border-strokedark dark:bg-boxdark"
  >
    <!-- Map container -->
    <div id="map" class="z-20" style="height: 45vh"></div>
  </div>
</template>
