const d3 = require('d3')
const $ = require('jquery')
const BaseView = require('./base')

class GraphsView extends BaseView {
  constructor (db) {
    super(db)
    this.$legend = this.$el.find('.legend')
    this.bindEvents()
  }

  render () {
    return $(`
      <div class="pane">
        <svg width="800" height="400"></svg>
        <button class="btn btn-default pull-right save-list">
        <span class="icon icon-arrows-ccw"></span> Refresh
        </button>
        <div class="legend"></div>
      </div>
    `)
  }

  bindEvents () {
    this.$el.find('button').click(() => {
      this.drawGraph()
    })
    // this.store.history = new Proxy(this.store.history, {
    //   set: (target, prop) => {
    //     if (!Number.isInteger(parseInt(prop))) return true
    //     this.drawGraph()
    //     return true
    //   }
    // })
  }

  getUsers () {
    return this.store.users.map(user => {
      return {
        color: this.getRandomColor(),
        username: user.username,
        server: user.server
      }
    })
  }

  getRandomColor () {
    const red = this.getRandomValue()
    const green = this.getRandomValue()
    const blue = this.getRandomValue()
    const color = `#${red}${green}${blue}`
    return color
  }

  getRandomValue () {
    const value = Math.round(Math.random() * 255).toString(16)
    if (value.length === 1) return `0${value}`
    return value
  }

  drawGraph () {
    const svg = d3.select('svg')
    svg.html('')
    this.$legend.html('')
    const margin = {top: 20, right: 20, bottom: 30, left: 50}
    const width = +svg.attr('width') - margin.left - margin.right
    const height = +svg.attr('height') - margin.top - margin.bottom
    const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    var x = d3.scaleTime().rangeRound([0, width])
    var y = d3.scaleLinear().rangeRound([0, height])

    const data = this.store.history.map(event => {
      event.date = d3.isoParse(event.date)
      return event
    })
    x.domain(d3.extent(data, d => d.date))
    const verticalRange = d3.extent(data, d => +d.ranking)
    verticalRange[0] -= 100
    verticalRange[1] += 100
    y.domain(verticalRange)

    this.getUsers().forEach(user => {
      this.drawUserGraph({user, width, height, g, x, y})
      this.addUserLabel(user)
    })

    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('fill', '#000')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Ranking')

    g.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .select('.domain')
      .remove()
  }

  addUserLabel (user) {
    this.$legend.append(`<div style="color: ${user.color};">${user.username} (${user.server.toUpperCase()})</div>`)
  }

  drawUserGraph ({user, width, height, g, x, y}) {
    const data = this.store.history.filter(event => {
      return event.username === user.username && event.server === user.server
    }).map(event => {
      event.date = d3.isoParse(event.date)
      return event
    })

    var line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.ranking))

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', user.color)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('d', line)
  }
}

module.exports = GraphsView
