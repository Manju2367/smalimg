"use strict"

const { contextBridge, ipcRenderer } = require("electron")



contextBridge.exposeInMainWorld("electronAPI", {
    compressImages: (fileList) => ipcRenderer.invoke("compressImages", fileList),
    convertImages: (fileList, type) => ipcRenderer.invoke("convertImages", fileList, type),
    readBase64: (url) => ipcRenderer.invoke("readBase64", url)
})
