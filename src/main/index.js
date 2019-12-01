require('v8-compile-cache')
import { app, BrowserWindow, Notification } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let tray = null
let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    useContentSize: true,
    width: 518,
    height: 600,
    resizable: false,		//是否允許拉伸大小 
    show: false,			//建立後是否顯示 
    frame: true ,			//是否建立 frameless 窗口 
    fullscreenable: false , //是否允許全螢幕 
    center: true ,			//是否出現在螢幕居中的位置 
    //backgroundColor: '#fff', //背景顏色，用於 transparent 和 frameless 視窗
    //titleBarStyle: 'xxx',	//標題欄的樣式，有 hidden、hiddenInset、customButtonsOnHover 等
    webPreferences: { 
      backgroundThrottling: true //當頁面被置於非選取視窗的時候是否停止動畫和計時器
    }
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    const notification = new Notification({
      title: "繼承人應繼分",
      body: "程式已啟動"
    }) 
    notification.show()
    })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
// set appId for notification
import pkg from '../../package.json' 
if (process.platform === 'win32' ) { 
  app.setAppUserModelId(pkg.build.appId) 
} 
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
