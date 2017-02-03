const $ = require('jquery')
var Horseman = require('node-horseman')
const siteRoot = 'http://www.aram-ranked.info'

const $inputUsername = $('#inputUsername')
const $buttonUserAdd = $('#buttonUserAdd')


bindClicks()

function bindClicks () {
  $buttonUserAdd.click(() => {
    const username = $inputUsername.val().trim()
    if (username) addUser(username)
    else $inputUsername.focus()
  })
}

function setAddUserFormDisabled (flag) {
  $inputUsername.prop('disabled', flag)
  $buttonUserAdd.prop('disabled', flag)

  return {
    emptyAndFocus: function () {
      $inputUsername.val('').focus()
    }
  }
}

function addUserItem (username) {
  let $userItem = $(`
  <li class="list-group-item" class="user-loading">
        <img class="img-circle media-object pull-left summonerIcon" src="" width="32" height="32">
        <div class="media-body">
          <strong class="username">${username}</strong>
          <span class="rating"></span>
          <button class="btn btn-default pull-right"><span class="icon icon-arrows-ccw"></span></button>
        </div>
  </li>`)
  $('#usersList').append($userItem)
  return $userItem
}

function setHomeStatus (color, message) {
  let colorHex
  switch (color) {
    case 'red': colorHex = '#fc605b'; break
    case 'orange': colorHex = '#fdbc40'; break
    case 'green': colorHex = '#34c84a'; break
    default: colorHex = color; break
  }
  $('#homeStatus').html(`<span class="icon icon-record" style="color:${colorHex}"></span> ${message}`)
}

function updateUserItem (user) {
  let $userItem = $(`#user-${user.id}`)
  let keys = ['username', 'summonerId', 'summonerIcon', 'rating']
  keys.forEach((key) => {
    let $key = $userItem.find(`.${key}`)
    switch (key) {
      case 'summonerIcon':
        $key.attr('src', user.summonerIcon)
        break
      default:
        $key.html(user[key])
        break
    }
  })
}

function addUser (username) {
  var horseman = new Horseman({
    loadImages: false,
    timeout: 15000
  })
  var user = {}
  setAddUserFormDisabled(true)
  setHomeStatus('green', `Loading ${username} data ...`)
  let $userItem = addUserItem(username)

  horseman
  .open('http://www.aram-ranked.info/euw/')
  .value('#summoner_name', username)
  .click('input.btn.navbar-btn.btn-search')
  .waitForNextPage()
  .then(() => {
    setAddUserFormDisabled(false).emptyAndFocus()
    setHomeStatus('green', `Data loaded successfully !`)
  })
  .url()
  .then((url) => {
    var id = url.slice(url.indexOf('=') + 1)
    user.id = id
    $userItem.attr('id', `user-${id}`)
  })
  .html()
  .then((html) => {
    let imgRegex = /src=/gi
    html = html.replace(imgRegex, 'data-src=')
    let $html = $(html)
    var usernameNode = $html.find('dd').get(0)
    var ratingNode = $html.find('dd').get(2)
    user.rankingUrl = siteRoot + $($html.find('.btn.btn-refresh')[0]).attr('href')
    user.refreshUrl = siteRoot + $html.find('.btn.btn-search.btn-ranking').attr('href')
    user.summonerId = user.rankingUrl.slice(user.rankingUrl.indexOf('=') + 1)
    user.summonerIcon = siteRoot + $($html.find('img.icon_image')[0]).data('src')
    user.rating = $(ratingNode).text().trim()
    user.username = $(usernameNode).text().trim()
    updateUserItem(user)
  })
  .catch((ex) => {
    setAddUserFormDisabled(false)
    setHomeStatus('red', `Error loading data, please try again.`)
    console.log(ex.stack)
  })
  .close()
}
