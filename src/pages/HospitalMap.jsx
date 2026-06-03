// HospitalMap.jsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// ✅ IMPORT YOUR CUSTOM API WRAPPER
import api from '../services/Api'; // Double check this relative path matches your project structure!

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

const getHospitalColor = (distanceKm) => {
  if (distanceKm <= 5)  return 'green';
  if (distanceKm <= 15) return 'orange';
  return 'red';
};

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

// MAP CONTROLLER SUB-COMPONENT
function MapController({ flyToTarget, setFlyToTarget }) {
  const mapInstance = useMap();

  useEffect(() => {
    if (flyToTarget) {
      mapInstance.flyTo([flyToTarget.lat, flyToTarget.lng], 15, {
        animate: true,
        duration: 1.5,
      });
      setFlyToTarget(null);
    }
  }, [flyToTarget, mapInstance, setFlyToTarget]);

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
  const [flyToTarget, setFlyToTarget] = useState(null);
  
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isStraightLine, setIsStraightLine] = useState(false);

  const defaultCenter = [9.0300, 38.7400]; // Addis Ababa fallback

  const fetchIPLocation = async (isMounted) => {
    try {
      const response = await fetch('http://ip-api.com/json/');
      const data = await response.json();

      if (!isMounted) return;

      if (data.status === 'success' && data.lat && data.lon) {
        const approxPos = { lat: data.lat, lng: data.lon };
        setUserPosition(approxPos);
        setLocationMessage(`Approximate location detected: ${data.city || 'your area'}`);
        setFlyToTarget(approxPos);
      } else {
        setLocationMessage('Could not detect location automatically.');
      }
    } catch (err) {
      console.warn('IP geolocation failed:', err);
      if (isMounted) setLocationMessage('Could not detect location automatically.');
    }
  };

  // LOCATION DETECTOR EFFECT
  useEffect(() => {
    let isMounted = true;

    const handleSuccess = (position) => {
      if (!isMounted) return;
      const newPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setUserPosition(newPos);
      setLocationMessage('Using your precise location');
      setFlyToTarget(newPos);
    };

    const handleFailure = (err) => {
      console.warn('High accuracy geolocation failed:', err);
      
      if (navigator.geolocation && err.code === err.TIMEOUT) {
        console.log('Retrying with balanced accuracy settings...');
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          () => {
            if (isMounted) {
              setLocationMessage('Precise access failed — using approximate IP location');
              fetchIPLocation(isMounted);
            }
          },
          { enableHighAccuracy: false, timeout: 5000 }
        );
      } else if (isMounted) {
        setLocationMessage('Location access denied — using approximate IP location');
        fetchIPLocation(isMounted);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleFailure,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setLocationMessage('Geolocation not supported — using approximate location');
      fetchIPLocation(isMounted);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ FIXED FETCH SYSTEM: Reuses your working API instance configurations
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await api.get('/api/hospitals');
        setHospitals(response.data);
      } catch (err) {
        console.error('Failed to load hospitals:', err);
        setError('Failed to load hospitals. Check your backend API configurations.');
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []); 

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

  const getRoadRoute = async (hospitalLat, hospitalLng) => {
    if (!userPosition) return;
    setIsStraightLine(false); 
    
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userPosition.lng},${userPosition.lat};${hospitalLng},${hospitalLat}?overview=full&geometries=geojson`;
      const res = await axios.get(url);
      
      if (res.data.routes && res.data.routes.length > 0) {
        const coords = res.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(coords);
      } else {
        throw new Error("No route found through public streets lookup");
      }
    } catch (err) {
      console.warn("OSRM street routing service failed or timed out. Graceful linear fallback applied:", err);
      setRouteCoordinates([
        [userPosition.lat, userPosition.lng],
        [hospitalLat, hospitalLng]
      ]);
      setIsStraightLine(true);
    }
  };

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
        setFlyToTarget(newPos);
        setRouteCoordinates([]); 
      },
      (err) => alert('Unable to get location: ' + err.message),
      { enableHighAccuracy: true }
    );
  };

  const handleMapClick = (latlng) => {
    setUserPosition(latlng);
    setLocationMessage('Custom location selected on map');
    setFlyToTarget(latlng);
    setRouteCoordinates([]); 
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
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController 
                  flyToTarget={flyToTarget} 
                  setFlyToTarget={setFlyToTarget} 
                />

                {routeCoordinates.length > 0 && (
                  <Polyline 
                    positions={routeCoordinates} 
                    pathOptions={{ 
                      color: isStraightLine ? '#dc3545' : '#0d6efd', 
                      weight: 5, 
                      opacity: 0.75,
                      dashArray: isStraightLine ? '10, 10' : null 
                    }} 
                  />
                )}

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
                setRouteCoordinates([]); 
                setFlyToTarget({ lat: defaultCenter[0], lng: defaultCenter[1] });
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
                          className="btn btn-link btn-sm p-0 mt-2 text-decoration-none fw-semibold"
                          onClick={() => {
                            setFlyToTarget({ lat: hospital.latitude, lng: hospital.longitude });
                            getRoadRoute(hospital.latitude, hospital.longitude);
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