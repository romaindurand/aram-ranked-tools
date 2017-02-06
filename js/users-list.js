const $ = require('jquery')
const aramRanked = require('./aram-ranked')

module.exports = {
  init (store) {
    this.store = store
  },

  addUserItem (username = '') {
    const $userItem = $(`
  <li class="list-group-item user-loading">
        <img class="img-circle media-object pull-left summonerIcon" src="images/spinner-32px.gif" width="32" height="32">
        <div class="media-body">
          <strong class="username">${username}</strong>
          <p>Last game : <span class="lastGame"></span></p>
          <span class="rating"></span>
          <p class="ranking-col"><span class="ranking"></span> / <span class="totalUsers">${this.store.totalUsers || '....'}</span></p>
          <button class="btn btn-default pull-right"><span class="icon icon-arrows-ccw"></span></button>
        </div>
  </li>`)
    $('#usersList').append($userItem)
    return $userItem
  },

  addUser (username) {
    return new Promise((resolve, reject) => {
      const $userItem = this.addUserItem(username)
      aramRanked.getUserByName(username)
        .then((user) => {
          aramRanked.getRankingFromUrl(user.rankingUrl).then((ranking) => {
            user.ranking = ranking
            this.updateUserItem(user, 'ranking')
          })
          this.updateUserItem(user)
          resolve(user, $userItem)
        })
        .catch((ex) => {
          $userItem.remove()
          reject(ex)
        })
    })
  },

  updateTotalUsers () {
    $('#usersList li .totalUsers').text(`/ ${this.store.totalUsers}`)
  },

  updateUserItem (user, selectedKey) {
    let $userItem
    if ($('li.user-loading').length) {
      $userItem = $('li.user-loading').removeClass('user-loading')
      $userItem.attr('id', `user-${user.id}`)
    } else if (!user.id) return

    $userItem = $(`#user-${user.id}`)
    let keys = ['username', 'summonerId', 'summonerIcon', 'rating', 'lastGame', 'ranking']
    if (selectedKey) keys = [selectedKey]
    keys.forEach((key) => {
      const $key = $userItem.find(`.${key}`)
      switch (key) {
        case 'summonerIcon': $key.attr('src', user.summonerIcon); break
        case 'lastGame': $key.html(user.lastGame || 'No game yet :('); break
        default: $key.html(user[key]); break
      }
    })
  }
}
