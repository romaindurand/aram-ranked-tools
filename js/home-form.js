const $ = require('jquery')
const utils = require('./utils')
const usersList = require('./users-list')

module.exports = {
  init (store) {
    this.users = store.users
    this.bindEvents()
  },

  bindEvents () {
    $('#formAddUser').submit((event) => {
      event.preventDefault()
      usersList.addUser($('#inputUsername').val(), this.handleUserCreation.bind(this))
    })
  },

  handleUserCreation (err, user) {
    if (!err) {
      console.log(user)
      this.users.push(user)
      return
    }
    if (err.status) this.setHomeStatus('orange', 'Empty username.')
    else console.error(err)
    $('#inputUsername').focus()
    return
  },

  setAddUserFormDisabled (flag) {
    $('#inputUsername').prop('disabled', flag)
    $('#buttonUserAdd').prop('disabled', flag)

    return {
      emptyAndFocus () {
        $('#inputUsername').val('').focus()
      }
    }
  },

  setHomeStatus (color, message) {
    const dot = utils.getColoredDot(color)
    $('#homeStatus').html(`${dot} ${message}`)
  }
}
