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


// create custom icon
const customIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [38, 38],
});

// create custom icon for unsaved markers (red color)
const unsavedIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [38, 38],
});

// create custom icon for favorited markers (star icon)
const favoriteIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
  iconSize: [38, 38],
});

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

  const handleUpvoteGem = (gemId) => {
    if (upvotedMarkers.has(gemId)) {
      // Remove upvote
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
      // Add upvote
      setGemsUpvotes(prev => ({
        ...prev,
        [gemId]: prev[gemId] + 1
      }));
      setUpvotedMarkers(prev => new Set([...prev, gemId]));
    }
  };

  const handleFavoriteGem = (gemId) => {
    setGemsFavorites(prev => ({
      ...prev,
      [gemId]: !prev[gemId]
    }));
  };

  const handleDeleteGem = (gemId) => {
    setDeletedGems(prev => new Set([...prev, gemId]));
    // Also remove from upvoted markers if it was upvoted
    setUpvotedMarkers(prev => {
      const newSet = new Set(prev);
      newSet.delete(gemId);
      return newSet;
    });
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


  const handleSaveMarker = (id, name, description, category) => {
    setUserMarkers((current) =>
      current.map((m) =>
        m.id === id ? { ...m, name, description, category, saved: true } : m
      )
    );
  };

  const handleDragEnd = (id, newLatLng) => {
    setUserMarkers((current) =>
      current.map((m) =>
        m.id === id ? { ...m, position: newLatLng } : m
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-orange-100 text-gray-800">
      <h1 className="text-3xl font-bold">LocalLore Dashboard</h1>
      
      {loading && (
        <div className="flex items-center gap-2">
          <i className="pi pi-spin pi-spinner"></i>
          <span>Loading gems from database...</span>
        </div>
      )}
      
      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 justify-center">
        {FILTER_CATEGORIES.map((category) => (
          <Tag
            key={category.value}
            value={category.label}
            icon={category.icon}
            className={`cursor-pointer transition-all ${
              activeFilters.includes(category.value)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => toggleFilter(category.value)}
          />
        ))}
      </div>

      <div className="w-11/12 h-[85vh] rounded-3xl overflow-hidden shadow-xl">
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
                      <div>
                        <h3 className="font-semibold">{marker.name}</h3>
                        <p className="text-sm">{marker.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {marker.address}
                        </p>
                        <p className="text-xs text-gray-400">
                          {marker.geocode[0].toFixed(5)}, {marker.geocode[1].toFixed(5)}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-2">
                            <Button
                              icon={upvotedMarkers.has(gem.id) ? "pi pi-thumbs-up-fill" : "pi pi-thumbs-up"}
                              label={`${marker.upvotes} upvotes`}
                              className={`p-button-sm ${upvotedMarkers.has(gem.id) ? 'p-button-success' : 'p-button-outlined'}`}
                              onClick={() => handleUpvoteGem(gem.id)}
                            />
                            <Button
                              icon={marker.isFavorite ? "pi pi-star-fill" : "pi pi-star"}
                              className={`p-button-sm ${marker.isFavorite ? 'p-button-warning' : 'p-button-outlined'}`}
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
                        <div>
                          <h3 className="font-semibold">{marker.name}</h3>
                          <p className="text-sm">{marker.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {marker.address || "No address found"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {marker.position.lat.toFixed(5)}, {marker.position.lng.toFixed(5)}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex gap-2">
                              <Button
                                icon={upvotedMarkers.has(marker.id) ? "pi pi-thumbs-up-fill" : "pi pi-thumbs-up"}
                                label={`${marker.upvotes || 0} upvotes`}
                                className={`p-button-sm ${upvotedMarkers.has(marker.id) ? 'p-button-success' : 'p-button-outlined'}`}
                                onClick={() => handleUpvoteUser(marker.id)}
                              />
                              <Button
                                icon={marker.isFavorite ? "pi pi-star-fill" : "pi pi-star"}
                                className={`p-button-sm ${marker.isFavorite ? 'p-button-warning' : 'p-button-outlined'}`}
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
            background-color: #333;
            height: 2em;
            width: 2em;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9999px; /* fully rounded */
            font-size: 1.2rem;
            box-shadow: 0 0 0 5px #fff;
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

