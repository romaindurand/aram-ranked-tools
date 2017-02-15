const $ = require('jquery')
const moment = require('moment')
const {User} = require('aram-ranked')
const Tooltip = require('./tooltip')
const Notification = require('./notifications')

class UserItem {
  constructor (db, user, server) {
    this.db = db
    this.store = db.store
    this.tooltip = new Tooltip()
    if (!user) throw new Error('a 2nd argument must be provided')
    if (user instanceof User) {
      this.user = user
      this.createUserNode()
      this.refreshUser()
    } else {
      if (typeof user !== 'string') throw new Error('2nd argument must be a User or a String (username)')
      if (typeof server !== 'string') throw new Error('3rd argument must be a String (server)')
      this.user = {
        username: user,
        server: server
      }
      this.createEmptyNode()
      return this
    }
  }

  getUser () {
    return new User(this.user.server, this.user.username).then(user => {
      this.user = user
      this.updateNode()
      this.refreshUser()
      return user
    })
  }

  createEmptyNode () {
    const $userNode = $(`
      <li class="list-group-item">
        <img class="img-circle media-object pull-left summonerIcon" src="images/spinner-32px.gif" width="32" height="32">
        <div class="media-body">
          <strong class="username">${this.user.username}</strong>
          <p>Last game : <span class="lastGame"></span></p>
          <span class="rating"></span>
          <p class="ranking-col"><span class="ranking"></span> / <span class="totalUsers">${this.store.totalUsers || '....'}</span></p>
          <button class="btn btn-default pull-right"><span class="icon icon-arrows-ccw"></span></button>
          <span class="refreshed pull-right"></span>
        </div>
      </li>`)
    this.$userNode = $userNode
  }

  createUserNode () {
    this.createEmptyNode(this.user.username)
    this.updateNode()
    this.refreshUser()
  }

  updateTotalUsers () {
    this.$userNode.find('.totalUsers').text(this.store.totalUsers)
  }

  updateNodeByKey (key) {
    const $key = this.$userNode.find(`.${key}`)
    switch (key) {
      case 'summonerIcon': $key.attr('src', this.user.summonerIcon); break
      case 'lastGame':
        if (!this.user.lastGame) {
          $key.html('No game yet :(')
          break
        }
        const lastGame = moment(this.user.lastGame, 'MM/DD HH:mm')
        const diff = lastGame.diff(moment())
        if (diff > 0) lastGame.subtract({year: 1})
        const lastGameLabel = lastGame.fromNow()
        this.$userNode.on('mouseenter mouseleave', '.lastGame', (event) => {
          switch (event.type) {
            case 'mouseenter':
              this.tooltip.show({
                x: event.clientX,
                y: event.clientY,
                text: this.user.lastGame
              })
              break

            case 'mouseleave':
              this.tooltip.hide()
              break
          }
        })
        $key.html(`${lastGameLabel}`)
        break
      case 'refreshUrl':
        this.$userNode.find('button').click(this.refreshUser.bind(this, this.$userNode))
        break
      default: $key.html(this.user[key]); break
    }
  }

  updateNode (user, selectedKey) {
    if (!user) user = this.user
    this.$userNode.removeClass('loading')
    let keys = ['username', 'summonerId', 'summonerIcon', 'rating', 'ranking', 'refreshUrl']
    if (selectedKey) keys = [selectedKey]
    keys.push('lastGame')
    keys.forEach(this.updateNodeByKey.bind(this))

    return user
  }

  getUpdateMessage () {
    const message = []
    this.user.refreshed.forEach(diff => {
      message.push({
        lastGame: `Game from ${this.user.lastGame} has been recorded`,
        ranking: `User ${diff.value > 0 ? 'gained' : 'lost'} ${Math.abs(diff.value)} places in the ranking`,
        rating: `User ${diff.value > 0 ? 'gained' : 'lost'} ${Math.abs(diff.value)} rating points`
      }[diff.key])
    })
    return message.join('\n')
  }

  refreshUser () {
    this.$userNode.addClass('loading')
    this.user.refreshData().then(user => {
      this.user = user
      // todo : add a label "refreshed xx seconds ago"
      if (!user.refreshed) {
        this.$userNode.removeClass('loading')
        return
      }
      this.updateNode()
      this.greenFlash()
      const notification = new Notification({
        title: `${user.username} has been updated !`,
        message: this.getUpdateMessage()
      })
      console.log(notification)
      notification.send()
    })
  }

  greenFlash () {
    this.$userNode.addClass('green-flash')
    setTimeout(() => {
      this.$userNode.removeClass('green-flash')
    }, 4000)
  }

  setRefreshButtonDisabled ($userNode, flag) {
    $userNode.find('button').prop('disabled', flag)
  }
}

module.exports = UserItem
