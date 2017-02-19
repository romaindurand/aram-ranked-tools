const $ = require('jquery')
const translations = require('../lib/translations')
const utils = require('../lib/utils')
const {AramRanked} = require('aram-ranked')
const BaseView = require('./base')

class RegisterView extends BaseView {
  constructor (db) {
    super(db)
    this.createLanguagesMenu()
    this.bindEvents()
  }

  render () {
    return $(`
      <div class="pane" style="padding:5px">
        <div class="column-third column-1">
          <label>Copy/paste the full chat from endgame room here :</label>
          <form>
            <div class="form-group">
              <textarea class="form-control" rows="8"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-form btn-primary">Extract usernames</button>
            </div>
            <hr />
            <div class="form-actions">
              <select class="form-control"></select>
              <p style="margin:0">join : "<span class="joined-room"></span>"</p>
              <p style="margin:0">leave : "<span class="left-room"></span>"</p>
            </div>
          </form>
        </div>

        <div class="column-third column-2">
          <form>
            <label>Usernames extracted :</label>
            <div class="form-group">
              <textarea class="form-control" rows="10"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-form btn-primary">Register users</button>
            </div>
          </form>
        </div>

        <div class="column-third column-3" style="height:100%; overflow-y:scroll">
          <ul class="list-group">
            <li class="list-group-header"></li>
          </ul>
        </div>
      </div>
    `)
  }

  createLanguagesMenu () {
    translations.forEach((language) => {
      const locale = language.locale_name
      this.$el.find('.column-1 select').append(`<option value="${locale}">${locale}</option>`)
    })
    this.$el.find('.joined-room').text(translations[0].joined_room)
    this.$el.find('.left-room').text(translations[0].left_room)
  }

  bindEvents () {
    this.$el.find('.column-1 form button').click(this.extractUsernames.bind(this))
    this.$el.find('.column-2 button.btn-primary').click(this.registerUsers.bind(this))
  }

  extractUsernames () {
    const text = this.$el.find('.column-1 textarea').val()
    const usernames = text.split('\n')
      .filter(containsUsername)
      .map(selectUsername)
      .filter(utils.unique)

    this.$el.find('.column-2 textarea').val(usernames.join('\n'))

    function selectUsername (line) {
      const joinedRoom = translations[0].joined_room
      const leftRoom = translations[0].left_room
      return line.replace(joinedRoom, '').replace(leftRoom, '')
    }

    function containsUsername (line) {
      const joinedRoom = translations[0].joined_room
      const leftRoom = translations[0].left_room
      return line.includes(joinedRoom) || line.includes(leftRoom)
    }
  }

  registerUsers () {
    this.$el.find('.column-3 li.list-group-item').remove()
    const users = this.$el.find('.column-2 textarea')
      .val()
      .split('\n')
      .filter((line) => line !== '')
      .filter(utils.unique)

    const grayDot = utils.getColoredDot('gray')
    users.forEach((username) => {
      const $userItem = $(`
        <li class="list-group-item">
          <div class="media-body">
            <strong class="username">${username}</strong>
            <p>${grayDot} Loading data ...</p>
          </div>
        </li>`)
      this.$el.find('.column-3 ul').append($userItem)
      const aramRanked = new AramRanked(this.store.server)
      aramRanked.getUserByName(username).then(user => {
        if (user.isNew) {
          const greenDot = utils.getColoredDot('green')
          $userItem.find('p').html(`<p>${greenDot} New user !</p>`)
        } else {
          const orangeDot = utils.getColoredDot('orange')
          $userItem.find('p').html(`<p>${orangeDot} User already registered</p>`)
        }
        $userItem.find('.username').html(user.username)
      }).catch(error => {
        if (error.status === 'user_not_found') {
          const redDot = utils.getColoredDot('red')
          $userItem.find('p').html(`<p>${redDot} User not found :/</p>`)
        } else {
          console.error(error)
        }
      })
    })
  }
}

module.exports = RegisterView
