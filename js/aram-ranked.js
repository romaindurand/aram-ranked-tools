const $ = require('jquery')
const Horseman = require('node-horseman')

const siteRoot = 'http://www.aram-ranked.info'
const registerUrl = 'http://www.aram-ranked.info/euw'
const rankingUrl = 'http://www.aram-ranked.info/euw/statistics/ranking'
const ErrorEmptyUsername = {
  message: 'Empty user name ...',
  status: 'empty_username'
}
const ErrorUserNotFound = {
  message: 'User was not found on this server.',
  status: 'user_not_found'
}

module.exports = {
  getTotalUsers () {
    return new Promise((resolve, reject) => {
      $.ajax(rankingUrl).then((html) => {
        const totalUsersRegex = /rating ranking of ([0-9]*) summoners/g
        var matches = totalUsersRegex.exec(html)
        if (!matches) {
          reject('No match, check totalUsersRegex')
          return
        }
        resolve(matches[1])
      }).catch((error) => {
        console.error(error)
        reject(error)
      })
    })
  },

  getRankingFromUrl (url) {
    return new Promise((resolve, reject) => {
      $.ajax(url).then((html) => {
        const srcRegex = /src=/gi
        html = html.replace(srcRegex, 'data-src=')
        const row = $(html)
          .find('#active-row td')
          .map((idx, el) => $(el).text())
        resolve(row[0])
      }).catch((error) => {
        console.error(error)
        reject(error)
      })
    })
  },

  getUserByName (username) {
    return new Promise((resolve, reject) => {
      if (!username) {
        reject(ErrorEmptyUsername)
        return
      }

      const user = {}
      new Horseman({
        loadImages: false,
        timeout: 15000
      }).open(registerUrl)
        .value('#summoner_name', username)
        .click('input.btn.navbar-btn.btn-search')
        .waitForNextPage()
        .url()
        .then((url) => {
          if (url === registerUrl) {
            throw Object.assign(new Error(ErrorUserNotFound.status), ErrorUserNotFound)
          }
          user.id = url.slice(url.indexOf('=') + 1)
        })
        .html()
        .then((html) => {
          Object.assign(user, this.extractUserInfos(html))
          user.isNew = this.isNewUser(html)
          resolve(user)
        })
        .catch((ex) => {
          reject(ex)
        })
        .close()
    })
  },

  isNewUser (html) {
    const message = 'Welcome To ARAM Ranked'
    return html.indexOf(message) !== -1
  },

  extractUserInfos (html) {
    // prevent assets from being loaded by jQuery parsing
    const srcRegex = /src=/gi
    html = html.replace(srcRegex, 'data-src=')

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
