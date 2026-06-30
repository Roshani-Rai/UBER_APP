'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Location {
  lat: number;
  lon: number;
  name?: string;
  address?: string;
  country?: string;
  countryCode?: string;
}

interface SuggestionItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  country?: string;
  countryCode?: string;
}

type VehicleType = 'bike' | 'auto' | 'car' | 'loading' | 'truck' | null;

const PHOTON_API = 'https://photon.komoot.io/api';

const formatAddress = (properties: any): string => {
  return [
    properties.housenumber,
    properties.street,
    properties.district,
    properties.city,
    properties.state,
    properties.postcode,
    properties.country,
  ].filter(Boolean).join(', ');
};

const searchLocations = async (query: string, countryCode?: string): Promise<SuggestionItem[]> => {
  if (!query || query.length < 2) return [];
  try {
    const params: Record<string, string> = { q: query, limit: '4', lang: 'en' };
    if (countryCode) params.countrycode = countryCode.toLowerCase();
    const response = await fetch(`${PHOTON_API}/?${new URLSearchParams(params)}`);
    const data = await response.json();
    return data.features.map((feature: any) => ({
      id:
        feature.properties.osm_id?.toString() ??
        `${feature.geometry.coordinates[0]}-${feature.geometry.coordinates[1]}`,
      name: feature.properties.name || feature.properties.street || 'Unknown',
      address: formatAddress(feature.properties),
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      country: feature.properties.country,
      countryCode: feature.properties.countrycode,
    }));
  } catch {
    return [];
  }
};

const reverseGeocode = async (lat: number, lon: number): Promise<Location> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`,  // added zoom=18 for max detail
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await response.json();

    if (data && data.address) {
      const a = data.address;

      // more specific → less specific priority
      const primaryName =
        a.amenity ||           // shop/building name
        a.building ||          // building name
        a.road ||              // street name  
        a.neighbourhood ||     // neighbourhood
        a.suburb ||            // suburb
        a.village ||           // village (more specific than city)
        a.town ||
        a.city ||
        a.county

      const secondaryName =
        a.village ||
        a.town ||
        a.city ||
        a.county

      const displayName = primaryName === secondaryName
        ? primaryName
        : [primaryName, secondaryName].filter(Boolean).join(', ')

      const fullAddress = [
        a.house_number,
        a.road,
        a.neighbourhood || a.suburb,
        a.village || a.town || a.city,
        a.state,
        a.postcode,
        a.country,
      ].filter(Boolean).join(', ');

      return {
        lat,
        lon,
        name: displayName || fullAddress || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        address: fullAddress,
        country: a.country,
        countryCode: a.country_code?.toUpperCase(),
      };
    }
    return { lat, lon, name: `${lat.toFixed(4)}, ${lon.toFixed(4)}` };
  } catch {
    return { lat, lon, name: `${lat.toFixed(4)}, ${lon.toFixed(4)}` };
  }
};

const getCurrentLocation = (): Promise<{ lat: number; lon: number }> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true }
    );
  });

const buildDisplayString = (location: Location): string => {
  if (location.name && location.address && !location.address.includes(location.name)) {
    return `${location.name}, ${location.address}`;
  }
  return location.name || location.address || `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`;
};

// Step Dots
const StepDots: React.FC<{ total: number; filled: number }> = ({ total, filled }) => (
  <div className="flex items-center justify-center gap-1.5 mb-5">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${
          i < filled ? 'w-6 h-2 bg-gray-900' : 'w-2 h-2 bg-gray-200'
        }`}
      />
    ))}
  </div>
);

