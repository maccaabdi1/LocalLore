import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon, divIcon, point } from "leaflet";
import "../styles.css"

// create custom icon
const customIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [38, 38],
});

// custom cluster icon
const createClusterCustomIcon = (cluster) =>
  new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true),
  });

// markers in Rochester, NY
const markers = [
  { geocode: [43.1566, -77.6088], popUp: "Downtown Rochester" },
  { geocode: [43.158, -77.601], popUp: "Strong National Museum of Play" },
  { geocode: [43.2673, -77.6126], popUp: "Ontario Beach Park" },
  { geocode: [43.1235, -77.6286], popUp: "University of Rochester" },
  { geocode: [43.1517, -77.5416], popUp: "Seabreeze Amusement Park" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-orange-100 text-gray-800">
      <h1 className="text-3xl font-bold">React Leaflet Dashboard</h1>

      <div className="w-11/12 h-[85vh] rounded-3xl overflow-hidden shadow-xl">
        <MapContainer center={[43.1566, -77.6088]} zoom={13} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
          >
            {markers.map((marker, idx) => (
              <Marker key={idx} position={marker.geocode} icon={customIcon}>
                <Popup>{marker.popUp}</Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Inline Tailwind-based cluster styles */}
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
