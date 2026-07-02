'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

import L from 'leaflet'
import { MapContainer, Marker, TileLayer, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'  
import { AnimatePresence, motion } from 'motion/react'
import { MapPin } from 'lucide-react'

type props = {
    pickup: string,
    drop: string,
    onChange: (p: string, d: string) => void,
    onDistance: (d: number) => void
}

function FitBounds({ p1, p2 }: { p1: [number, number], p2: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.invalidateSize()
        map.fitBounds([p1, p2], { padding: [72, 72], maxZoom: 15, animate: true, duration: 1 })
    }, [p1, p2, map])
    return null
}

const pickupIcon = new L.DivIcon({
    className: '',
    html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="
                width:16px;height:16px;background:#22c55e;
                border:3px solid white;border-radius:50%;
                box-shadow:0 2px 6px rgba(0,0,0,0.4);
            ">PICKUP</div>
            <div style="width:2px;height:10px;background:#22c55e;"></div>
        </div>
    `,
    iconSize: [16, 26],
    iconAnchor: [8, 0],
})

const dropIcon = new L.DivIcon({
    className: '',
    html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="
                width:28px;height:28px;background:#ef4444;
                border:3px solid white;border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);box-shadow:0 4px 10px rgba(239,68,68,0.5);
                display:flex;align-items:center;justify-content:center;
            ">DROP
                <div style="
                    width:8px;height:8px;background:white;
                    border-radius:50%;transform:rotate(45deg);
                "></div>
            </div>
        </div>
    `,
    iconSize: [28, 34],
    iconAnchor: [14, 34],
})

function decodePolyline(encoded: string): [number, number][] {
    const coords: [number, number][] = []
    let index = 0, lat = 0, lng = 0
    while (index < encoded.length) {
        let b, shift = 0, result = 0
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
        lat += result & 1 ? ~(result >> 1) : result >> 1
        shift = 0; result = 0
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
        lng += result & 1 ? ~(result >> 1) : result >> 1
        coords.push([lat / 1e5, lng / 1e5])
    }
    return coords
}

// ✅ completed reverseGeocode
const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
        const { data } = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`,
            { headers: { 'Accept-Language': 'en' } }
        )
        const a = data.address
        const name =
            a.amenity || a.building || a.road ||
            a.neighbourhood || a.suburb || a.village ||
            a.town || a.city || a.county || ''
        const area =
            a.village || a.town || a.city || a.county || a.state || ''
        const postcode = a.postcode || ''
        const country = a.country || ''
        return [name, area, postcode, country].filter(Boolean).join(', ')
    } catch {
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
    }
}

function Search({ pickup, drop, onChange, onDistance }: props) {
    const [p1, setP1] = useState<[number, number]>()
    const [p2, setP2] = useState<[number, number]>()
    const [route, setRoute] = useState<[number, number][]>([])
    const [ready, setReady] = useState(false)
    const [km, setKm] = useState<number>()

    const geoCoding = async (q: string): Promise<[number, number] | null> => {
        try {
            const { data } = await axios.get(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1`)
            if (!data.features.length) return null
            const [lon, lat] = data.features[0].geometry.coordinates
            return [lat, lon]
        } catch (error) {
            console.log(error)
            return null
        }
    }

    const loadRoute = async (p: [number, number], d: [number, number]) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${p[1]},${p[0]};${d[1]},${d[0]}?overview=full&geometries=polyline`
            const { data } = await axios.get(url)
            if (data.code !== 'Ok') return
            const coords = decodePolyline(data.routes[0].geometry)
            setRoute(coords)
            const distanceKm = data.routes[0].distance / 1000
            setKm(distanceKm)
            onDistance(distanceKm)
        } catch (error) {
            console.log(error)
        }
    }

    const dragDrop = async (lat: number, lon: number) => {
        const addr = await reverseGeocode(lat, lon)
        setP2([lat, lon])
        if (p1) loadRoute(p1, [lat, lon])
        onChange?.(pickup, addr)  // ✅ fixed: pickup stays, drop updates
    }

    const dragPickup = async (lat: number, lon: number) => {
        const addr = await reverseGeocode(lat, lon)
        setP1([lat, lon])
        if (p2) loadRoute([lat, lon], p2)
        onChange?.(addr, drop)  // ✅ fixed: pickup updates, drop stays
    }

    useEffect(() => {
        if (pickup && drop) {
            setReady(false)
            ;(async () => {
                const a = await geoCoding(pickup)
                const b = await geoCoding(drop)
                if (!a || !b) { setReady(true); return }
                await loadRoute(a, b)
                setP1(a)
                setP2(b)
                setReady(true)
            })()
        }
    }, [pickup, drop])

    return (
        <div className='relative h-full w-full bg-zinc-100'>
            <MapContainer
                style={{ width: '100%', height: '100%' }}
                center={p1 ?? [20, 80]}
                zoom={13}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                />
                {p1 && p2 && <FitBounds p1={p1} p2={p2} />}
                {route.length > 0 && (
                    <Polyline
                        positions={route}
                        pathOptions={{ color: '#6366f1', weight: 4 }}
                    />
                )}
                {p1 &&
                    <Marker
                        position={p1}
                        eventHandlers={{
                            dragend: e => { const m = e.target.getLatLng(); dragPickup(m.lat, m.lng) }
                        }}
                        draggable
                        icon={pickupIcon}
                    />}
                {p2 &&
                    <Marker
                        position={p2}
                        eventHandlers={{
                            dragend: e => { const m = e.target.getLatLng(); dragDrop(m.lat, m.lng) }
                        }}
                        draggable
                        icon={dropIcon}
                    />}
            </MapContainer>

            <AnimatePresence>
                {!ready && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45 }}
                        className='absolute bottom-16 inset-0 z-[999] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-4'
                    >
                        <div className='relative w-14 h-14 flex items-center justify-center'>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                                className='absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900'
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                                className='absolute inset-2 rounded-full border-2 border-transparent border-t-zinc-300'
                            />
                            <MapPin size={15} className='text-zinc-800' />
                        </div>
                        <div className='text-center'>
                            <p className='text-zinc-900 text-xs font-black tracking-[0.22em] uppercase'>Loading Map...</p>
                            <p className='text-zinc-400 text-[10px] font-medium tracking-wider mt-0.5'>Plotting your route</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {ready && km != null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.25 }}
                        className='absolute bottom-4 left-1/2 -translate-x-1/2 z-[998]'
                    >
                        <div className='bg-white rounded-full shadow-lg px-5 py-2.5 flex items-center gap-3'>
                            <div className='flex items-center gap-1.5'>
                                <div className='w-1.5 h-1.5 rounded-full bg-indigo-500' />
                                <span className='text-xs font-bold text-zinc-900'>
                                    {km! < 1 ? `${(km! * 1000).toFixed(0)}m` : `${km!.toFixed(1)}km`}
                                </span>
                            </div>
                            <div className='w-px h-3.5 bg-zinc-200' />
                            <span className='text-xs font-bold text-zinc-900'>
                                {km! < 1 ? Math.ceil((km! * 1000) / 80) : Math.ceil(km! / 0.5)} min
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Search