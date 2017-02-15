const fs = require('fs')

class Db {
  constructor (filename = 'db.json') {
    this.filename = filename
    this.load()
  }

  load () {
    let fileContent
    const emptyObject = '{}'
    try {
      fileContent = fs.readFileSync(this.filename, 'utf-8')
    } catch (error) {
      fs.writeFileSync(this.filename, emptyObject)
      fileContent = emptyObject
    }
    if (!fileContent) fileContent = emptyObject
    this.store = JSON.parse(fileContent)
  }

  save (key) {
    if (!key) {
      fs.writeFileSync(this.filename, JSON.stringify(this.store, null, 2))
      return
    } else {
      const fileContent = fs.readFileSync(this.filename, 'utf-8')
      const data = JSON.parse(fileContent)
      data[key] = this.store[key]
      fs.writeFileSync(this.filename, JSON.stringify(data, null, 2))
    }
  }

}

module.exports = Db
