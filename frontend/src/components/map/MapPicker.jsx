import React, { useState, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const LIBRARIES = ['places']
const DEFAULT_CENTER = { lat: 27.7172, lng: 85.3240 } // Kathmandu
const MAP_STYLES = { width: '100%', height: '100%' }

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
}

export default function MapPicker({ value, onChange }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  })

  const [marker, setMarker] = useState(value?.lat ? { lat: value.lat, lng: value.lng } : null)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const mapRef = useRef(null)

  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoadingAddress(true)
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
      )
      const data = await res.json()
      if (data.results?.[0]) {
        const result = data.results[0]
        const comps = result.address_components
        const get = (type) => comps.find(c => c.types.includes(type))?.long_name || ''
        onChange({
          lat,
          lng,
          address: result.formatted_address,
          city: get('locality') || get('administrative_area_level_2'),
          province: get('administrative_area_level_1'),
          zip: get('postal_code'),
        })
      } else {
        onChange({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, city: '', province: '', zip: '' })
      }
    } catch {
      onChange({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, city: '', province: '', zip: '' })
    }
    setLoadingAddress(false)
  }, [onChange])

  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    setMarker({ lat, lng })
    reverseGeocode(lat, lng)
  }, [reverseGeocode])

  const handleMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setMarker({ lat, lng })
      mapRef.current?.panTo({ lat, lng })
      mapRef.current?.setZoom(16)
      reverseGeocode(lat, lng)
    })
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-container-low rounded-xl">
        <div className="flex flex-col items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '32px' }}>progress_activity</span>
          <p className="text-sm">Loading map…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={MAP_STYLES}
        center={marker || (value?.lat ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER)}
        zoom={marker ? 16 : 13}
        onClick={handleMapClick}
        options={MAP_OPTIONS}
        onLoad={map => (mapRef.current = map)}
      >
        {marker && <Marker position={marker} animation={window.google.maps.Animation.DROP} />}
      </GoogleMap>

      {/* Instruction overlay */}
      {!marker && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-inverse-surface/80 text-inverse-on-surface text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
          Click anywhere on the map to drop a pin
        </div>
      )}

      {/* My location button */}
      <button type="button" onClick={handleMyLocation}
        className="absolute bottom-4 right-4 w-10 h-10 bg-surface rounded-full shadow-lg flex items-center justify-center hover:bg-surface-container-low transition-colors border border-outline-variant">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>my_location</span>
      </button>

      {/* Loading indicator */}
      {loadingAddress && (
        <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm text-on-surface text-xs px-3 py-1.5 rounded-full border border-outline-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '14px' }}>progress_activity</span>
          Getting address…
        </div>
      )}

      {/* Pin confirmation */}
      {marker && !loadingAddress && (
        <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-sm text-on-primary text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>location_on</span>
          Pin dropped - move to adjust
        </div>
      )}
    </div>
  )
}
