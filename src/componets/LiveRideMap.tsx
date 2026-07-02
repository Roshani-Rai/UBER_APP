'use client'
import { AnimatePresence } from 'motion/react';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet'
import { BookingStatus } from '@/app/modals/booking.modals';
import axios from 'axios';


type props={
    driverLocation:[Number,Number] | null,
     pickUpLocation:[Number,Number] | null,
     dropLocation:[Number,Number] | null,
      mapStatus: "arriving" | "ongoing" | "completed",
      onStats:(data:{
        distanceToPickUp:number,
        etaToPickUp:number,
        distanceToDrop:number,etaToDrop:number
      })=>void
}

const SAME_LOCATION_THRESHOLD_M = 20

const MOBILE_BREAKPOINT_PX = 1024

const MOBILE_SHEET_RESERVE_PX = 260

const COLOR_PICKUP = '#16a34a'
const COLOR_DROP = '#dc2626'
const COLOR_DRIVER = '#2563eb'

function haversine(a:[number,number], b:[number,number]){
  const R = 6371000
  const dLat = (b[0]-a[0]) * Math.PI/180
  const dLon = (b[1]-a[1]) * Math.PI/180
  const lat1 = a[0]*Math.PI/180
  const lat2 = b[0]*Math.PI/180
  const x = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(lat1)*Math.cos(lat2)
  return 2*R*Math.asin(Math.sqrt(x))
}

function useIsMobile(){
  const [isMobile,setIsMobile] = useState(false)
  useEffect(()=>{
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`)
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  },[])
  return isMobile
}


function createPickupIcon(scale:number){
  const badgeH = Math.round(24*scale), stemH = Math.round(18*scale), dot = Math.round(10*scale)
  const w = Math.round(70*scale), h = badgeH + stemH + dot
  return new L.DivIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          background:${COLOR_PICKUP};color:white;font-size:${Math.max(9,Math.round(11*scale))}px;font-weight:700;
          letter-spacing:0.5px;padding:${Math.round(5*scale)}px ${Math.round(12*scale)}px;border-radius:14px;
          white-space:nowrap;box-shadow:0 2px 6px rgba(22,163,74,0.4);
        ">PICKUP</div>
        <div style="width:2px;height:${stemH}px;background:${COLOR_PICKUP};"></div>
        <div style="
          width:${dot}px;height:${dot}px;border-radius:50%;background:${COLOR_PICKUP};
          border:2px solid white;box-shadow:0 0 0 1px ${COLOR_PICKUP};
        "></div>
      </div>
    `,
    iconSize: [w, h],
    iconAnchor: [w/2, h],
  })
}

function createDropIcon(scale:number){
  const badgeH = Math.round(24*scale), stemH = Math.round(18*scale), dot = Math.round(10*scale)
  const w = Math.round(50*scale), h = badgeH + stemH + dot
  return new L.DivIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          background:${COLOR_DROP};color:white;font-size:${Math.max(9,Math.round(11*scale))}px;font-weight:700;
          letter-spacing:0.5px;padding:${Math.round(5*scale)}px ${Math.round(12*scale)}px;border-radius:14px;
          white-space:nowrap;box-shadow:0 2px 6px rgba(220,38,38,0.4);
        ">DROP</div>
        <div style="width:2px;height:${stemH}px;background:${COLOR_DROP};"></div>
        <div style="
          width:${dot}px;height:${dot}px;border-radius:50%;background:${COLOR_DROP};
          border:2px solid white;box-shadow:0 0 0 1px ${COLOR_DROP};
        "></div>
      </div>
    `,
    iconSize: [w, h],
    iconAnchor: [w/2, h],
  })
}

function createDriverIcon(scale:number){
  const size = Math.round(44*scale)
  const inner = Math.round(18*scale)
  return new L.DivIcon({
    className: '',
    html: `
      <style>
        @keyframes driver-wave-pulse {
          0%   { transform: scale(1);   opacity: 0.55; }
          70%  { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .driver-wave-ring {
          position: absolute;
          top: 50%; left: 50%;
          width: ${size}px; height: ${size}px;
          margin-top: -${size/2}px; margin-left: -${size/2}px;
          border-radius: 50%;
          background: ${COLOR_DRIVER};
          animation: driver-wave-pulse 1.8s ease-out infinite;
        }
        .driver-wave-ring.delay {
          animation-delay: 0.9s;
        }
      </style>
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div class="driver-wave-ring"></div>
        <div class="driver-wave-ring delay"></div>
        <div style="
          position:relative;
          width:${size}px;height:${size}px;border-radius:50%;background:${COLOR_DRIVER};
          border:${Math.max(2,Math.round(3*scale))}px solid white;box-shadow:0 2px 8px rgba(37,99,235,0.5);
          display:flex;align-items:center;justify-content:center;
        ">
          <svg width="${inner}" height="${inner}" viewBox="0 0 24 24" fill="white">
            <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h1zm2.1 0h9.8l-1-3H8.1l-1 3zM6.5 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm11 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  })
}

