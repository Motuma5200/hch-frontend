// HospitalMap.jsx

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// FIX DEFAULT LEAFLET ICONS
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// User location icon (blue)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Hospital icon factory by distance color
const createHospitalIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Distance → color mapping
const getHospitalColor = (distanceKm) => {
  if (distanceKm <= 5)  return 'green';    // very close
  if (distanceKm <= 15) return 'orange';   // medium
  return 'red';                            // farther
};

// HAVERSINE DISTANCE
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// MAP CLICK HANDLER
function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

const HospitalMap = () => {
  const [hospitals, setHospitals] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [radiusKm] = useState(50);
  const [locationMessage, setLocationMessage] = useState('');

  const mapRef = useRef(null);
  const defaultCenter = [9.0300, 38.7400]; // Addis Ababa fallback

  // IP-based location fallback
  const fetchIPLocation = async () => {
    try {
      const response = await fetch('http://ip-api.com/json/');
      const data = await response.json();

      if (data.status === 'success' && data.lat && data.lon) {
        const approxPos = { lat: data.lat, lng: data.lon };
        setUserPosition(approxPos);
        setLocationMessage(`Approximate location detected: ${data.city || 'your area'}`);

        if (mapRef.current) {
          mapRef.current.flyTo([approxPos.lat, approxPos.lng], 10);
        }
      } else {
        setLocationMessage('Could not detect location automatically.');
      }
    } catch (err) {
      console.warn('IP geolocation failed:', err);
      setLocationMessage('Could not detect location automatically.');
    }
  };

  // Automatic location detection on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserPosition(newPos);
          setLocationMessage('Using your precise location');

          if (mapRef.current) {
            mapRef.current.flyTo([newPos.lat, newPos.lng], 14);
          }
        },
        (err) => {
          console.warn('Geolocation permission denied or unavailable:', err);
          setLocationMessage('Precise location access denied — using approximate location');
          fetchIPLocation(); // fallback
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setLocationMessage('Geolocation not supported — using approximate location');
      fetchIPLocation();
    }
  }, []);

  // Fetch hospitals from your Laravel API
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/hospitals');
        setHospitals(response.data);
      } catch (err) {
        console.error('Failed to load hospitals:', err);
        setError('Failed to load hospitals. Check your backend API.');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  // Calculate nearby hospitals when user position or hospitals change
  useEffect(() => {
    if (!userPosition || hospitals.length === 0) {
      setNearbyHospitals([]);
      return;
    }

    const withDistance = hospitals
      .map((hospital) => {
        const distance = calculateDistance(
          userPosition.lat,
          userPosition.lng,
          hospital.latitude,
          hospital.longitude
        );
        return { ...hospital, distance: distance.toFixed(2) };
      })
      .filter((h) => h.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    setNearbyHospitals(withDistance);
  }, [userPosition, hospitals, radiusKm]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserPosition(newPos);
        setLocationMessage('Using your precise location');

        if (mapRef.current) {
          mapRef.current.flyTo([newPos.lat, newPos.lng], 14);
        }
      },
      (err) => alert('Unable to get location: ' + err.message),
      { enableHighAccuracy: true }
    );
  };

  const handleMapClick = (latlng) => {
    setUserPosition(latlng);
    setLocationMessage('Custom location selected on map');
    if (mapRef.current) {
      mapRef.current.flyTo([latlng.lat, latlng.lng], 14);
    }
  };

  if (loading) return <div className="text-center p-5">Loading hospitals...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  return (
    <div className="container-fluid py-4 mt-5 bg-light min-vh-90">
      <div className="row g-4">

        {/* MAP SECTION */}
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-body p-0">
              <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: '500px', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Hospital markers with distance-based colors */}
                {hospitals.map((hospital) => {
                  const distance = userPosition
                    ? calculateDistance(
                        userPosition.lat,
                        userPosition.lng,
                        hospital.latitude,
                        hospital.longitude
                      )
                    : null;

                  const color = distance !== null ? getHospitalColor(distance) : 'blue';
                  const icon = createHospitalIcon(color);

                  return (
                    <Marker
                      key={hospital.id}
                      position={[hospital.latitude, hospital.longitude]}
                      icon={icon}
                    >
                      <Popup>
                        <strong>{hospital.name}</strong><br />
                        {hospital.address || ''}<br />
                        {distance !== null && (
                          <>
                            Distance: <strong>{distance.toFixed(1)} km</strong><br />
                            <small>
                              {color === 'green' ? 'Very close' :
                               color === 'orange' ? 'Nearby' : 'Farther away'}
                            </small>
                          </>
                        )}
                      </Popup>
                    </Marker>
                  );
                })}

                {/* User position marker */}
                {userPosition && (
                  <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
                    <Popup>
                      <strong>Your location</strong><br />
                      {locationMessage || 'Selected / Current position'}
                    </Popup>
                  </Marker>
                )}

                <LocationPicker onLocationSelect={handleMapClick} />
              </MapContainer>
            </div>
          </div>

          <div className="mt-3 d-flex gap-3 flex-wrap">
            <button onClick={getCurrentLocation} className="btn btn-primary">
              📍 Use My Precise Location
            </button>
            <button
              onClick={() => {
                setUserPosition(null);
                setLocationMessage('');
                if (mapRef.current) {
                  mapRef.current.flyTo(defaultCenter, 12);
                }
              }}
              className="btn btn-outline-secondary"
            >
              Reset Map
            </button>
          </div>

          {locationMessage && (
            <div className="mt-2 alert alert-info small">
              {locationMessage}
            </div>
          )}
        </div>

        {/* HOSPITAL LIST */}
        <div className="col-lg-4">
          <div className="card shadow" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <div className="card-body">
              <h4 className="mb-4">🏥 Nearby Hospitals</h4>

              {!userPosition && (
                <p className="text-muted fst-italic">
                  Detecting your location automatically...<br />
                  Or click on the map to choose a position.
                </p>
              )}

              {userPosition && nearbyHospitals.length === 0 && (
                <p className="text-warning">
                  No hospitals found within {radiusKm} km of your location.
                </p>
              )}

              {nearbyHospitals.length > 0 && (
                <div className="d-flex flex-column gap-3">
                  {nearbyHospitals.map((hospital) => (
                    <div key={hospital.id} className="card border">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="fw-bold mb-1">{hospital.name}</h6>
                            <small className="text-muted">{hospital.address}</small>
                          </div>
                          <div className={`badge bg-${getHospitalColor(hospital.distance)} text-white`}>
                            {hospital.distance} km
                          </div>
                        </div>

                        {hospital.phone && (
                          <p className="small mt-2 mb-1">📞 {hospital.phone}</p>
                        )}

                        <button
                          className="btn btn-link btn-sm p-0 mt-2"
                          onClick={() => {
                            if (mapRef.current) {
                              mapRef.current.flyTo([hospital.latitude, hospital.longitude], 15);
                            }
                          }}
                        >
                          📍 Show on map
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {userPosition && (
                <p className="text-muted small text-center mt-4">
                  Showing hospitals within {radiusKm} km
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalMap;