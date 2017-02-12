const $ = require('jquery')
const translations = require('./translations')
const utils = require('./utils')
const AramRanked = require('aram-ranked')

module.exports = {
  selector: '#paneRegister',
  navText: 'Auto register',
  navIcon: 'icon-plus-circled',

  init (store) {
    this.store = store
    this.createLanguagesMenu()
    this.bindEvents()
  },

  createLanguagesMenu () {
    translations.forEach((language) => {
      const locale = language.locale_name
      $('#paneRegister1 select').append(`<option value="${locale}">${locale}</option>`)
    })
    $('#joinedRoom').text(translations[0].joined_room)
    $('#leftRoom').text(translations[0].left_room)
  },

  bindEvents () {
    $('#paneRegister1 form button').click(this.extractUsernames)
    $('#paneRegister2 button.btn-primary').click(this.registerUsers.bind(this))
  },

  extractUsernames () {
    const text = $('#paneRegister1 textarea').val()
    const usernames = text.split('\n')
      .filter(containsUsername)
      .map(selectUsername)
      .filter(utils.unique)

    $('#paneRegister2 textarea').val(usernames.join('\n'))

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
  },

  registerUsers () {
    $('#paneRegister3 li.list-group-item').remove()
    const users = $('#paneRegister2 textarea')
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
      $('#paneRegister3 ul').append($userItem)
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
