import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon, divIcon, point } from "leaflet";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { FloatLabel } from 'primereact/floatlabel';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import 'primeicons/primeicons.css';
import "../styles.css";

// Filter categories
const FILTER_CATEGORIES = [
  { label: 'All', value: 'all', icon: 'pi pi-globe' },
  { label: 'Restaurants', value: 'Restaurant', icon: 'pi pi-shopping-cart' },
  { label: 'Cafés', value: 'Café', icon: 'pi pi-heart' },
  { label: 'Entertainment', value: 'Entertainment', icon: 'pi pi-play' },
  { label: 'Bookstores', value: 'Bookstore', icon: 'pi pi-bookmark' },
  { label: 'Parks', value: 'Park', icon: 'pi pi-star' }
];

async function getAddressFromLatLng(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  );
  if (!res.ok) return "";
  const data = await res.json();
  return data.display_name || "";
}

// Custom SVG icons that match our color scheme
const createCustomMarkerIcon = (color = '#77966d', size = 38) => {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#ffedd4" stroke-width="2"/>
      <circle cx="12" cy="9" r="2.5" fill="#ffedd4"/>
    </svg>
  `;
  const encodedSvg = encodeURIComponent(svg);
  return new Icon({
    iconUrl: `data:image/svg+xml,${encodedSvg}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size + 10],
  });
};

// create custom icon (sage green)
const customIcon = createCustomMarkerIcon('#77966d');

// create custom icon for unsaved markers (burgundy)
const unsavedIcon = createCustomMarkerIcon('#56282d');

// create custom icon for favorited markers (golden color)
const favoriteIcon = createCustomMarkerIcon('#544343');

// custom cluster icon
const createClusterCustomIcon = (cluster) =>
  new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true),
  });

function AddMarkerOnDoubleClick({ onAddMarker }) {
  useMapEvents({
    dblclick(e) {
      onAddMarker(e.latlng);
    },
  });
  return null;
}

