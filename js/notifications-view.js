module.exports = {
  selector: '#paneNotifications',
  navText: 'Notifications',
  navIcon: 'icon-bell',

  init (db) {
    this.db = db
    this.store = db.store
    this.bindEvents()
  },

  bindEvents () {
  }
}
