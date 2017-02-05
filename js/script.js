const homeView = require('./js/home-view')
const registerView = require('./js/register-view')
const navView = require('./js/nav-view')
const store = {
  users: []
}

navView.init(store, [homeView, registerView])

