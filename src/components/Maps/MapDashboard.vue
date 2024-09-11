<script setup lang="ts">
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster.freezable'
import 'leaflet-rotatedmarker'
import ShipMarker from '@/assets/images/map/ship-marker.png'
import FishermanMarker from '@/assets/images/map/fisherman-marker.png'


// @ts-ignore
import { onMounted, watch, props } from 'vue'
import { useApiFetch } from '@/composables/axios'
import type { ApiResponse } from '@/interfaces/api'
import type { WebsocketShipInterface } from '@/interfaces/ship'

const props = defineProps(['recenter'])

watch(() => props.recenter, (newValue) => {
    reCenter()
})

let center = { lat : -6.846155, lng : 109.128892 }
let leaflet_map: any = null
let leaflet_markers:any = []
let leaflet_layerGroups:any = null
let socket: any = null
let ws_url = `${import.meta.env.VITE_API_WS_URL}/api/v1/dashboard/ship-monitor/open-websocket`
let harbour_geo: any = []

onMounted(() => {
  fetchSetting()
  initiateMap()

  setTimeout(() => {
    connectWs(ws_url)
  }, 300)
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
    minZoom: 12,
    noWrap: true,
    attribution: ''
  }).addTo(leaflet_map)

  leaflet_layerGroups = L.markerClusterGroup().addTo(leaflet_map)
  leaflet_map.on('zoomend', resizeMarkers)
  clusterZoom(leaflet_map.getZoom())
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

async function connectWs(url: string) {
  console.log("ws attempting connection ...")
  try {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("ws already connected")
      return
    }

    socket = new WebSocket(url)

    socket.onerror = (error: any) => {
      console.error("socket on error:", error)
    }

    socket.onopen = () => {
      console.log("ws successfully connected")
    }

    socket.onmessage = (message: any) => {
      processSocketData(message)
    }

    socket.onclose = (event: any) => {
      if (event.code === 1000) {
        console.log("ws successfuly closed safely")
      } else {
        console.log("ws closed with code:", event.code)
        console.log("reconnecting ...")
        setTimeout(() => {
          connectWs(url)
        }, 5000)
      }
    }
  } catch (error) {
    console.log("err!:", error)

    if (socket && socket?.readyState === WebSocket.OPEN) {
      console.log("failed, need to close ws")
      socket.close()
      return
    }

    console.log("reconnecting ...")
    setTimeout(() => {
      connectWs(url)
    }, 5000)
  }
}

function processSocketData(data: any) {
    var data = data.data
    var ships = JSON.parse(data)

    ships.forEach((ship: WebsocketShipInterface) => {
      processMarker(ship)
    })
}

async function processMarker(ship: WebsocketShipInterface) {
    try {
      if (leaflet_markers.hasOwnProperty(ship.ship_id)) {
        const existingMarker = leaflet_markers[ship.ship_id]
        animateMarker(existingMarker, [ship.geo[1], ship.geo[0]])
        // @ts-ignore
        leaflet_markers[ship.ship_id].setRotationAngle(ship.deg_north)
      } else {
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

        var marker = L.marker([ship.geo[1], ship.geo[0]], {
          icon: ship.on_ground === 1 ? fishermanIcon : shipIcon
        })
        .bindTooltip(ship.ship_name)
        .addTo(leaflet_layerGroups)
        .on("click", clickZoom)

        if(ship.on_ground != 1) {
          // @ts-ignore
          marker.setRotationAngle(ship.deg_north)
        }

        leaflet_markers[ship.ship_id] = marker
      }
    } catch (error) {
      console.log("error add marker", error)
    }
}

function animateMarker(marker: any, newLatLng: any) {
  const duration = 1000
  const frameRate = 20
  const frameTime = 1000 / frameRate
  const frames = duration / frameTime
  const startLatLng = marker.getLatLng()
  const latStep = (newLatLng[0] - startLatLng.lat) / frames
  const lngStep = (newLatLng[1] - startLatLng.lng) / frames
  
  let currentFrame = 0
  const animate = () => {
    if (currentFrame < frames) {
      marker.setLatLng([startLatLng.lat + latStep * currentFrame, startLatLng.lng + lngStep * currentFrame])
      currentFrame++
      requestAnimationFrame(animate)
    } else {
      marker.setLatLng(newLatLng)
    }
  }
  animate()
}

function clickZoom(e: any) {
  leaflet_map.flyTo(e.target.getLatLng(), 16, {
    duration: 5
  })
}

function resizeMarkers() {
  clusterZoom(leaflet_map.getZoom())
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

function clusterZoom(zoom: number) {
  if(zoom <= 15) {
    leaflet_layerGroups.freezeAtZoom(zoom+2)
  } else {
    leaflet_layerGroups.freezeAtZoom(zoom+1)
  }
}
</script>

<template>
  <div
    class="col-span-12 rounded-sm border border-stroke bg-white py-1 px-1  shadow-default dark:border-strokedark dark:bg-boxdark"
  >
    <!-- Map container -->
    <div id="map" style="height: 85vh"></div>
  </div>
</template>

<style scoped>
.pulse-animated {
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0px rgb(255, 187, 50);
  }
  100% {
    box-shadow: 0 0 0 20px rgba(0, 0, 0, 0);
  }
}
</style>
