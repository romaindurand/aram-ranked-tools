const $ = require('jquery')
const {User} = require('aram-ranked')
const NavView = require('./views/nav')
const Db = require('./lib/db')
const db = new Db()

db.store.history = db.store.history || []
if (db.store.users) {
  db.store.users = db.store.users.map(user => {
    return new User(user)
  })
}

const navView = new NavView(db)
$('.window-content').append(navView.$el)

