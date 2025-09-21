import "./styles.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import { Icon, divIcon, point } from "leaflet";

// create custom icon
const customIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [38, 38] // size of the icon
});

// custom cluster icon
const createClusterCustomIcon = function (cluster) {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};

// markers in Rochester, NY
const markers = [
  {
    geocode: [43.1566, -77.6088],
    popUp: "Downtown Rochester"
  },
  {
    geocode: [43.1580, -77.6010],
    popUp: "Strong National Museum of Play"
  },
  {
    geocode: [43.2673, -77.6126],
    popUp: "Ontario Beach Park"
  },
  {
    geocode: [43.1235, -77.6286],
    popUp: "University of Rochester"
  },
  {
    geocode: [43.1517, -77.5416],
    popUp: "Seabreeze Amusement Park"
  }
];

export default function Dashboard() {
  return (
    <MapContainer center={[43.1566, -77.6088]} zoom={13}>
      {/* OPEN STREEN MAPS TILES */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
      >
        {/* Mapping through the markers */}
        {markers.map((marker) => (
          <Marker position={marker.geocode} icon={customIcon}>
            <Popup>{marker.popUp}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
