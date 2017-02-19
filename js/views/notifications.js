const $ = require('jquery')
const BaseView = require('./base')

class NotificationsView extends BaseView {
  constructor (db) {
    super(db)
    this.store.notifications = this.store.notifications || []
    this.bindEvents()
  }

  render () {
    return $(`
      <div class="pane">
        <ul class="list-group">
        <div class="toolbar-actions">
          <div class="checkbox">
            <label>
              <input type="checkbox"> Hide minor notifications
            </label>
          </div>
        </div>
        </ul>
      </div>
    `)
  }

  empty () {
    this.$el.find('li.list-group-item').remove()
  }

  bindEvents () {
    this.$el.find('input[type="checkbox"]').change(event => {
      if (this.$el.find('input[type="checkbox"]').prop('checked')) {
        this.$el.find('[data-minor="true"]').hide()
      } else {
        this.$el.find('[data-minor="true"]').show()
      }
    })
    this.store.notifications = new Proxy(this.store.notifications, {
      set: (target, property, value, receiver) => {
        if (property === 'length') return true
        this.$el.find('ul').append(`
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

module.exports = NotificationsView