// badge shown above the driver when it has snapped to the pickup point
function createAtPickupIcon(scale:number){
  const w = Math.round(140*scale), h = Math.round(24*scale)
  return new L.DivIcon({
    className: '',
    html: `
      <div style="
        background:${COLOR_PICKUP};color:white;font-size:${Math.max(9,Math.round(11*scale))}px;font-weight:700;
        letter-spacing:0.5px;padding:${Math.round(5*scale)}px ${Math.round(12*scale)}px;border-radius:14px;
        white-space:nowrap;box-shadow:0 2px 6px rgba(22,163,74,0.4);
      ">DRIVER AT PICKUP</div>
    `,
    iconSize: [w, h],
    iconAnchor: [w/2, Math.round(58*scale)],
  })
}

function RecenterOnChange({ points, isMobile }: { points: [number, number][], isMobile: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], map.getZoom())
      // nudge the view up so the single marker isn't hidden behind the bottom sheet
      if (isMobile) map.panBy([0, MOBILE_SHEET_RESERVE_PX / 2], { animate: true })
      return
    }
    const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])))
    map.fitBounds(bounds, isMobile
      ? { paddingTopLeft: [24, 24], paddingBottomRight: [24, MOBILE_SHEET_RESERVE_PX] }
      : { padding: [60, 60] }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points), isMobile])
  return null
}

type RouteResult = {
  coords: [number, number][]
  distanceMeters: number
  durationSeconds: number
}

async function fetchOSRMRoute(sLat:number,sLon:number,eLat:number,eLon:number): Promise<RouteResult | null>{
    try{
        const url = `https://router.project-osrm.org/route/v1/driving/${sLon},${sLat};${eLon},${eLat}?overview=full&geometries=geojson`
        const res = await axios.get(url)
        const route = res.data?.routes?.[0]
        if(route?.geometry?.coordinates?.length){
            return {
                coords: route.geometry.coordinates.map(([lon,lat]:number[])=>[lat,lon]),
                distanceMeters: route.distance ?? 0,
                durationSeconds: route.duration ?? 0,
            }
        }
        return null
    }catch(error){
        console.error('OSRM route fetch failed:', error)
        return null
    }
}

// fallback when OSRM is unreachable: straight line + assumed 30km/h average speed
function fallbackRoute(a:[number,number], b:[number,number]): RouteResult {
    const distanceMeters = haversine(a,b)
    const AVG_SPEED_MPS = (30*1000)/3600
    return {
        coords: [a,b],
        distanceMeters,
        durationSeconds: distanceMeters / AVG_SPEED_MPS,
    }
}

