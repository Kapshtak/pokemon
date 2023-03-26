/* DOM elements */
const generationsRadioButton = document.getElementsByName('pokemon_generations')
const typesCheckBox = document.getElementsByName('pokemon_types')
const resultArea = document.getElementById('result_area')
const searchInput = document.getElementById('search_input')
const menuButton = document.getElementById('mobile')
const hideButton = document.getElementById('hide')
const backButton = document.getElementById('back_to_top')
const menu = document.querySelector('.menu')

/* Other variables */
let lastFetchedGeneration = 1
let pokemonsSummary = []

/* Mob menu */
const openMobMenu = () => {
  hideButton.style.display = 'block'
  menuButton.style.display = 'none'
  if (menu.classList.contains('responsive')) {
    menu.classList.remove('responsive')
  } else {
    menu.classList.add('responsive')
  }
}

const closeMobMenu = () => {
  hideButton.style.display = 'none'
  menuButton.style.display = 'block'
  if (menu.classList.contains('responsive')) {
    menu.classList.remove('responsive')
  } else {
    menu.classList.add('responsive')
  }
}

/* Fetch features */
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
      lastFetchedGeneration = generation
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

async function processData(generation = 1) {
  if (generation != lastFetchedGeneration || pokemonsSummary.length == 0) {
    const pokemonsAllData = await fetchGeneration(generation)
    pokemonsSummary = []
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
  } else {
    dataToDiv(pokemonsSummary)
  }
}

/* Render features */
function dataToDiv(array) {
  array.forEach((element) => {
    const div = document.createElement('div')
    const innerDiv = document.createElement('div')
    const background_1 = document.createElement('div')
    const background_2 = document.createElement('div')
    const background_3 = document.createElement('div')
    const background_4 = document.createElement('div')
    background_1.classList.add('background_1')
    background_2.classList.add('background_2')
    background_3.classList.add('background_3')
    background_4.classList.add('background_4')
    div.appendChild(background_1)
    div.appendChild(background_2)
    div.appendChild(background_3)
    div.appendChild(background_4)
    div.classList.add('card')
    const img = div.appendChild(document.createElement('img'))
    img.src = element.img
    img.alt = `image of pokemon ${element.name}`
    img.addEventListener('error', function (event) {
      event.target.src = 'media/images/default.png'
      event.onerror = null
    })
    div.appendChild(document.createElement('h2')).textContent = element.name
    innerDiv.appendChild(document.createElement('h3')).textContent =
      'ID: ' + element.id
    let type
    if (element.type.length == 1) {
      type = 'Type: ' + element.type
      background_1.classList.add(`${element.type}`)
      background_2.classList.add(`${element.type}`)
      background_3.classList.add(`${element.type}`)
      background_4.classList.add(`${element.type}`)
    } else {
      type = 'Types: ' + element.type.join(', ')
      background_1.classList.add(`${element.type[0]}`)
      background_2.classList.add(`${element.type[1]}`)
      background_3.classList.add(`${element.type[1]}`)
      background_4.classList.add(`${element.type[0]}`)
    }
    innerDiv.classList.add('inner_div')
    innerDiv.appendChild(document.createElement('h3')).textContent = type
    div.appendChild(innerDiv)
    resultArea.appendChild(div)
  })
}

/* Search and filter features  */
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase()
  const types = []
  let filteredData
  typesCheckBox.forEach((element) => {
    if (element.checked) {
      types.push(element.value)
    }
  })
  if (types.length > 0) {
    filteredData = pokemonsSummary
      .filter((pokemon) => types.some((type) => pokemon.type.includes(type)))
      .filter(
        (item) =>
          item.name.includes(query) ||
          item.type.some((type) => type.includes(query))
      )
  } else {
    filteredData = pokemonsSummary.filter(
      (item) =>
        item.name.includes(query) ||
        item.type.some((type) => type.includes(query))
    )
  }
  resultArea.innerHTML = ''
  if (filteredData.length > 0) {
    dataToDiv(filteredData)
  }
})

generationsRadioButton.forEach((element) => {
  element.addEventListener('click', () => {
    let generation = null
    generationsRadioButton.forEach((element) => {
      if (element.checked) {
        generation = element.value
      }
    })
    resultArea.innerHTML = ''
    searchInput.value = ''
    processData(generation)
  })
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

/* Back to top button */
const scrollFunctionButton = () => {
  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    backButton.style.opacity = 0.5
  } else {
    backButton.style.opacity = 0
  }
}

const getToTop = () => {
  document.body.scrollTop = 0
  document.documentElement.scrollTop = 0
}

/* Event Listeners */
backButton.addEventListener('click', getToTop)
menuButton.addEventListener('click', openMobMenu)
hideButton.addEventListener('click', closeMobMenu)
window.onscroll = function () {
  scrollFunctionButton()
}

/* Fetch and render 1st generation on page load */
processData()
