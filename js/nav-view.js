const $ = require('jquery')

module.exports = {
  init (store, views = []) {
    this.views = views
    this.store = store
    views.forEach((view) => view.init(store))
    views.forEach(this.createMenuItem.bind(this))
  },

  createMenuItem (view, index) {
    if (index !== 0) $(view.selector).hide()
    const $template = $(`
      <span class="nav-group-item ${index === 0 ? 'active' : ''}">
        <span class="icon ${view.navIcon}"></span> ${view.navText}
      </span>`)
    $template.click(handleNavClick.bind(this))
    $('.sidebar .nav-group').append($template)

    function handleNavClick () {
      this.desactivateAll()
      $template.addClass('active')
      $(view.selector).show()
    }
  },

  desactivateAll () {
    $('.sidebar .nav-group .nav-group-item').removeClass('active')
    this.views.forEach((view) => $(view.selector).hide())
  }
}