export default function LiveRideMap({driverLocation,dropLocation,pickUpLocation,mapStatus,onStats}:props) {
 const [driverToPickupRoute,setDriverToPickupRoute] = useState<[number,number][]>([])
 const [pickupToDropRoute,setPickupToDropRoute] = useState<[number,number][]>([])

 const [pickupStats,setPickupStats] = useState({distanceMeters:0,durationSeconds:0})
 const [dropStats,setDropStats] = useState({distanceMeters:0,durationSeconds:0})

 const isMobile = useIsMobile()

 // icons recreated only when the mobile/desktop breakpoint actually flips,
 // not on every render
 const icons = useMemo(()=>{
    const scale = isMobile ? 0.78 : 1
    return {
      pickupIcon: createPickupIcon(scale),
      dropIcon: createDropIcon(scale),
      driverIcon: createDriverIcon(scale),
      atPickupIcon: createAtPickupIcon(scale),
    }
 },[isMobile])

 const onStatsRef = useRef(onStats)
 useEffect(()=>{ onStatsRef.current = onStats },[onStats])

    const driverAtPickup = !!driverLocation && !!pickUpLocation &&
        haversine(driverLocation as [number,number], pickUpLocation as [number,number]) < SAME_LOCATION_THRESHOLD_M

    const displayDriverLocation: [number,number] | null = (() => {
        if(!driverLocation) return null
        if(!pickUpLocation) return driverLocation as [number,number]
        if(driverAtPickup) return pickUpLocation as [number,number]
        return driverLocation as [number,number]
    })()

    useEffect(()=>{
        if(!driverLocation || !pickUpLocation || mapStatus==='completed'){
            setDriverToPickupRoute([])
            setPickupStats({distanceMeters:0,durationSeconds:0})
            return
        }
        const [drLat,drLon] = driverLocation as [number,number]
        const [pLat,pLon] = pickUpLocation as [number,number]

        if(haversine([drLat,drLon],[pLat,pLon]) < SAME_LOCATION_THRESHOLD_M){
            setDriverToPickupRoute([])
            setPickupStats({distanceMeters:0,durationSeconds:0})
            return
        }

        let cancelled = false
        fetchOSRMRoute(drLat,drLon,pLat,pLon).then((result)=>{
            if(cancelled) return
            const r = result ?? fallbackRoute([drLat,drLon],[pLat,pLon])
            setDriverToPickupRoute(r.coords)
            setPickupStats({distanceMeters:r.distanceMeters,durationSeconds:r.durationSeconds})
        })
        return ()=>{ cancelled = true }
    },[driverLocation?.[0], driverLocation?.[1], pickUpLocation?.[0], pickUpLocation?.[1], mapStatus])

    useEffect(()=>{
        if(!pickUpLocation || !dropLocation || mapStatus==='completed'){
            setPickupToDropRoute([])
            setDropStats({distanceMeters:0,durationSeconds:0})
            return
        }
        const [pLat,pLon] = pickUpLocation as [number,number]
        const [dLat,dLon] = dropLocation as [number,number]

        if(haversine([pLat,pLon],[dLat,dLon]) < SAME_LOCATION_THRESHOLD_M){
            setPickupToDropRoute([])
            setDropStats({distanceMeters:0,durationSeconds:0})
            return
        }

        let cancelled = false
        fetchOSRMRoute(pLat,pLon,dLat,dLon).then((result)=>{
            if(cancelled) return
            const r = result ?? fallbackRoute([pLat,pLon],[dLat,dLon])
            setPickupToDropRoute(r.coords)
            setDropStats({distanceMeters:r.distanceMeters,durationSeconds:r.durationSeconds})
        })
        return ()=>{ cancelled = true }
    },[pickUpLocation?.[0], pickUpLocation?.[1], dropLocation?.[0], dropLocation?.[1], mapStatus])

    useEffect(()=>{
        const distanceToPickUp = driverAtPickup ? 0 : pickupStats.distanceMeters / 1000 // km
        const etaToPickUp = driverAtPickup ? 0 : Math.round(pickupStats.durationSeconds / 60) // minutes
        const distanceToDrop = dropStats.distanceMeters / 1000 // km
        const etaToDrop = Math.round(dropStats.durationSeconds / 60) // minutes

        onStatsRef.current({distanceToPickUp,etaToPickUp,distanceToDrop,etaToDrop})
    },[pickupStats.distanceMeters, pickupStats.durationSeconds, dropStats.distanceMeters, dropStats.durationSeconds, driverAtPickup])

    const showDriverToPickup = mapStatus === 'arriving' && !driverAtPickup && driverToPickupRoute.length>0
    const showPickupToDrop = mapStatus !== 'completed' && pickupToDropRoute.length>0

    const allPoints = [displayDriverLocation, pickUpLocation, dropLocation].filter(Boolean) as [number,number][]

  return (
      <div className='relative h-full w-full bg-zinc-100'>
            <MapContainer
                style={{ width: '100%', height: '100%' }}
                center={pickUpLocation as any}
                zoom={isMobile ? 14 : 13}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                />
                
               
                {pickUpLocation && !driverAtPickup &&
                    <Marker
                        position={pickUpLocation as any}
                        draggable
                        icon={icons.pickupIcon}
                    />}
                {dropLocation &&
                    <Marker
                        position={dropLocation as any}
                        draggable
                        icon={icons.dropIcon}
                    />}
                     {displayDriverLocation &&
                    <Marker
                        position={displayDriverLocation as any}
                        draggable
                        icon={icons.driverIcon}
                    />}
                     {driverAtPickup && mapStatus === 'arriving' && displayDriverLocation &&
                    <Marker
                        position={displayDriverLocation as any}
                        icon={icons.atPickupIcon}
                        interactive={false}
                    />}

                 {showDriverToPickup &&(
                        <Polyline
                            positions={driverToPickupRoute}
                            pathOptions={{color:'#1dab3c',weight:isMobile ? 3 : 4,opacity:0.85,dashArray:'1, 10',lineCap:'round'}}
                        />
                 )}

                 {showPickupToDrop &&(
                        <Polyline
                            positions={pickupToDropRoute}
                            pathOptions={{color:'#1dab3c',weight:isMobile ? 4 : 5,opacity:1,lineCap:'round',lineJoin:'round'}}
                        />
                 )}

                 <RecenterOnChange points={allPoints} isMobile={isMobile} />
            </MapContainer>

            
        </div>
  )
}