import {
  initPlaces,
  createPlacemark,
  getCustomPlaces,
  saveCustomPlace,
} from "./places.js";
import mapCustomization from "./mapCustomization.js";

export function addClickListener(map) {
  const contextMenuHandler = (object, event) => {
    const coords = event.coordinates;

    createPlacemark(
      "custom",
      { latitude: coords[1], longitude: coords[0] },
      map
    );

    saveCustomPlace({ latitude: coords[1], longitude: coords[0] });
  };

  const mapListener = new ymaps3.YMapListener({
    layer: "any",
    onContextMenu: contextMenuHandler,
  });

  map.addChild(mapListener);
}

export async function initMap() {
  await ymaps3.ready;

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapListener,
  } = ymaps3;

  var map = new YMap(document.getElementById("map"), {
    location: {
      center: [37.588144, 55.733842],
      zoom: 16,
    },
  });

  map.addChild(
    new YMapDefaultSchemeLayer({
      customization: mapCustomization,
    })
  );
  map.addChild(new YMapDefaultFeaturesLayer());
  addClickListener(map);

  const savedPosition = getUserPosition();

  if (savedPosition) {
    map.setLocation({
      center: [savedPosition.longitude, savedPosition.latitude],
      zoom: 16,
    });
    createPlacemark("user", savedPosition, map);
    initPlaces({ coords: savedPosition }, map);
    const customPlaces = getCustomPlaces();
    customPlaces.forEach((place) => {
      const coords = place.coordinates;
      createPlacemark(
        "custom",
        { latitude: coords[1], longitude: coords[0] },
        map
      );
    });
  } else if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        saveUserPosition(position);
        map.setLocation({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 16,
        });
        createPlacemark("user", position.coords, map);
        initPlaces(position, map);
      },
      function (error) {
        console.error("Ошибка при определении местоположения: ", error);
      }
    );
  } else {
    console.log("Geolocation не поддерживается вашим браузером");
  }
}

export function saveUserPosition(position) {
  localStorage.setItem(
    "userPosition",
    JSON.stringify({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    })
  );
}

export function getUserPosition() {
  const savedPosition = localStorage.getItem("userPosition");
  return savedPosition ? JSON.parse(savedPosition) : null;
}
