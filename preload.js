const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    sendImgFiles: (fileList) => ipcRenderer.invoke("sendImgFiles", fileList)
})
