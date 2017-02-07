const $ = require('jquery')

const siteRoot = 'http://www.aram-ranked.info'
const rankingUrl = 'http://www.aram-ranked.info/euw/statistics/ranking'
const welcomeMessage = 'Welcome To ARAM Ranked'

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
class UserIdNotFoundError extends Error {
  constructor () {
    super()
    this.message = 'User ID not found on this page.'
    this.status = 'user_id_not_found'
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
    return $.ajax(rankingUrl).then((html) => {
      const totalUsersRegex = /rating ranking of ([0-9]*) summoners/g
      var matches = totalUsersRegex.exec(html)
      if (!matches) throw new TotalUsersNotFoundError()
      return matches[1]
    })
  }

  getRankingFromUser (user) {
    return $.ajax(user.url).then((html) => {
      const srcRegex = /src=/gi
      html = html.replace(srcRegex, 'data-src=')
      const row = $(html)
        .find('#active-row td')
        .map((idx, el) => $(el).text())
      return row[0]
    })
  }

  getAuthToken (html) {
    const tokenRegexp = /name="authenticity_token" value="([a-zA-Z0-9/+-=]*)"/g
    const match = tokenRegexp.exec(html)
    if (!match) throw new AuthTokenNotFoundError()
    return match[1]
  }

  isHomePage (html) {
    const homepageRegexp = /<title>ARAM ranked<\/title>/g
    return !!homepageRegexp.exec(html)
  }

  getUserByName (username) {
    if (!username) return Promise.reject(new EmptyUsernameError())

    const user = {}

    return $.ajax({url: `http://www.aram-ranked.info/${this.server}`})
      .then(this.getAuthToken)
      .then((authToken) => {
        return $.ajax({
          type: 'POST',
          url: `http://www.aram-ranked.info/${this.server}/statistics/submit`,
          data: {
            authenticity_token: authToken,
            summoner_name: username,
            utf8: '&#x2713;'
          }
        })
      })
    .then((html) => {
      if (this.isHomePage(html)) {
        throw new UserNotFoundError()
      }
      user.id = this.getUserId(html)
      Object.assign(user, this.extractUserInfos(html))
      user.isNew = this.containsWelcomeMessage(html)
      return user
    })
  }

  getUserId (html) {
    const summonerIdRexexp = /twitter_oauth\/index\?summoner_id=(\d*)"/g
    const match = summonerIdRexexp.exec(html)
    if (!match) throw new UserIdNotFoundError()
    return match[1]
  }

  containsWelcomeMessage (html) {
    return html.indexOf(welcomeMessage) !== -1
  }

  extractUserInfos (html) {
    // prevent assets from being loaded by jQuery parsing
    html = html.replace(/src=/gi, 'data-src=')

    const user = {}
    const $html = $(html)
    const usernameNode = $html.find('dd').get(0)
    const ratingNode = $html.find('dd').get(2)
    user.lastGame = $html.find('#recent tr:first-child td:first-child').text()
    user.refreshUrl = siteRoot + $($html.find('.btn.btn-refresh')[0]).attr('href')
    user.rankingUrl = siteRoot + $html.find('.btn.btn-search.btn-ranking').attr('href')
    user.summonerId = user.rankingUrl.slice(user.rankingUrl.indexOf('=') + 1)
    user.summonerIcon = siteRoot + $($html.find('img.icon_image')[0]).data('src')
    user.rating = $(ratingNode).text().trim()
    user.username = $(usernameNode).text().trim()

    return user
  }
}

module.exports = AramRanked
