import limitConcur from "https://unpkg.com/limit-concur@0.0.1/src/index.js";

const ul = document.querySelector("ul");
const input = document.querySelector("input");
const div = document.querySelector("div");

if ("windowControlsOverlay" in navigator) {
  const { x } = navigator.windowControlsOverlay.getBoundingClientRect();
  // Window controls are on the right.
  if (x === 0) {
    div.classList.add("search-controls-right");
  }
  // Window controls are on the left.
  else {
    div.classList.add("search-controls-left");
  }
} else {
  div.classList.add("search-controls-right");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    await navigator.serviceWorker.register("sw.js");
  });
}

const removeNonCharacters = text => {
  return text
    .replace(/\W/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
};

(async () => {
  const categories = await fetch(
    "https://api.chucknorris.io/jokes/categories"
  ).then(response => response.json());

  async function getChuckNorrisJoke(category) {
    const { value } = await fetch(
      `https://api.chucknorris.io/jokes/random?${category}`
    ).then(response => response.json());
    return value;
  }

  const limitedGetChuckNorrisJoke = limitConcur(4, getChuckNorrisJoke);
  const jokes = await Promise.all(categories.map(limitedGetChuckNorrisJoke));

  let html = "";
  jokes.forEach(joke => {
    html += `<li data-search="${removeNonCharacters(joke)}">${joke}</li>`;
  });
  ul.innerHTML = html;
})();

input.addEventListener("input", e => {
  ul.querySelectorAll("li").forEach(li => li.classList.remove("highlight"));
  if (!input.value || !ul.innerHTML) {
    return;
  }
  const value = removeNonCharacters(input.value);
  if (value.length < 2) {
    return;
  }
  ul.querySelectorAll(`[data-search*="${value}"]`).forEach(li => {
    li.classList.add("highlight");
  });
});
