const $ = require('jquery')

const siteRoot = 'http://www.aram-ranked.info'
const rankingUrl = 'http://www.aram-ranked.info/euw/statistics/ranking'
const welcomeMessage = 'Welcome To ARAM Ranked'
const totalUsersRegex = /rating ranking of ([0-9]*) summoners/g
const titleRegexp = /<title>(.*)<\/title>/g
const summonerIdRexexp = /href="\/euw\/twitter_oauth\/index\?summoner_id=(\d*)"/g

class ErrorEmptyUsername extends Error {
  constructor () {
    super()
    this.message = 'Empty user name ...'
    this.status = 'empty_username'
  }
}
class ErrorUserNotFound extends Error {
  constructor () {
    super()
    this.message = 'User was not found on this server.'
    this.status = 'user_not_found'
  }
}
class AuthTokenNotFound extends Error {
  constructor () {
    super()
    this.message = 'Auth token was not found on this page.'
    this.status = 'auth_token_not_found'
  }
}
class UserIdNotFound extends Error {
  constructor () {
    super()
    this.message = 'User ID not found on this page.'
    this.status = 'user_id_not_found'
  }
}
class TotalUsersNotFound extends Error {
  constructor () {
    super()
    this.message = 'Total users count not found on this page.'
    this.status = 'total_users_not_found'
  }
}

module.exports = {
  getTotalUsers () {
    return $.ajax(rankingUrl).then((html) => {
      var matches = totalUsersRegex.exec(html)
      if (!matches) throw new TotalUsersNotFound()
      return matches[1]
    })
  },

  getRankingFromUser (user) {
    return $.ajax(user.url).then((html) => {
      const srcRegex = /src=/gi
      html = html.replace(srcRegex, 'data-src=')
      const row = $(html)
        .find('#active-row td')
        .map((idx, el) => $(el).text())
      return row[0]
    })
  },

  getAuthToken (html) {
    const tokenRegexp = /name="authenticity_token" value="([a-zA-Z0-9/+-=]*)"/g
    const match = tokenRegexp.exec(html)
    if (!match) throw new AuthTokenNotFound()
    return match[1]
  },

  isHomePage (html) {
    return !!titleRegexp.exec(html)
  },

  getUserByName (username) {
    if (!username) return Promise.reject(new ErrorEmptyUsername())

    const user = {}

    return $.ajax({url: 'http://www.aram-ranked.info/euw'})
      .then(this.getAuthToken)
      .then((authToken) => {
        return $.ajax({
          type: 'POST',
          url: 'http://www.aram-ranked.info/euw/statistics/submit',
          data: {
            authenticity_token: authToken,
            summoner_name: username,
            utf8: '&#x2713;'
          }
        })
      })
    .then((html) => {
      if (this.isHomePage(html)) {
        throw new ErrorUserNotFound()
      }
      user.id = this.getUserId(html)
      Object.assign(user, this.extractUserInfos(html))
      user.isNew = this.containsWelcomeMessage(html)
      return user
    })
  },

  getUserId (html) {
    const match = summonerIdRexexp.exec(html)
    if (!match) throw new UserIdNotFound()
    return match[1]
  },

  containsWelcomeMessage (html) {
    return html.indexOf(welcomeMessage) !== -1
  },

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
