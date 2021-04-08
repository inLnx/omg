import limitConcur from "https://unpkg.com/limit-concur@0.0.1/src/index.js";

const ul = document.querySelector("ul");
const input = document.querySelector("input");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    await navigator.serviceWorker.register("sw.js");
  });
}

const removeNonCharacters = text => {
  return text.replace(/\W/g, "-").replace(/-+/g, "-");
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
  ul.querySelectorAll(
    `[data-search*="${removeNonCharacters(input.value)}"]`
  ).forEach(li => {
    li.classList.add("highlight");
  });
});
