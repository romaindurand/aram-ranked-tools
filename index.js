const {app, BrowserWindow, Tray} = require('electron')
const {ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const notifications = []
let win, tray, currentNotification

function createWindow () {
  win = new BrowserWindow({
    frame: false,
    width: 1024,
    height: 425,
    'minWidth': 1024,
    'minHeight': 425,
    'accept-first-mouse': true,
    'title-bar-style': 'hidden',
    'icon': path.join(__dirname, 'images/icon.jpg')
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
    tray.destroy()
    tray = null
  })

  tray = new Tray(path.join(__dirname, 'images/icon.jpg'))
  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show()
  })

  tray.on('balloon-click', () => {
    currentNotification = null
    win.show()
    win.focus()
  })

  tray.on('balloon-closed', () => {
    currentNotification = null
    displaNextNotification()
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function displaNextNotification () {
  if (currentNotification) return
  currentNotification = notifications.shift()
  setTimeout(() => {
    currentNotification = null
  }, 4000)
  if (!currentNotification) return
  tray.displayBalloon({
    title: currentNotification.title,
    content: currentNotification.message,
    icon: path.join(__dirname, 'images/icon.jpg')
  })
}

ipcMain.on('notification', (event, notification) => {
  notifications.push(notification)
  displaNextNotification()
})
