const $ = require('jquery')
const UserItem = require('./user-item')
const BaseView = require('./base')

class UserList extends BaseView {
  constructor (db) {
    super(db)
    this.refreshList()
    this.userItemList = []
  }

  render () {
    return $(`
      <ul class="list-group">
        <li class="list-group-header">
          <table class="table-striped">
          <thead><tr><th>Name</th><th>Ranking</th><th>Rating</th><th>Actions</th></tr></thead>
          </table>
        </li>
      </ul>
    `)
  }

  refreshList () {
    this.empty()
    this.store.users.sort
    this.store.users.forEach(user => {
      const userItem = new UserItem(this.db, user)
      this.$el.append(userItem.$el)
      this.userItemList.push(userItem)
    })
  }

  empty () {
    this.$el.find('.list-group-item').remove()
    this.userItemList = []
  }

  addUser (username) {
    const userInStore = this.store.users.find(user => {
      return user.username.toLowerCase().replace(' ', '') === username.toLowerCase().replace(' ', '')
    })
    if (userInStore) {
      const userItem = new UserItem(this.db, userInStore)
      this.userItemList.push(userItem.$el)
      return userInStore
    }
    const emptyUserItem = new UserItem(this.db, username, this.store.server)
    this.$el.append(emptyUserItem.$el)
    this.userItemList.push(emptyUserItem.$el)
    return emptyUserItem.getUser()
  }

  updateTotalUsers () {
    this.userItemList.forEach(userItem => userItem.updateTotalUsers())
  }
}

module.exports = UserList
