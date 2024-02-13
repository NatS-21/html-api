import icons from "./icons.js";
import { showPlaceInfo } from "./ui.js";
import { getUserPosition } from "./map.js";

export function createPlacemark(type, coords, map) {
  const markerId = `marker_${coords.latitude}_${coords.longitude}`;
  const markerElement = document.createElement("div");
  markerElement.className = "marker-class";
  markerElement.style.backgroundImage = `url(${
    icons[type] || "../icons/marker-user.svg"
  })`;
  markerElement.style.width = "15px";
  markerElement.style.height = "28px";
  markerElement.style.backgroundSize = "contain";
  markerElement.style.backgroundRepeat = "no-repeat";
  markerElement.style.backgroundPosition = "center";
  markerElement.style.position = "absolute";
  markerElement.style.top = "-20px";
  markerElement.style.left = "-7px";

  const popupElement = document.createElement("div");
  popupElement.className = "custom-popup";
  popupElement.style.position = "absolute";
  popupElement.style.left = "0";
  popupElement.style.top = "0";
  popupElement.style.transform = "translate(-50%, -100%)";
  popupElement.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
  popupElement.style.padding = "5px 10px";
  popupElement.style.borderRadius = "8px";
  popupElement.style.display = "none";
  popupElement.style.zIndex = "1";
  popupElement.style.minWidth = "80px";
  popupElement.style.width = "fit-content";

  if (type === "user") {
    popupElement.textContent = "Вы здесь";
  } else if (type === "custom") {
    const currentDate = new Date().toLocaleString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    popupElement.textContent = `${currentDate}`;
  }

  markerElement.appendChild(popupElement);

  markerElement.addEventListener("click", () => {

    if (type === "user" || type === "custom") {
      const isDisplayed = popupElement.style.display === "flex";
      popupElement.style.display = isDisplayed ? "none" : "flex";
    } else {
      showPlaceInfo(markerId);
    }
  });

  const marker = new ymaps3.YMapMarker(
    {
      coordinates: [coords.longitude, coords.latitude],
      mapFollowsOnDrag: true,
      draggable: type == "custom",
    },
    markerElement
  );

  map.addChild(marker);
}

export async function searchPlaces(type, position, map) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const apiKey = "dce138ed-441c-4939-b270-abc0dbce1b92";
  const query = encodeURIComponent(`${type} в городе`);
  const lang = "ru_RU";

  const ll = `${longitude},${latitude}`;
  const spn = "0.05,0.05";
  const url = `https://search-maps.yandex.ru/v1/?text=${query}&type=biz&lang=${lang}&ll=${ll}&spn=${spn}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    savePlacesResults(
      type,
      data.features.map((feature) => ({
        type: type,
        coords: {
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        },
        data: feature.properties.CompanyMetaData,
      }))
    );

    data.features.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      createPlacemark(type, { latitude: coords[1], longitude: coords[0] }, map);
    });
  } catch (error) {
    console.error("Ошибка при выполнении запроса к Yandex Search API:", error);
  }
}

export function initPlaces(position, map) {
  const categories = ["достопримечательности", "рестораны", "магазины"];
  categories.forEach((category) => {
    const savedResults = getPlacesResults(category);
    if (savedResults.length > 0) {
      savedResults.forEach((result) => {
        createPlacemark(result.type, result.coords, map);
      });
    } else {
      searchPlaces(category, position, map);
    }
  });
}

export function savePlacesResults(type, results) {
  localStorage.setItem(`placesResults_${type}`, JSON.stringify(results));
}

export function getPlacesResults(type) {
  const savedResults = localStorage.getItem(`placesResults_${type}`);
  return savedResults ? JSON.parse(savedResults) : [];
}

export function saveCustomPlace(coords) {
  let customPlaces = getCustomPlaces();
  customPlaces.push(coords);
  localStorage.setItem("customPlaces", JSON.stringify(customPlaces));
}

export function getCustomPlaces() {
  const savedPlaces = localStorage.getItem("customPlaces");
  return savedPlaces ? JSON.parse(savedPlaces) : [];
}