'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom"; 
import { MapPin, Search, Crosshair, X, Check } from "lucide-react";

const MapCanvas = dynamic(() => import("./MapCanvas"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Loading map...</div>
});

export interface LocationValue {
  lat: string;
  lng: string;
  name: string;
  address: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
}

const DEFAULT_CENTER: [number, number] = [26.9124, 75.7873];

export default function LocationMapPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const hasLocation = value.lat !== "" && value.lng !== "";

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {!hasLocation ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center cursor-pointer gap-2 text-sm font-medium text-[var(--color-primary)] border border-dashed border-[var(--color-primary)] rounded-md px-4 py-3 w-full justify-center hover:bg-[var(--color-primary)]/5"
        >
          <MapPin size={16} /> Pick location on map
        </button>
      ) : (
        <div className="flex items-start gap-3">
          <div className="w-20 h-20 rounded-md overflow-hidden relative z-0 border shrink-0 pointer-events-none bg-gray-50">
            <MapCanvas
              center={[Number(value.lat), Number(value.lng)]}
              marker={[Number(value.lat), Number(value.lng)]}
              onSelect={() => {}}
              interactive={false}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">{value.name || "Pinned location"}</p>
            <p className="text-sm text-gray-500 truncate">{value.address}</p>
            <p className="text-xs text-gray-400 mt-1">{value.lat}, {value.lng}</p>
            <button type="button" onClick={() => setOpen(true)} className="text-sm cursor-pointer font-semibold text-[var(--color-primary)] mt-2 hover:underline">
              Change location
            </button>
          </div>
        </div>
      )}

      {open && (
        <LocationPickerModal
          initial={hasLocation ? value : null}
          onClose={() => setOpen(false)}
          onConfirm={(v) => {
            onChange(v);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function LocationPickerModal({
  initial,
  onClose,
  onConfirm,
}: {
  initial: LocationValue | null;
  onClose: () => void;
  onConfirm: (v: LocationValue) => void;
}) {
  const [center, setCenter] = useState<[number, number]>(
    initial ? [Number(initial.lat), Number(initial.lng)] : DEFAULT_CENTER
  );
  const [marker, setMarker] = useState<[number, number] | null>(
    initial ? [Number(initial.lat), Number(initial.lng)] : null
  );
  const [name, setName] = useState(initial?.name || "");
  const [address, setAddress] = useState(initial?.address || "");
  const [query, setQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState(""); 
  
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (query.trim().length < 3 || query === selectedQuery) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        // 👇 FIX 1: Added email parameter so OpenStreetMap doesn't block your search!
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&email=admin@yourcrm.com`);
        if (!res.ok) throw new Error("Search failed");
        setResults(await res.json());
      } catch (err) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500); 
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedQuery]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setReverseLoading(true);
    try {
      // 👇 FIX 1 (Continued): Added email to reverse geocode too
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&email=admin@yourcrm.com`);
      const data = await res.json();
      if (data?.display_name) setAddress(data.display_name);
    } catch {
      // ignore
    } finally {
      setReverseLoading(false);
    }
  }, []);

  const selectPoint = (lat: number, lng: number) => {
    setMarker([lat, lng]);
    setCenter([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const selectSearchResult = (r: NominatimResult) => {
    const lat = Number(r.lat);
    const lng = Number(r.lon);
    
    setMarker([lat, lng]);
    setCenter([lat, lng]);
    setAddress(r.display_name);
    setResults([]);
    
    setQuery(r.display_name);
    setSelectedQuery(r.display_name);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setSearching(true); 
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        selectPoint(pos.coords.latitude, pos.coords.longitude);
        setSearching(false);
      },
      (err) => {
        console.warn("Location error:", err);
        alert("Unable to fetch location. Please ensure location permissions are granted.");
        setSearching(false);
      },
      { timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleConfirm = () => {
    if (!marker) return;
    onConfirm({
      lat: marker[0].toFixed(6),
      lng: marker[1].toFixed(6),
      name: name.trim(),
      address: address.trim(),
    });
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">Choose location</h3>
          <button type="button" onClick={onClose} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} // Prevents form submission
                placeholder="Search for a place or address"
                className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              {results.length > 0 && (
                // 👇 FIX 2: Changed z-10 to z-[1000] so it renders ON TOP of the Leaflet map!
                <div className="absolute z-[1000] top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-56 overflow-y-auto">
                  {results.map((r, i) => (
                    <button 
                      key={i} 
                      type="button" 
                      onClick={() => selectSearchResult(r)} 
                      className="block w-full text-left px-3 py-2 cursor-pointer text-sm hover:bg-gray-50 truncate border-b border-gray-50 last:border-0"
                    >
                      {r.display_name}
                    </button>
                  ))}
                </div>
              )}
              {searching && <p className="text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-wider absolute right-3 top-1/2 -translate-y-1/2 bg-white px-1">Loading...</p>}
            </div>
            <button 
              type="button" 
              onClick={useCurrentLocation} 
              title="Use current location" 
              className="border border-gray-300 cursor-pointer rounded-md px-3.5 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <Crosshair size={16} />
            </button>
          </div>

          {/* Added z-0 here to ensure Leaflet map drops behind our dropdown */}
          <div className="h-72 rounded-md overflow-hidden border bg-gray-50 relative z-0">
            <MapCanvas center={center} marker={marker} onSelect={selectPoint} />
          </div>
          <p className="text-xs text-gray-400 -mt-1">Tap the map to drop a pin, or drag the pin to adjust it.</p>

          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Label (e.g. Our Showroom) — shown as the location title" className="border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={reverseLoading ? "Looking up address…" : "Address"} className="border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 py-2 cursor-pointer text-sm rounded-md text-gray-600 hover:bg-gray-200 font-medium transition-colors">Cancel</button>
          <button type="button" onClick={handleConfirm} disabled={!marker} className="flex cursor-pointer items-center gap-1.5 px-4 py-2 text-sm rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors text-white disabled:opacity-40 font-medium">
            <Check size={16} /> Use this location
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}