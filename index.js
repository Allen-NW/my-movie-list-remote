const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const modeSwitch = document.querySelector('#mode-switch')

const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []
let page = 1
let searchPage = 1
let currentMode = 'card'

//新增事件區
//電影搜尋
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()

  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字: ${keyword} 沒有符合的結果`)
  }

  if (currentMode === 'card') {
    renderMovieToCard(getMoviesByPage(searchPage))
  } else if (currentMode === 'list') {
    renderMovieToList(getMoviesByPage(searchPage))
  }

  renderPaginator(filteredMovies.length)

  if (keyword === '') {
    filteredMovies = []
    renderMovieToCard(getMoviesByPage(page))
    renderPaginator(movies.length)
  }
})

//data-panel點擊事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//分頁點擊事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
  event.stopPropagation()

  if (event.target.tagName !== 'A') return

  const pageNumber = Number(event.target.dataset.page)

  if (filteredMovies.length !== 0) {
    searchPage = pageNumber
    if (currentMode === 'card') {
      renderMovieToCard(getMoviesByPage(searchPage))
    } else if (currentMode === 'list') {
      renderMovieToList(getMoviesByPage(searchPage))
    }
  } else {
    page = pageNumber
    if (currentMode === 'card') {
      renderMovieToCard(getMoviesByPage(page))
    } else if (currentMode === 'list') {
      renderMovieToList(getMoviesByPage(page))
    }
  }
})

//模式切換點擊事件
modeSwitch.addEventListener('click', function onModeSwitchClicked(event) {
  event.stopPropagation()

  if (filteredMovies !== 0) {
    if (event.target.id.includes('card')) {
      renderMovieToCard(getMoviesByPage(searchPage))
      currentMode = 'card'
    } else if (event.target.id.includes('list')) {
      renderMovieToList(getMoviesByPage(searchPage))
      currentMode = 'list'
    }
  } else {
    if (event.target.id.includes('card')) {
      renderMovieToCard(getMoviesByPage(page))
      currentMode = 'card'
    } else if (event.target.id.includes('list')) {
      renderMovieToList(getMoviesByPage(page))
      currentMode = 'list'
    }
  }
})

//新增函式區
//電影詳細資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

//顯示電影卡片
function renderMovieToCard(data) {
  let rawHTML = ''

  data.forEach((item) => {
    //title, imgSrc
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">
                More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
    dataPanel.innerHTML = rawHTML
  })
}

//印出所有分頁選擇
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let p = 1; p <= numberOfPage; p++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${p}">${p}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

//設計好每個分頁有多少部電影
function getMoviesByPage(pageNumber) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (pageNumber - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//電影收藏
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //find只會找第一個滿足此函式的元素值
  const movie = movies.find((movie) => movie.id === id)
  //some會測試是不是至少有一個滿足函式，會回傳布林值
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//顯示電影列表
function renderMovieToList(data) {
  let rawHTML = ''
  let listHTML = ''

  // bootstrap -> list group
  data.forEach((item) => {
    rawHTML += `
    <li class="list-group-item d-flex justify-content-between align-item-center">
      <span class="movie-list-title">${item.title}</span>
      
      <span>
        <button class="btn btn-primary btn-show-movie mr-3" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">
        More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </span>
    </li>
    `
  })

  listHTML = `
  <div class="col-12 movie-list">
    <ul class="list-group list-group-flush">
      ${rawHTML}
    </ul>
  </div>
  `

  dataPanel.innerHTML = listHTML
}

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieToCard(getMoviesByPage(page))
})
  .catch((err) => console.log(err))