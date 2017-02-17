const $ = require('jquery')

module.exports = {
  selector: '#paneNotifications',
  navText: 'Notifications',
  navIcon: 'icon-bell',

  init (db) {
    this.db = db
    this.$el = $(this.selector)
    this.store = db.store
    this.store.notifications = this.store.notifications || []
    this.bindEvents()
  },

  bindEvents () {
    this.$el.find('input[type="checkbox"]').change(event => {
      if (this.$el.find('input[type="checkbox"]').prop('checked')) {
        this.$el.find('[data-minor="true"]').slideUp()
      } else {
        this.$el.find('[data-minor="true"]').slideDown()
      }
    })
    this.store.notifications = new Proxy(this.store.notifications, {
      set: (target, property, value, receiver) => {
        if (property === 'length') return true
        $(`${this.selector} ul`).append(`
          <li class="list-group-item" data-minor="${value.minor}">
            <img class="img-circle media-object pull-left" src="${value.icon}" width="32" height="32">
            <div class="media-body">
              <strong>${value.title}</strong>
              <pre>${value.message}</pre>
            </div>
          </li>`)
        return true
      }
    })
  }
}
