const {ipcRenderer} = require('electron')
const $ = require('jquery')
const moment = require('moment')
const AramRanked = require('aram-ranked')
const Tooltip = require('./tooltip')

module.exports = {
  init (store) {
    this.store = store
    this.tooltip = new Tooltip()
  },

  empty () {
    $('#usersList').find('.list-group-item').remove()
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
          <span class="refreshed pull-right"></span>
        </div>
  </li>`)
    $('#usersList').append($userItem)
    return $userItem
  },

  addUser (username) {
    const $userItem = this.addUserItem(username)
    const aramRanked = new AramRanked(this.store.server)
    return aramRanked.getUserByName(username)
      .then(user => {
        this.updateUserRanking(user)
        this.updateUserItem(user)
        return user
      })
      .catch(ex => {
        $userItem.remove()
      })
  },

  updateTotalUsers () {
    $('#usersList li .totalUsers').text(this.store.totalUsers)
  },

  updateUserItem (user, selectedKey) {
    let $userItem
    if ($('li.user-loading').length) {
      $userItem = $('li.user-loading').removeClass('user-loading')
      $userItem.attr('data-id', `${user.id}`)
    } else if (!user.id) return

    $userItem = $(`#usersList [data-id="${user.id}"]`)
    let keys = ['username', 'summonerId', 'summonerIcon', 'rating', 'lastGame', 'ranking', 'refreshUrl', 'refreshed']
    if (selectedKey) keys = [selectedKey]
    keys.forEach((key) => {
      const $key = $userItem.find(`.${key}`)
      switch (key) {
        case 'refreshed':
          $key.text(user.refreshed ? 'Data refreshed !' : '')
          break
        case 'summonerIcon': $key.attr('src', user.summonerIcon); break
        case 'lastGame':
          if (!user.lastGame) {
            $key.html('No game yet :(')
            break
          }
          const lastGame = moment(user.lastGame, 'MM/DD HH:mm')
          const diff = lastGame.diff(moment())
          if (diff > 0) lastGame.subtract({year: 1})
          const lastGameLabel = lastGame.fromNow()
          $userItem.on('mouseenter mouseleave', '.lastGame', (event) => {
            switch (event.type) {
              case 'mouseenter':
                this.tooltip.show({
                  x: event.clientX,
                  y: event.clientY,
                  text: user.lastGame
                })
                break

              case 'mouseleave':
                this.tooltip.hide()
                break
            }
            // if (this.)
            // this.tooltip.x =
          })
          $key.html(`${lastGameLabel}`)
          break
        case 'refreshUrl':
          $userItem.find('button').click(this.refreshUser.bind(this, $userItem))
          break
        default: $key.html(user[key]); break
      }
    })

    return user
  },

  refreshUser ($userItem) {
    const user = this.getUser($userItem)
    user.refreshData().then(user => {
      if (!user.refreshed) return user
      return this.updateUserRanking(user)
        .then(user => {
          this.updateUserItem(user)
          ipcRenderer.send('notification', `${user.username} has been updated !`)
          $userItem.addClass('green-flash')
          setTimeout(() => {
            $userItem.removeClass('green-flash')
          }, 4000)
        })
    })
  },

  setRefreshButtonDisabled ($userItem, flag) {
    $userItem.find('button').prop('disabled', flag)
  },

  updateUserRanking (user) {
    return user.getRanking().then(ranking => {
      user.ranking = ranking
      this.updateUserItem(user, 'ranking')
      return user
    })
  },

  getUser ($userItem) {
    const id = parseInt($userItem.data('id'), 10)
    return this.store.users.find(user => user.id === id)
  }
}
