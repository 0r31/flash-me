// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('flashMeAPI', {
  open: () => ipcRenderer.invoke('dialog:open'),
  list: () => ipcRenderer.invoke('serial:list'),
  flash: (port, filePath) => ipcRenderer.invoke('serial:flash', port, filePath),
  reset: (port) => ipcRenderer.invoke('serial:reset', port)
})
