const domino = require('domino')
const Zepto = require('zepto-node')
const request = require('request-promise')

const siteRoot = 'http://www.aram-ranked.info'
const welcomeMessage = 'Welcome To ARAM Ranked'
const authCookieName = '_ARAMTracker_session'

class EmptyUsernameError extends Error {
  constructor () {
    super()
    this.message = 'Empty user name ...'
    this.status = 'empty_username'
  }
}
class UserNotFoundError extends Error {
  constructor () {
    super()
    this.message = 'User was not found on this server.'
    this.status = 'user_not_found'
  }
}
class AuthTokenNotFoundError extends Error {
  constructor () {
    super()
    this.message = 'Auth token was not found on this page.'
    this.status = 'auth_token_not_found'
  }
}
class TotalUsersNotFoundError extends Error {
  constructor () {
    super()
    this.message = 'Total users count not found on this page.'
    this.status = 'total_users_not_found'
  }
}

class AramRanked {
  constructor (server) {
    if (!server) throw new Error('You need to specify a server (see docs)')
    server = server.toLowerCase()
    if (!AramRanked.getServers()[server]) throw new Error('You need to specify a valid server (see docs)')
    this.server = server
    this.rankingUrl = `http://www.aram-ranked.info/{server}/statistics/ranking`
  }

  static getServers () {
    return {
      euw: 'EU West',
      na: 'North America',
      kr: 'Korea',
      eune: 'EU North&amp;East',
      ja: 'Japan',
      ru: 'Russia',
      tr: 'Turky',
      br: 'Brazil',
      oce: 'Oceania',
      las: 'LAS',
      lan: 'LAN'
    }
  }

  getTotalUsers () {
    return request(this.rankingUrl).then((html) => {
      const totalUsersRegex = /rating ranking of ([0-9]*) summoners/g
      var matches = totalUsersRegex.exec(html)
      if (!matches) throw new TotalUsersNotFoundError()
      return matches[1]
    })
  }

  getRankingFromUser (user) {
    return request(user.rankingUrl).then((html) => {
      const $ = this.getWindow(html)
      const row = $('#active-row td')
        .map((idx, el) => $(el).text())
      return row[0]
    })
  }

  getAuthConf ({body, response}) {
    const tokenRegexp = /name="authenticity_token" value="([a-zA-Z0-9/+-=]*)"/g
    const match = tokenRegexp.exec(body)
    if (!match) throw new AuthTokenNotFoundError()
    const authToken = match[1]
    const cookies = response.headers['set-cookie']
    const authCookie = cookies.find((cookie) => cookie.indexOf(authCookieName) === 0).split('=')[1].split(';')[0]
    return {authCookie, authToken}
  }

  isHomePage (html) {
    const homepageRegexp = /<title>ARAM ranked<\/title>/g
    return !!homepageRegexp.exec(html)
  }

  getUserByName (username) {
    if (!username) return Promise.reject(new EmptyUsernameError())

    const user = {}
    this.homeUrl = `http://www.aram-ranked.info/${this.server}`

    return request({
      uri: this.homeUrl,
      transform: (body, response, error) => {
        if (error) throw error
        return {body, response}
      }
    })
    .then(this.getAuthConf)
      .then(({authToken, authCookie}) => this.getUserId({authToken, authCookie, username}))
      .then(({html, url}) => {
        if (this.isHomePage(html)) {
          throw new UserNotFoundError()
        }
        Object.assign(user, this.extractUserInfos({url, html}))
        user.isNew = this.containsWelcomeMessage(html)
        return user
      })
  }

  getUserId ({authToken, authCookie, username}) {
    const j = request.jar()
    const cookie = request.cookie(`${authCookieName}=${authCookie}`)
    j.setCookie(cookie, this.homeUrl)
    return request({
      method: 'POST',
      uri: `http://www.aram-ranked.info/${this.server}/statistics/submit`,
      form: {
        authenticity_token: authToken,
        summoner_name: username,
        utf8: '✓'
      },
      jar: j
    }).catch(this.handleRedirect.bind(this))
  }

  getPageByUrl (url) {
    return request(url).then((html) => {
      return {html, url}
    })
  }

  handleRedirect (error) {
    if (error.statusCode === 302) {
      return this.getPageByUrl(error.response.headers.location)
    }
  }

  containsWelcomeMessage (html) {
    return html.indexOf(welcomeMessage) !== -1
  }

  extractUserId (url) {
    return url.split('=')[1]
  }

  getWindow (html) {
    const srcRegex = /src=/gi
    html = html.replace(srcRegex, 'data-src=')
    const window = domino.createWindow(html)
    return Zepto(window)
  }

  extractUserInfos ({html, url}) {
    const user = {url}
    user.id = this.extractUserId(url)
    const $ = this.getWindow(html)
    const usernameNode = $('dd').get(0)
    const ratingNode = $('dd').get(2)
    user.lastGame = $('#recent tr:first-child td:first-child').text()
    user.refreshUrl = siteRoot + $($('.btn.btn-refresh')[0]).attr('href')
    user.rankingUrl = siteRoot + $('.btn.btn-search.btn-ranking').attr('href')
    user.summonerId = user.rankingUrl.slice(user.rankingUrl.indexOf('=') + 1)
    user.summonerIcon = siteRoot + $($('img.icon_image')[0]).data('src')
    user.rating = $(ratingNode).text().trim()
    user.username = $(usernameNode).text().trim()

    return user
  }
}

module.exports = AramRanked
