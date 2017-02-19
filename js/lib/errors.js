
class EmptyUsernameError extends Error {
  constructor () {
    super()
    this.message = 'Empty user name ...'
    this.status = 'empty_username'
  }
}

module.exports = {EmptyUsernameError}
