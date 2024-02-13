import icons from "./icons.js";
import { getPlacesResults } from "./places.js";

export function showPlaceInfo(markerId) {
  const types = ["достопримечательности", "рестораны", "магазины", "custom"];
  let foundPlace;
  var iconType = "custom";
  for (let type of types) {
    const places = getPlacesResults(type);
    foundPlace = places.find(
      (place) =>
        `marker_${place.coords.latitude}_${place.coords.longitude}` === markerId
    );
    if (foundPlace) {
      iconType = type;
      break;
    }
  }

  if (!foundPlace) return;
  document.querySelector(".card-title").textContent =
    foundPlace.data.name || "Название неизвестно";
  document.querySelector(".card-icon").src = icons[iconType];
  document.querySelector(
    ".card-address"
  ).innerHTML = `<strong>Адрес:</strong> ${foundPlace.data.address}`;
  document.querySelector(
    ".card-phone"
  ).innerHTML = `<strong>Телефон:</strong> ${
    foundPlace.data.Phones?.[0]?.formatted || "Не указан"
  }`;
  document.querySelector(
    ".card-category"
  ).innerHTML = `<strong>Категория:</strong> ${
    foundPlace.data.Categories?.[0]?.name || "Не указана"
  }`;
  document.querySelector(
    ".card-hours"
  ).innerHTML = `<strong>Часы работы:</strong> ${
    foundPlace.data.Hours?.text || "Не указаны"
  }`;
  const urlElement = document.querySelector(".card-url");
  if (foundPlace.data.url) {
    urlElement.href = foundPlace.data.url;
    urlElement.textContent = "Веб-сайт";
    urlElement.style.display = "inline";
  } else {
    urlElement.style.display = "none";
  }
}
