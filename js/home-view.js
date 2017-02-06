const $ = require('jquery')
const utils = require('./utils')
const usersList = require('./users-list')
const $inputUsername = $('#inputUsername')
const aramRanked = require('./aram-ranked')

module.exports = {
  selector: '#paneHome',
  navText: 'Home',
  navIcon: 'icon-home',
  servers: ['euw'],

  init (store) {
    this.store = store
    usersList.init(store)
    this.bindEvents()
    this.createServersSelect()
    this.refreshTotalUsers()
  },

  bindEvents () {
    $('#formAddUser').submit(this.handleAddUser.bind(this))
  },

  handleAddUser (event) {
    event.preventDefault()
    this.setAddUserFormDisabled(true)
    this.setHomeStatus('green', `Loading ${$inputUsername.val()} data ...`)
    usersList.addUser($inputUsername.val())
      .then((user) => {
        console.log(user)
        this.setAddUserFormDisabled(false).emptyAndFocus()
        const message = user.isNew ? 'New user registered !!' : `Data loaded successfully !`
        this.setHomeStatus('green', message)
        this.store.users.push(user)
      })
      .catch((ex) => {
        if (ex.status) this.setHomeStatus('orange', ex.message)
        else {
          this.setHomeStatus('red', `Error loading data, please try again.`)
          console.error(ex)
        }
        this.setAddUserFormDisabled(false)
        $inputUsername.focus()
      })
  },

  createServersSelect () {
    this.servers.forEach((server) => {
      $('#paneHome .toolbar-actions select').append(`<option value="${server}">${server.toUpperCase()}</option>`)
    })
  },

  setAddUserFormDisabled (flag) {
    $inputUsername.prop('disabled', flag)
    $('#buttonUserAdd').prop('disabled', flag)

    return {
      emptyAndFocus () {
        $inputUsername.val('').focus()
      }
    }
  },

  setHomeStatus (color, message) {
    const dot = utils.getColoredDot(color)
    $('#homeStatus').html(`${dot} ${message}`)
  },

  refreshTotalUsers () {
    aramRanked.getTotalUsers().then((totalUsers) => {
      this.store.totalUsers = totalUsers
      usersList.updateTotalUsers()
    })
  }
}
