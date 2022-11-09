const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    compressImages: (fileList) => ipcRenderer.invoke("compressImages", fileList)
})
