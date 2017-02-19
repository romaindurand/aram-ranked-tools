const $ = require('jquery')
const utils = require('../lib/utils')
const UsersList = require('./users-list')
const BaseView = require('./base')
const {AramRanked} = require('aram-ranked')

class HomeView extends BaseView {
  constructor (db) {
    super(db)
    this.$select = this.$el.find('select')
    this.$inputUsername = this.$el.find('input')
    this.store.server = this.store.server || 'euw'
    this.store.users = this.store.users || []
    this.usersList = new UsersList(this.db)
    this.$el.append(this.usersList.$el)
    this.bindEvents()
    this.createServersSelect()
    this.refreshTotalUsers()
  }

  render () {
    return $(`
      <div class="pane">
        <div class="toolbar-actions" style="-webkit-app-region: no-drag;">
          <form style="display: inline-block">
            <div class="btn-group">
              <input type="text" class="form-control" placeholder="Username" value="kupluss warwick">
            </div>
            <button type="submit" class="btn btn-default">
              <span class="icon icon-user-add"></span>
            </button>
          </form>
          <span class="home-status"></span>
          <button class="btn btn-default pull-right save-list">
          <span class="icon icon-floppy"></span> Save list
          </button>
          <select class="form-control pull-right" style="width:100px;"></select>
        </div>
      </div>
    `)
  }

  bindEvents () {
    this.$el.find('form').submit(this.handleAddUser.bind(this))
    this.$select.change(this.changeServer.bind(this))
    this.$el.find('.save-list').click(this.saveUserList.bind(this))
  }

  saveUserList () {
    this.store.users = this.store.users.map(user => {
      delete user.refreshed
      return user
    })
    this.db.save('users')
  }

  changeServer (event) {
    this.store.server = this.$select.val()
    this.refreshTotalUsers()
    this.usersList.empty()
  }

  handleAddUser (event) {
    event.preventDefault()
    this.setAddUserFormDisabled(true)
    this.setHomeStatus('green', `Loading ${this.$inputUsername.val()} data ...`)
    this.usersList.addUser(this.$inputUsername.val())
      .then(user => {
        console.log(user)
        this.setAddUserFormDisabled(false).emptyAndFocus()
        const message = user.isNew ? 'New user registered !!' : `Data loaded successfully !`
        this.setHomeStatus('green', message)
        this.store.users.push(user)
      })
      .catch(ex => {
        if (ex.status) this.setHomeStatus('orange', ex.message)
        else {
          this.setHomeStatus('red', `Error loading data, please try again.`)
          console.error(ex)
        }
        this.setAddUserFormDisabled(false)
        this.$inputUsername.focus()
      })
  }

  createServersSelect () {
    const servers = AramRanked.getServers()
    Object.keys(servers).forEach((server) => {
      this.$select.append(`<option value="${server}">${servers[server]}</option>`)
    })
  }

  setAddUserFormDisabled (flag) {
    this.$inputUsername.prop('disabled', flag)
    this.$el.find('form button').prop('disabled', flag)

    return {
      emptyAndFocus () {
        this.$inputUsername.val('').focus()
      }
    }
  }

  setHomeStatus (color, message) {
    const dot = utils.getColoredDot(color)
    this.$el.find('.home-status').html(`${dot} ${message}`)
  }

  refreshTotalUsers () {
    new AramRanked(this.store.server).getTotalUsers().then(totalUsers => {
      this.store.totalUsers = totalUsers
      this.usersList.updateTotalUsers()
    })
  }
}

module.exports = HomeView
