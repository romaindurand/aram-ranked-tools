const $ = require('jquery')
const Horseman = require('node-horseman')
const siteRoot = 'http://www.aram-ranked.info'

module.exports = {
  addUserItem (username = '') {
    const $userItem = $(`
  <li class="list-group-item" class="user-loading">
        <img class="img-circle media-object pull-left summonerIcon" src="images/spinner-32px.gif" width="32" height="32">
        <div class="media-body">
          <strong class="username">${username}</strong>
          <p>Last game : <span class="lastGame"></span></p>
          <span class="rating"></span>
          <button class="btn btn-default pull-right"><span class="icon icon-arrows-ccw"></span></button>
        </div>
  </li>`)
    $('#usersList').append($userItem)
    return $userItem
  },

  addUser (username, callback) {
    const homeForm = require('./home-form')
    username = username.trim()
    if (!username) {
      callback({status: 'username empty'})
      return
    }
    const horseman = new Horseman({
      loadImages: false,
      timeout: 15000
    })
    const user = {}
    homeForm.setAddUserFormDisabled(true)
    homeForm.setHomeStatus('green', `Loading ${username} data ...`)
    const $userItem = this.addUserItem(username)

    horseman
      .open('http://www.aram-ranked.info/euw/')
      .value('#summoner_name', username)
      .click('input.btn.navbar-btn.btn-search')
      .waitForNextPage()
      .url()
      .then((url) => {
        const id = url.slice(url.indexOf('=') + 1)
        user.id = id
        $userItem.attr('id', `user-${id}`)
      })
      .html()
      .then((html) => {
        // prevent assets from being loaded by jQuery parsing
        const srcRegex = /src=/gi
        html = html.replace(srcRegex, 'data-src=')
        const $html = $(html)
        const usernameNode = $html.find('dd').get(0)
        const ratingNode = $html.find('dd').get(2)
        user.lastGame = $html.find('#recent tr:first-child td:first-child').text()
        user.rankingUrl = siteRoot + $($html.find('.btn.btn-refresh')[0]).attr('href')
        user.refreshUrl = siteRoot + $html.find('.btn.btn-search.btn-ranking').attr('href')
        user.summonerId = user.rankingUrl.slice(user.rankingUrl.indexOf('=') + 1)
        user.summonerIcon = siteRoot + $($html.find('img.icon_image')[0]).data('src')
        user.rating = $(ratingNode).text().trim()
        user.username = $(usernameNode).text().trim()
        this.updateUserItem(user)
        callback(null, user)
      })
      .then(() => {
        homeForm.setAddUserFormDisabled(false).emptyAndFocus()
        homeForm.setHomeStatus('green', `Data loaded successfully !`)
      })
      .catch((ex) => {
        homeForm.setAddUserFormDisabled(false)
        $userItem.remove()
        homeForm.setHomeStatus('red', `Error loading data, please try again.`)
        callback(ex.stack, null)
      })
      .close()
  },

  updateUserItem (user) {
    const $userItem = $(`#user-${user.id}`)
    const keys = ['username', 'summonerId', 'summonerIcon', 'rating', 'lastGame']
    keys.forEach((key) => {
      const $key = $userItem.find(`.${key}`)
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
}
