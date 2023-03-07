let pokemonStorage = []

async function fetchPokemons(amount, offset=0) {
  const data = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${amount}`, { mode: 'cors' })
  const jsonData = await data.json()
  console.log(jsonData['results'])
  return new Promise((resolve) => {
    const found = []
    for (const pokemon of jsonData['results']) {
      found.push(pokemon)
    }
    resolve(dataDiv(found))
  })
}

const dataDiv = (object) => {
  const result_area = document.getElementById('result_area')
  for (const pokemon of object) {
    const div = document.createElement('div')
    div.classList.add('card')
    const img = div.appendChild(document.createElement('img'))
    img.src = `https://raw.githubusercontent.com/pokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.url.split('/').slice(-2, -1)}.svg`
    div.appendChild(document.createElement('h2')).textContent = pokemon.name
    result_area.appendChild(div)
  }
}

fetchPokemons(500)