<script setup lang="ts">
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet-rotatedmarker';
import ShipMarker from '@/assets/images/map/ship-marker.png'
import FishermanMarker from '@/assets/images/map/fisherman-marker.png'


// @ts-ignore
import { onMounted, watch, props } from 'vue'
import { useApiFetch } from '@/composables/axios';
import type { ApiResponse } from '@/interfaces/api';
import type { WebsocketShipInterface } from '@/interfaces/ship';

const props = defineProps(['recenter'])

watch(() => props.recenter, (newValue) => {
    reCenter()
})

let center = { lat : -6.846155, lng : 109.128892 }
let leaflet_map: any = null
let leaflet_markers:any = []
let leaflet_layerGroups:any = null
let socket: any = null
let ws_url = "ws://localhost:8081/api/v1/dashboard/ship-monitor/open-websocket"
let harbour_geo: any = []

onMounted(() => {
  fetchSetting()
  initiateMap()

  setTimeout(() => {
    connectWs(ws_url)
  }, 300);
})

function reCenter() {
  leaflet_map.setView([center.lat, center.lng], 14)
}

async function initiateMap() {
  const street = "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=ufCf3dbMdr7VkfVI6gjQ"

  leaflet_map = L.map("map", {attributionControl:false}).setView([center.lat, center.lng], 14)
  L.tileLayer(street, {
    maxNativeZoom: 19,
    maxZoom: 30,
    minZoom: 12,
    noWrap: true,
    attribution: ''
  }).addTo(leaflet_map)

  leaflet_layerGroups = L.markerClusterGroup().addTo(leaflet_map)
}

async function harbourEditor(geofence: any) {
  var fix_geofence = geofence.map((item: any) => [item.lat, item.long])

  L.polygon(fix_geofence, {
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

      harbourEditor(harbour_geo)
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
        leaflet_markers[ship.ship_id].setLatLng([ship.geo[1], ship.geo[0]])
        // @ts-ignore
        leaflet_markers[ship.ship_id].setRotationAngle(ship.deg_north)
      } else {
        var shipIcon = L.icon({
          iconUrl: ShipMarker,
          iconSize: [22, 42],
          iconAnchor: [16, 32],
        })

        var fishermanIcon = L.icon({
          iconUrl: FishermanMarker,
          iconSize: [35, 50]
        })

        var marker = L.marker([ship.geo[1], ship.geo[0]], {
          icon: ship.on_ground === 1 ? fishermanIcon : shipIcon
        })
        .bindTooltip(ship.ship_name)
        .addTo(leaflet_layerGroups)
        .on("click", clickZoom)

        // @ts-ignore
        marker.setRotationAngle(ship.deg_north)

        leaflet_markers[ship.ship_id] = marker
      }
    } catch (error) {
      console.log("error add marker", error)
    }
}

function clickZoom(e: any) {
  leaflet_map.flyTo(e.target.getLatLng(), 16, {
    duration: 3
  })
}
</script>

<template>
  <div
    class="col-span-12 rounded-sm border border-stroke bg-white py-1 px-1  shadow-default dark:border-strokedark dark:bg-boxdark"
  >
    <!-- Map container -->
    <div id="map" style="height: 85vh;"></div>
  </div>
</template>
