const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const SerialPort = require('serialport')
const Ready = require('@serialport/parser-ready')
const Avrgirl = require('avrgirl-arduino')

const manufacturers = ["FTDI", "Silicon Labs"]

async function open() {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (canceled) return
  const filePath = filePaths[0]
  return {filePath: filePath, fileName: path.basename(filePath) }
}

async function list() {
  let ports = await SerialPort.list()
  ports = ports.filter(port => manufacturers.includes(port.manufacturer))
  return ports
}

async function flash(event, port, filePath) {
  var avrgirl = new Avrgirl({ board: 'mega', port: port, debug: true })
  return new Promise((resolve, reject) => {
    avrgirl.flash(filePath, (error) => {
      if (error) reject(error)
      resolve('Flash ok!')
    })
  })
}

async function reset(event, port) {
  var message = ''
  return new Promise((resolve, reject) => {
    const serialport = new SerialPort(port, { baudRate: 250000 }, (err) => {
      if (err) reject(err.message)
    })

    const parser = serialport.pipe(new Ready({ delimiter: 'start' }))
    
    parser.on('ready', () => {
      serialport.write('M502\nM500\n', (err) => {
        if (err) {
          serialport.close()
          reject(err.message)
        }
      })
    })

    parser.on('data', (data) => {
      var line = data.toString().trim()
      if(line.indexOf('echo:Hardcoded') !== -1) {
        message = 'Factory settings loaded!\n'
      } else if(line.indexOf('echo:Settings') !== -1) {
        message += 'Factory settings saved!'
        serialport.close()
        resolve(message)
      }
    })
  })
}


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 350, //800
    height: 250, //600
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    resizable: false,
    autoHideMenuBar: true,
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools({mode: 'bottom', activate: true})
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:open', open)
  ipcMain.handle('serial:list', list)
  ipcMain.handle('serial:flash', flash)
  ipcMain.handle('serial:reset', reset)
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/*
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
*/

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
