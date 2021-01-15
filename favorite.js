const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const modeSwitch = document.querySelector('#mode-switch')

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))
let currentMode = 'card'

//新增事件區
//資料區點擊事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

//模式切換點擊事件
modeSwitch.addEventListener('click', function onModeSwitchClicked(event) {
  event.stopPropagation()

  if (event.target.id.includes('card')) {
    renderMovieToCard(movies)
    currentMode = 'card'
  } else if (event.target.id.includes('list')) {
    renderMovieToList(movies)
    currentMode = 'list'
  }
})

//新增函式區
//移除最愛
function removeFromFavorite(id) {
  //若清單是空的，結束此函式
  if (!movies) return

  const movieIndex = movies.findIndex((movie) => movie.id === id)
  //若傳入的id在收藏清單不存在，結束此函式
  if (movieIndex === -1) return

  movies.splice(movieIndex, 1)

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  if (currentMode === 'card') {
    renderMovieToCard(movies)
  } else if (currentMode === 'list') {
    renderMovieToList(movies)
  }
}

//顯示詳細資訊
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
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
    dataPanel.innerHTML = rawHTML
  })
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
        <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
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

renderMovieToCard(movies)