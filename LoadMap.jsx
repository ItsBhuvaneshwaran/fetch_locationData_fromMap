import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cloudIcons } from "../../../constants/cloudIcons";

const LoadMap = () => {
  const mapRef = useRef(null);
  const [distance, setDistance] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    isMap: false,
    source: "",
    destination: "",
    type: "",
    sourceLatLng: "",
    destinationLatLng: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (!window.google) return;

    const defaultCenter = { lat: 12.9716, lng: 77.5946 };
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 7,
      disableDefaultUI: true,
      gestureHandling: "greedy",
    });

    const geocoder = new window.google.maps.Geocoder();
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#018800",
        strokeOpacity: 1,
        strokeWeight: 4,
      },
    });

    mapInstance.addListener("click", (e) => {
      const latLng = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results[0]) {
          const formattedAddress = results[0].formatted_address;

          if (locationDetails.type === "source") {
            dispatch(
              setLocationDetails({
                isMap: false,
                source: formattedAddress,
                destination: locationDetails.destination,
                sourceLatLng: latLng,
                destinationLatLng: locationDetails.destinationLatLng || null,
              })
            );
          } else {
            dispatch(
              setLocationDetails({
                isMap: false,
                source: locationDetails.source,
                destination: formattedAddress,
                sourceLatLng: locationDetails.sourceLatLng || null,
                destinationLatLng: latLng,
              })
            );
          }
        }
      });
    });

    // If both source and destination lat/lng are available, draw route
    if (locationDetails.sourceLatLng && locationDetails.destinationLatLng) {
      new window.google.maps.Marker({
        position: locationDetails.sourceLatLng,
        map: mapInstance,
        icon: {
          url: cloudIcons.pickupPin,
          scaledSize: new google.maps.Size(24, 24),
        },
        title: "Source",
      });

      new window.google.maps.Marker({
        position: locationDetails.destinationLatLng,
        map: mapInstance,
        icon: {
          url: cloudIcons.dropPin,
          scaledSize: new google.maps.Size(24, 24),
        },
        title: "Destination",
      });

      directionsService.route(
        {
          origin: locationDetails.sourceLatLng,
          destination: locationDetails.destinationLatLng,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(result);

            const distanceText =
              result.routes[0]?.legs[0]?.distance?.text || null;
            setDistance(distanceText);
          }
        }
      );
    }
  }, [locationDetails, dispatch]);

  return (
    <div className="relative z-50 w-full max-w-4xl h-full bg-white shadow-lg flex flex-col p-6">
      {/* Google Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-md" />

      {/* Distance Display */}
      {distance && (
        <div className="absolute top-4 right-4 bg-white shadow-md px-4 py-2 rounded-lg text-sm font-medium text-gray-800 z-10">
          Distance: {distance}
        </div>
      )}

      {/* Close Icon */}
      <img
        src={cloudIcons.close}
        alt="Close"
        onClick={() =>
          dispatch(
            setLocationDetails({
              ...locationDetails,
              isMap: false,
            })
          )
        }
        className="absolute top-10 left-10 w-6 h-6 cursor-pointer z-20 bg-white shadow-md"
      />
    </div>
  );
};

export default LoadMap;