// LocationInput
const LocationInput: React.FC<{
  label: string;
  placeholder: string;
  value: Location | null;
  onChange: (location: Location) => void;
  showCurrentLocation?: boolean;
  disabled?: boolean;
  dotColor: 'green' | 'red';
  countryCode?: string;
}> = ({ label, placeholder, value, onChange, showCurrentLocation = false, disabled = false, dotColor, countryCode }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  // When we programmatically set inputValue (after picking a suggestion or
  // using current location), we don't want the search effect below to fire
  // again and reopen the dropdown. This flag tells that effect to skip once.
  const skipNextSearch = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) { setInputValue(''); return; }
    setInputValue(buildDisplayString(value));
  }, [value]);

  useEffect(() => {
    if (disabled) return;
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      if (inputValue.length > 1) {
        setLoading(true);
        const results = await searchLocations(inputValue, countryCode);
        setSuggestions(results.slice(0, 4));
        setShowSuggestions(true);
        setLoading(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, disabled, countryCode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (s: SuggestionItem) => {
    const location: Location = {
      lat: s.lat, lon: s.lon, name: s.name,
      address: s.address, country: s.country, countryCode: s.countryCode,
    };
    skipNextSearch.current = true;
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(location);
    setInputValue(buildDisplayString(location));
    inputRef.current?.blur();
  };

  const handleCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { lat, lon } = await getCurrentLocation();
      const location = await reverseGeocode(lat, lon);
      skipNextSearch.current = true;
      setSuggestions([]);
      setShowSuggestions(false);
      onChange(location);
      setInputValue(buildDisplayString(location));
    } catch {
      alert('Unable to get location. Please enable location services.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <div className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl transition ${
        disabled
          ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-60'
          : 'bg-white border-gray-200 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent'
      }`}>
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor === 'green' ? 'bg-green-500' : 'bg-red-500'}`} />

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          disabled={disabled}
          onChange={(e) => {
            // If the value was just set programmatically (a selection),
            // any real typing here should cancel that "settled" state and
            // allow fresh searches again — handled naturally since this is
            // a genuine user edit, not the effect re-running.
            setInputValue(e.target.value);
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed"
        />

        {showCurrentLocation && !disabled && (
          <button
            onClick={handleCurrentLocation}
            disabled={isLoadingLocation}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-50 transition"
            type="button"
            title="Use current location"
          >
            {isLoadingLocation
              ? <span className="text-xs inline-block animate-spin">⟳</span>
              : <Navigation size={14} />
            }
          </button>
        )}

        {!showCurrentLocation && !disabled && (
          <MapPin size={14} className="text-red-400 flex-shrink-0" />
        )}
      </div>

      {showSuggestions && !disabled && (loading || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-xl z-30 overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-xs text-gray-400">Searching...</div>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={s.id}
                onClick={() => handleSelectSuggestion(s)}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition flex items-start gap-2.5 ${
                  i < suggestions.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                type="button"
              >
                <MapPin size={13} className="text-gray-300 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-xs text-gray-900 truncate">{s.name}</div>
                  {s.address && (
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate">{s.address}</div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Main
export default function RideBooking() {
  const router = useRouter();

  const [vehicleType, setVehicleType] = useState<VehicleType>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);

  const vehicles: { type: VehicleType; name: string; desc: string }[] = [
    { type: 'bike',    name: 'Bike',    desc: 'Quick & affordable' },
    { type: 'auto',    name: 'Auto',    desc: 'Everyday rides' },
    { type: 'car',     name: 'Car',     desc: 'Comfort rides' },
    { type: 'loading', name: 'Loading', desc: 'Small cargo' },
    { type: 'truck',   name: 'Truck',   desc: 'Heavy transport' },
  ];

  const filledSteps = [
    !!vehicleType,
    mobileNumber.length >= 10,
    !!pickupLocation,
    !!dropoffLocation,
  ].filter(Boolean).length;

  const isFormValid =
    !!vehicleType &&
    mobileNumber.length >= 10 &&
    !!pickupLocation &&
    !!dropoffLocation;

  const handleContinue = () => {
    if (!isFormValid) return;
    const pickup = encodeURIComponent(buildDisplayString(pickupLocation!));
    const drop = encodeURIComponent(buildDisplayString(dropoffLocation!));
    router.push(
      `/user/search?pickup=${pickup}&drop=${drop}&vehicle=${vehicleType}&mobile=${encodeURIComponent(mobileNumber)}&pickuplat=${pickupLocation!.lat}&pickuplon=${pickupLocation!.lon}&droplat=${dropoffLocation!.lat}&droplon=${dropoffLocation!.lon}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition"
            type="button"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Book a Ride</h1>
            <p className="text-xs text-gray-500">Fill in the details below</p>
          </div>
        </div>

        {/* Step dots */}
        <StepDots total={4} filled={filledSteps} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6">

          {/* 1 — Vehicle */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-900 text-white rounded-full text-xs">1</span>
              Choose Vehicle
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {vehicles.map((v) => (
                <button
                  key={v.type}
                  onClick={() => setVehicleType(v.type)}
                  className={`p-3 rounded-xl border-2 transition text-left ${
                    vehicleType === v.type
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                  }`}
                  type="button"
                >
                  <div className="font-semibold text-xs">{v.name}</div>
                  <div className={`text-[10px] mt-0.5 ${vehicleType === v.type ? 'text-gray-300' : 'text-gray-400'}`}>
                    {v.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2 — Mobile */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-900 text-white rounded-full text-xs">2</span>
              Mobile
            </h3>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition">
              <span className="text-sm">☎️</span>
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={15}
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
              />
              {mobileNumber.length >= 10 && (
                <span className="text-green-500 text-sm">✓</span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">Ride updates will be sent to this number</p>
          </div>

          {/* 3 — Route */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-900 text-white rounded-full text-xs">3</span>
              Route
            </h3>
            <div className="flex gap-3 items-start">
              {/* Timeline */}
              <div className="flex flex-col items-center mt-7 flex-shrink-0">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                <div className="w-px h-10 bg-gray-200 my-1" />
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <LocationInput
                  label="Pickup"
                  placeholder="Where from?"
                  value={pickupLocation}
                  onChange={(loc) => {
                    setPickupLocation(loc);
                    setDropoffLocation(null);
                  }}
                  showCurrentLocation
                  dotColor="green"
                />
                <LocationInput
                  label="Dropoff"
                  placeholder={pickupLocation ? 'Where to?' : 'Select pickup first'}
                  value={dropoffLocation}
                  onChange={(loc) => setDropoffLocation(loc)}
                  disabled={!pickupLocation}
                  dotColor="red"
                  countryCode={pickupLocation?.countryCode}
                />
              </div>
            </div>
          </div>

          {/* Continue */}
          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleContinue}
            className={`w-full py-3 rounded-xl font-semibold text-white text-sm transition ${
              isFormValid
                ? 'bg-gray-900 hover:bg-gray-800 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}