export default function Dashboard() {
  const [userMarkers, setUserMarkers] = useState([]);
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [gems, setGems] = useState([]);
  const [gemsUpvotes, setGemsUpvotes] = useState({});
  const [gemsFavorites, setGemsFavorites] = useState({});
  const [deletedGems, setDeletedGems] = useState(new Set());
  const [upvotedMarkers, setUpvotedMarkers] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch gems from backend API
  useEffect(() => {
    const fetchGems = async () => {
      try {
        const response = await fetch('http://localhost:5266/gems');
        if (response.ok) {
          const gemsData = await response.json();
          setGems(gemsData);
          
          // Initialize upvotes and favorites state for gems
          const upvotesState = {};
          const favoritesState = {};
          gemsData.forEach(gem => {
            upvotesState[gem.id] = gem.upvotes;
            favoritesState[gem.id] = false; // Start with no favorites
          });
          setGemsUpvotes(upvotesState);
          setGemsFavorites(favoritesState);
        } else {
          console.error('Failed to fetch gems');
        }
      } catch (error) {
        console.error('Error fetching gems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGems();
  }, []);

  const toggleFilter = (filterValue) => {
    if (filterValue === 'all') {
      setActiveFilters(['all']);
    } else {
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f !== 'all');
        if (newFilters.includes(filterValue)) {
          const updated = newFilters.filter(f => f !== filterValue);
          return updated.length === 0 ? ['all'] : updated;
        } else {
          return [...newFilters, filterValue];
        }
      });
    }
  };

  const isMarkerVisible = (category) => {
    return activeFilters.includes('all') || activeFilters.includes(category);
  };

  // Convert gem to marker format for rendering
  const convertGemToMarker = (gem) => {
    return {
      id: gem.id,
      geocode: [
        gem.coordinates?.lat || 43.1566, // Default to Rochester center if missing
        gem.coordinates?.lng || -77.6088
      ],
      name: gem.name,
      description: gem.description,
      address: gem.address,
      category: gem.category,
      upvotes: gemsUpvotes[gem.id] || gem.upvotes || 0,
      isFavorite: gemsFavorites[gem.id] || false
    };
  };

  const handleUpvoteUser = (markerId) => {
    if (upvotedMarkers.has(markerId)) {
      // Remove upvote
      setUserMarkers(current =>
        current.map(marker =>
          marker.id === markerId
            ? { ...marker, upvotes: Math.max(0, (marker.upvotes || 0) - 1) }
            : marker
        )
      );
      setUpvotedMarkers(prev => {
        const newSet = new Set(prev);
        newSet.delete(markerId);
        return newSet;
      });
    } else {
      // Add upvote
      setUserMarkers(current =>
        current.map(marker =>
          marker.id === markerId
            ? { ...marker, upvotes: (marker.upvotes || 0) + 1 }
            : marker
        )
      );
      setUpvotedMarkers(prev => new Set([...prev, markerId]));
    }
  };

  const handleUpvoteGem = async (gemId) => {
    try {
      if (upvotedMarkers.has(gemId)) {
        // Remove upvote via API
        const response = await fetch(`http://localhost:5266/gems/${gemId}/downvote`, {
          method: 'PATCH',
        });
        
        if (response.ok) {
          setGemsUpvotes(prev => ({
            ...prev,
            [gemId]: Math.max(0, prev[gemId] - 1)
          }));
          setUpvotedMarkers(prev => {
            const newSet = new Set(prev);
            newSet.delete(gemId);
            return newSet;
          });
        } else {
          console.error('Failed to downvote gem');
        }
      } else {
        // Add upvote via API
        const response = await fetch(`http://localhost:5266/gems/${gemId}/upvote`, {
          method: 'PATCH',
        });
        
        if (response.ok) {
          setGemsUpvotes(prev => ({
            ...prev,
            [gemId]: prev[gemId] + 1
          }));
          setUpvotedMarkers(prev => new Set([...prev, gemId]));
        } else {
          console.error('Failed to upvote gem');
        }
      }
    } catch (error) {
      console.error('Error updating upvote:', error);
    }
  };

  const handleFavoriteGem = (gemId) => {
    setGemsFavorites(prev => ({
      ...prev,
      [gemId]: !prev[gemId]
    }));
  };

  const handleDeleteGem = async (gemId) => {
    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // if (!currentUser.id) {
      //   alert('You must be logged in to delete gems');
      //   return;
      // }

      const response = await fetch(`http://localhost:5266/gems/${gemId}`, {
        method: 'DELETE',
        headers: {
          'User-Id': currentUser.id,
        },
      });

      if (response.ok) {
        setDeletedGems(prev => new Set([...prev, gemId]));
        // Also remove from upvoted markers if it was upvoted
        setUpvotedMarkers(prev => {
          const newSet = new Set(prev);
          newSet.delete(gemId);
          return newSet;
        });
      } else if (response.status === 403) {
        alert('Only administrators can delete gems');
      } else if (response.status === 401) {
        alert('Invalid user credentials');
      } else {
        console.error('Failed to delete gem');
        alert('Failed to delete gem');
      }
    } catch (error) {
      console.error('Error deleting gem:', error);
      alert('Error deleting gem');
    }
  };

  const handleFavoriteUser = (markerId) => {
    setUserMarkers(current =>
      current.map(marker =>
        marker.id === markerId
          ? { ...marker, isFavorite: !marker.isFavorite }
          : marker
      )
    );
  };

  const handleDeleteUser = (markerId) => {
    setUserMarkers(current => current.filter(marker => marker.id !== markerId));
    // Also remove from upvoted markers if it was upvoted
    setUpvotedMarkers(prev => {
      const newSet = new Set(prev);
      newSet.delete(markerId);
      return newSet;
    });
  };

  const handleAddMarker = async (latlng) => {
    // fetch address
    const address = await getAddressFromLatLng(latlng.lat, latlng.lng);

    setUserMarkers((current) => [
      ...current,
      {
        id: Date.now(),
        position: latlng,
        address,          // store address here
        name: "",
        description: "",
        category: "Restaurant", // default category
        upvotes: 0,
        isFavorite: false,
        saved: false,
      },
    ]);
  };


  const handleSaveMarker = async (id, name, description, category) => {
    try {
      // Find the marker being saved
      const marker = userMarkers.find(m => m.id === id);
      if (!marker) return;

      // Create gem via API
      const gemData = {
        name,
        description,
        address: marker.address || "Unknown address",
        coordinates: {
          lat: marker.position.lat,
          lng: marker.position.lng
        },
        category,
        photoUrl: "https://via.placeholder.com/300x200", // Default placeholder
        upvotes: 0,
        userId: "000000000000000000000000" // Default user ID for now
      };

      const response = await fetch('http://localhost:5266/gems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gemData),
      });

      if (response.ok) {
        const newGem = await response.json();
        
        // Remove from user markers and add to gems
        setUserMarkers(current => current.filter(m => m.id !== id));
        
        // Add to gems state
        setGems(prev => [...prev, {
          id: newGem.id,
          name: newGem.name,
          description: newGem.description,
          address: newGem.address,
          coordinates: newGem.coordinates,
          category: newGem.category,
          upvotes: newGem.upvotes,
          userId: newGem.userId
        }]);
        
        // Initialize upvotes and favorites for the new gem
        setGemsUpvotes(prev => ({ ...prev, [newGem.id]: newGem.upvotes }));
        setGemsFavorites(prev => ({ ...prev, [newGem.id]: false }));
        
      } else {
        console.error('Failed to create gem');
        alert('Failed to create gem');
        // Still update local state as fallback
        setUserMarkers((current) =>
          current.map((m) =>
            m.id === id ? { ...m, name, description, category, saved: true } : m
          )
        );
      }
    } catch (error) {
      console.error('Error creating gem:', error);
      alert('Error creating gem');
      // Still update local state as fallback
      setUserMarkers((current) =>
        current.map((m) =>
          m.id === id ? { ...m, name, description, category, saved: true } : m
        )
      );
    }
  };

  const handleDragEnd = (id, newLatLng) => {
    setUserMarkers((current) =>
      current.map((m) =>
        m.id === id ? { ...m, position: newLatLng } : m
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4" style={{ 
      background: 'linear-gradient(135deg, #ffedd4 0%, #77966d 100%)' 
    }}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#544343' }}>
          LocalLore Dashboard
        </h1>
        <p className="text-lg" style={{ color: '#626d58' }}>
          Double-click on the map to add a new gem (Admin login required only for deleting)
        </p>
      </div>
      
      {loading && (
        <div className="flex items-center gap-2 p-4 rounded-lg" style={{ 
          background: 'rgba(255, 237, 212, 0.8)', 
          color: '#626d58' 
        }}>
          <i className="pi pi-spin pi-spinner"></i>
          <span>Loading gems from database...</span>
        </div>
      )}
      
      {/* Filter Tags */}
      <div className="flex flex-wrap gap-3 justify-center p-4 rounded-2xl" style={{ 
        background: 'rgba(255, 237, 212, 0.8)' 
      }}>
        {FILTER_CATEGORIES.map((category) => (
          <Tag
            key={category.value}
            value={category.label}
            icon={category.icon}
            className={`filter-button cursor-pointer transition-all ${
              activeFilters.includes(category.value) ? 'active' : ''
            }`}
            onClick={() => toggleFilter(category.value)}
          />
        ))}
      </div>

      <div className="w-11/12 h-[85vh] rounded-3xl overflow-hidden shadow-2xl" style={{ 
        border: '3px solid #77966d',
        boxShadow: '0 25px 50px rgba(84, 67, 67, 0.2)' 
      }}>
        <MapContainer
          center={[43.1566, -77.6088]}
          zoom={13}
          className="h-full w-full"
          doubleClickZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <AddMarkerOnDoubleClick onAddMarker={handleAddMarker} />

          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
          >
            {/* gems from database */}
            {!loading && gems
              .filter(gem => isMarkerVisible(gem.category) && !deletedGems.has(gem.id))
              .map((gem, idx) => {
                const marker = convertGemToMarker(gem);
                return (
                  <Marker 
                    key={gem.id} 
                    position={marker.geocode} 
                    icon={marker.isFavorite ? favoriteIcon : customIcon}
                  >
                    <Popup className="big-popup">
                      <div style={{ color: '#544343' }}>
                        <h3 className="font-semibold text-lg mb-2" style={{ color: '#544343' }}>
                          {marker.name}
                        </h3>
                        <p className="text-sm mb-2" style={{ color: '#626d58' }}>
                          {marker.description}
                        </p>
                        <p className="text-xs mb-1" style={{ color: '#626d58', opacity: 0.8 }}>
                          {marker.address}
                        </p>
                        <p className="text-xs mb-3" style={{ color: '#626d58', opacity: 0.6 }}>
                          {marker.geocode[0].toFixed(5)}, {marker.geocode[1].toFixed(5)}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-2">
                            <Button
                              icon={upvotedMarkers.has(gem.id) ? "pi pi-thumbs-up-fill" : "pi pi-thumbs-up"}
                              label={`${marker.upvotes} upvotes`}
                              className={`p-button-sm ${upvotedMarkers.has(gem.id) ? '' : 'p-button-outlined'}`}
                              onClick={() => handleUpvoteGem(gem.id)}
                            />
                            <Button
                              icon={marker.isFavorite ? "pi pi-star-fill" : "pi pi-star"}
                              className={`p-button-sm ${marker.isFavorite ? '' : 'p-button-outlined'}`}
                              onClick={() => handleFavoriteGem(gem.id)}
                              tooltip={marker.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            />
                          </div>
                          <Button
                            icon="pi pi-trash"
                            className="p-button-sm p-button-danger p-button-outlined"
                            onClick={() => handleDeleteGem(gem.id)}
                            tooltip="Delete marker"
                          />
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

            {/* user-added markers */}
            {userMarkers
              .filter(marker => isMarkerVisible(marker.category))
              .map((marker) => {
                let markerIcon;
                if (!marker.saved) {
                  markerIcon = unsavedIcon;
                } else if (marker.isFavorite) {
                  markerIcon = favoriteIcon;
                } else {
                  markerIcon = customIcon;
                }
                
                return (
                  <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={markerIcon}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const newLatLng = e.target.getLatLng();
                        handleDragEnd(marker.id, newLatLng);
                      },
                    }}
                  >
                    <Popup className="big-popup">
                      {marker.saved ? (
                        <div style={{ color: '#544343' }}>
                          <h3 className="font-semibold text-lg mb-2" style={{ color: '#544343' }}>
                            {marker.name}
                          </h3>
                          <p className="text-sm mb-2" style={{ color: '#626d58' }}>
                            {marker.description}
                          </p>
                          <p className="text-xs mb-1" style={{ color: '#626d58', opacity: 0.8 }}>
                            {marker.address || "No address found"}
                          </p>
                          <p className="text-xs mb-3" style={{ color: '#626d58', opacity: 0.6 }}>
                            {marker.position.lat.toFixed(5)}, {marker.position.lng.toFixed(5)}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex gap-2">
                              <Button
                                icon={upvotedMarkers.has(marker.id) ? "pi pi-thumbs-up-fill" : "pi pi-thumbs-up"}
                                label={`${marker.upvotes || 0} upvotes`}
                                className={`p-button-sm ${upvotedMarkers.has(marker.id) ? '' : 'p-button-outlined'}`}
                                onClick={() => handleUpvoteUser(marker.id)}
                              />
                              <Button
                                icon={marker.isFavorite ? "pi pi-star-fill" : "pi pi-star"}
                                className={`p-button-sm ${marker.isFavorite ? '' : 'p-button-outlined'}`}
                                onClick={() => handleFavoriteUser(marker.id)}
                                tooltip={marker.isFavorite ? "Remove from favorites" : "Add to favorites"}
                              />
                            </div>
                            <Button
                              icon="pi pi-trash"
                              className="p-button-sm p-button-danger p-button-outlined"
                              onClick={() => handleDeleteUser(marker.id)}
                              tooltip="Delete marker"
                            />
                          </div>
                        </div>
                      ) : (
                        <MarkerForm
                          marker={marker}
                          onSave={handleSaveMarker}
                        />
                      )}
                    </Popup>
                  </Marker>
                );
              })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <style>
        {`
          .cluster-icon {
            background: linear-gradient(135deg, #77966d 0%, #626d58 100%);
            height: 2em;
            width: 2em;
            color: #ffedd4;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9999px;
            font-size: 1.2rem;
            font-weight: 700;
            box-shadow: 0 0 0 3px #ffedd4, 0 4px 15px rgba(119, 150, 109, 0.3);
            border: 2px solid #77966d;
          }
        `}
      </style>
    </div>
  );
}

// separate small component for the form
function MarkerForm({ marker, onSave }) {
  const [name, setName] = useState(marker.name);
  const [description, setDescription] = useState(marker.description);
  const [category, setCategory] = useState(marker.category);

  const categoryOptions = FILTER_CATEGORIES.filter(cat => cat.value !== 'all');

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-4 w-full">
        <FloatLabel className="w-full mb-3">
          <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
          <label htmlFor="name">Name</label>
        </FloatLabel>

        <FloatLabel className="w-full mb-3">
          <Dropdown
            id="category"
            value={category}
            onChange={(e) => setCategory(e.value)}
            options={categoryOptions}
            optionLabel="label"
            optionValue="value"
            className="w-full"
          />
          <label htmlFor="category">Category</label>
        </FloatLabel>

        <FloatLabel className="w-full mb-3">
          <InputTextarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full" />
          <label htmlFor="description">Description</label>
        </FloatLabel>

      </div>


      <Button
        label="Save"
        icon="pi pi-check"
        className="w-full"
        onClick={() => onSave(marker.id, name, description, category)}
      />
    </div>
  );
}

