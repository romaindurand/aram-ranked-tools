const homeForm = require('./home-form')

module.exports = {
  selector: '#paneHome',
  navText: 'Home',
  navIcon: 'icon-home',

  init (store) {
    homeForm.init(store)
  }
}
