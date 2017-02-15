const $ = require('jquery')
const UserItem = require('./user-item')

module.exports = {
  init (db) {
    this.db = db
    this.store = db.store
    this.refreshList()
    this.userItemList = []
  },

  refreshList () {
    this.empty()
    this.store.users.sort
    this.store.users.forEach(user => {
      const userItem = new UserItem(this.db, user)
      $('#usersList').append(userItem.$userNode)
      this.userItemList.push(userItem)
    })
  },

  empty () {
    $('#usersList').find('.list-group-item').remove()
    this.userItemList = []
  },

  addUser (username) {
    const userInStore = this.store.users.find(user => {
      return user.username.toLowerCase().replace(' ', '') === username.toLowerCase().replace(' ', '')
    })
    if (userInStore) {
      const userItem = new UserItem(this.db, userInStore)
      this.userItemList.push(userItem.$userNode)
      return userInStore
    }
    const emptyUserItem = new UserItem(this.db, username, this.store.server)
    $('#usersList').append(emptyUserItem.$userNode)
    this.userItemList.push(emptyUserItem.$userNode)
    return emptyUserItem.getUser()
  },

  updateTotalUsers () {
    this.userItemList.forEach(userItem => userItem.updateTotalUsers())
  }
}
