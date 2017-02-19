const $ = require('jquery')
const HomeView = require('./home')
const RegisterView = require('./register')
const NotificationsView = require('./notifications')
const GraphsView = require('./graphs')
const BaseView = require('./base')

class NavView extends BaseView {
  constructor (db) {
    super(db)
    setTimeout(this.initMenuItems.bind(this), 0)
  }

  render () {
    return $(`
      <div class="pane-group">
        <div class="pane pane-sm sidebar">
          <nav class="nav-group">
          <h5 class="nav-group-title">Tools</h5>
          </nav>
        </div>
      </div>
    `)
  }

  initMenuItems () {
    const graphsView = new GraphsView(this.db)
    const homeView = new HomeView(this.db)
    const registerView = new RegisterView(this.db)
    const notificationsView = new NotificationsView(this.db)
    this.menuItems = [{
      selector: '#paneHome',
      navText: 'Home',
      navIcon: 'icon-home',
      view: homeView
    }, {
      selector: '#paneRegister',
      navText: 'Auto register',
      navIcon: 'icon-plus-circled',
      view: registerView
    }, {
      selector: '#paneGraphs',
      navText: 'Graphs',
      navIcon: 'icon-chart-line',
      view: graphsView
    }, {
      selector: '#paneNotifications',
      navText: 'Notifications',
      navIcon: 'icon-bell',
      view: notificationsView
    }]
    this.createMenuItemsAndViews()
  }

  createMenuItemsAndViews () {
    this.menuItems.forEach((menuItem, index) => {
      if (index !== 0) menuItem.view.hide()
      this.$el.append(menuItem.view.$el)
      const $template = $(`
      <span class="nav-group-item ${index === 0 ? 'active' : ''}">
        <span class="icon ${menuItem.navIcon}"></span> ${menuItem.navText}
      </span>`)
      $template.click(handleNavClick.bind(this))
      this.$el.find('.sidebar .nav-group').append($template)

      function handleNavClick () {
        this.desactivateAll()
        $template.addClass('active')
        menuItem.view.show()
      }
    })
  }

  desactivateAll () {
    this.$el.find('.sidebar .nav-group .nav-group-item').removeClass('active')
    this.menuItems.forEach(menuItem => menuItem.view.hide())
  }
}

module.exports = NavView
