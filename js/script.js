const homeView = require('./home-view')
const registerView = require('./register-view')
const navView = require('./nav-view')
const notificationsView = require('./notifications-view')
const graphsView = require('./graphs-view')
const {User} = require('aram-ranked')
const Db = require('./db')
const db = new Db()

db.store.history = db.store.history || []
if (db.store.users) {
  db.store.users = db.store.users.map(user => {
    return new User(user)
  })
}

navView.init(db, [homeView, registerView, graphsView, notificationsView])

