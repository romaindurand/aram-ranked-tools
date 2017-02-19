const $ = require('jquery')

class BaseView {
  constructor (db) {
    this.db = db
    this.store = db.store
    this.$el = this.render()
  }

  render () {
    return $(`<div style="color:red">'render' function not implemented in your view</div>`)
  }

  show () {
    this.$el.show()
  }

  hide () {
    this.$el.hide()
  }

}

module.exports = BaseView
