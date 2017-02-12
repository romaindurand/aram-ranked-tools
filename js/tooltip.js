const $ = require('jquery')

class Tooltip {
  constructor (conf = {}) {
    this.x = conf.x || 0
    this.y = conf.y || 0
    this.text = conf.text || ''
    this.classSuffix = conf.classSuffix ? `-${conf.classSuffix}` : ''
    this.followMouse = conf.followMouse || false

    return Object.assign(this, this.getTooltip())
  }

  show (conf = {}) {
    const $tooltip = this.getTooltip()
    Object.assign(this, conf)
    $tooltip.css({
      top: this.y,
      left: this.x
    })
    $tooltip.text(this.text)
    $tooltip.addClass(this.getClass(true))
  }

  hide () {
    const $tooltip = this.getTooltip()
    $tooltip.removeClass(this.getClass(true))
  }

  isVisible () {
    const $tooltip = this.getTooltip()
    $tooltip.addClass(this.getClass(true))
  }

  getClass (on) {
    return `tooltip${this.classSuffix}${on ? '-on' : ''}`
  }

  getTooltip () {
    let $tooltip = $(`.${this.getClass()}`)
    if (!$tooltip.length) {
      $tooltip = $(`<span class="${this.getClass()}">${this.text}</span>`)
      $('body').append($tooltip)
    }
    return $tooltip
  }
}

module.exports = Tooltip
