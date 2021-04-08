import limitConcur from 'https://unpkg.com/limit-concur@0.0.1/src/index.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    await navigator.serviceWorker.register('sw.js');
  });
}

(async () => {
  const categories = await fetch('https://api.chucknorris.io/jokes/categories').then(response => response.json())

  async function getChuckNorrisJoke(category) {
    const { value } = await fetch(`https://api.chucknorris.io/jokes/random?${category}`).then(response => response.json())      
    return value
  }

  const limitedGetChuckNorrisJoke = limitConcur(4, getChuckNorrisJoke)
  const jokes = await Promise.all(categories.map(limitedGetChuckNorrisJoke))
  
  const ul = document.querySelector('ul')
  const html = '';
  jokes.forEach((joke) => {
    html += `<li data-search="${joke.}">`
  })
})();
