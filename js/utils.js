module.exports = {
  getDotColor (color) {
    return {
      'red': '#fc605b',
      'orange': '#fdbc40',
      'green': '#34c84a'
    }[color] || color
  },

  getColoredDot (color) {
    const colorHex = this.getDotColor(color)
    return `<span class="icon icon-record" style="color:${colorHex}"></span>`
  },

  unique (value, index, self) {
    return self.indexOf(value) === index
  }
}
