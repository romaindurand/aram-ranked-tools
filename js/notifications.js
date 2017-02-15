const {ipcRenderer} = require('electron')

class Notification {
  constructor (config) {
    if (!config) throw new Error('Notification requires a config object')
    this.message = config.message || ''
    if (!this.message) throw new Error('Config object must have a non-empty message attribute')
    this.title = config.title || ''
    if (!this.title) throw new Error('Config object must have a non-empty title attribute')
    this.icon = config.icon
    this.html = config.html
  }

  send () {
    ipcRenderer.send('notification', this)
  }
}

module.exports = Notification
