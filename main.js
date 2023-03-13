const generationsRadioButton = document.getElementsByName('pokemon_generations')
const typesCheckBox = document.getElementsByName('pokemon_types')
const resultArea = document.getElementById('result_area')
const searchInput = document.getElementById('search_input')
const firstGen = document.getElementById('first')
let pokemonsSummary = []

async function fetchGeneration(generation) {
  const pokemonsAllData = []
  return fetch(`https://pokeapi.co/api/v2/generation/${generation}/`)
    .then((response) => response.json())
    .then((data) => {
      return data.pokemon_species
    })
    .then(async (data) => {
      await Promise.all(
        data.map(async (element, index, array) => {
          const response = await fetch(element.url)
          const data = await response.json()
          array[index] = { ...element, ...data }
        })
      )
      return data
    })
    .then(async (data) => {
      await Promise.all(
        data.map(async (element, index, array) => {
          const response = await fetch(element.varieties[0].pokemon.url)
          const data = await response.json()
          array[index] = { ...element, ...data }
        })
      )
      return data
    })
    .then((data) => {
      pokemonsAllData.push(...data)
      return pokemonsAllData
    })
}

async function processData(generation) {
  pokemonsSummary = []
  const pokemonsAllData = await fetchGeneration(generation)
  for (const pokemon of pokemonsAllData) {
    const types = []
    for (const type of pokemon.types) {
      types.push(type.type.name)
    }
    const pokemonObj = {
      id: pokemon.id,
      name: pokemon.name,
      type: types,
      img: pokemon.sprites.other.dream_world.front_default
    }
    pokemonsSummary.push(pokemonObj)
  }
  pokemonsSummary.sort((a, b) => a.id - b.id)
  const desiredTypes = []
  typesCheckBox.forEach((element) => {
    if (element.checked) {
      desiredTypes.push(element.value)
    }
  })
  if (desiredTypes.length > 0) {
    const filteredData = pokemonsSummary.filter((pokemon) =>
      desiredTypes.some((type) => pokemon.type.includes(type))
    )
    resultArea.innerHTML = ''
    dataToDiv(filteredData)
  } else {
    dataToDiv(pokemonsSummary)
  }
}

function manage() {
  let generation = null
  generationsRadioButton.forEach((element) => {
    if (element.checked) {
      generation = element.value
    }
  })
  resultArea.innerHTML = ''
  if (pokemonsSummary.length == 0) {
    firstGen.checked = true
  }
  searchInput.value = ''
  processData(generation ? generation : 1)
}

function dataToDiv(array) {
  array.forEach((element) => {
    const div = document.createElement('div')
    div.classList.add('card')
    const img = div.appendChild(document.createElement('img'))
    img.src = element.img
    div.appendChild(document.createElement('h2')).textContent = element.name
    div.appendChild(document.createElement('h3')).textContent =
      'ID: ' + element.id
    const type =
      element.type.length == 1
        ? 'Type: ' + element.type
        : 'Types: ' + element.type.join(', ')
    div.appendChild(document.createElement('h3')).textContent = type
    resultArea.appendChild(div)
  })
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase()
  const filteredData = pokemonsSummary.filter(
    (item) =>
      item.name.includes(query) ||
      item.type.some((type) => type.includes(query))
  )
  resultArea.innerHTML = ''
  if (filteredData.length > 0) {
    dataToDiv(filteredData)
  }
})

generationsRadioButton.forEach((element) => {
  element.addEventListener('click', manage)
})

typesCheckBox.forEach((element) => {
  element.addEventListener('click', () => {
    const types = []
    typesCheckBox.forEach((element) => {
      if (element.checked) {
        types.push(element.value)
      }
    })
    if (types.length > 0) {
      const filteredData = pokemonsSummary.filter((pokemon) =>
        types.some((type) => pokemon.type.includes(type))
      )
      resultArea.innerHTML = ''
      dataToDiv(filteredData)
    } else {
      resultArea.innerHTML = ''
      dataToDiv(pokemonsSummary)
    }
  })
})
