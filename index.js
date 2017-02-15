const {app, BrowserWindow, Tray} = require('electron')
const {ipcMain} = require('electron')
const path = require('path')
const url = require('url')
let win, tray

function createWindow () {
  win = new BrowserWindow({
    frame: false,
    width: 1024,
    height: 425,
    'minWidth': 1024,
    'minHeight': 425,
    'accept-first-mouse': true,
    'title-bar-style': 'hidden',
    'icon': './images/icon.jpg'
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

  tray = new Tray('./images/icon.jpg')
  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show()
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

ipcMain.on('notification', (event, notification) => {
  win.flashFrame(true)
  win.focus()
  tray.displayBalloon({
    title: notification.title,
    content: notification.message,
    icon: './images/icon.jpg'
  })
})
