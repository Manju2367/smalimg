"use strict"

const { contextBridge, ipcRenderer } = require("electron")
const { existsSync, writeFileSync } = require("fs")
const propertiesReader = require("properties-reader")

// app.iniの存在チェック
if(!existsSync("app.ini")) {
    const ini = 
        "# 出力ファイル\n" +
        `dist=${ path.join(__dirname, "/dist") }\n\n` +
        "devmode=false\n"
    writeFileSync("app.ini", ini, { encoding: "utf-8" })
}

const properties = propertiesReader("app.ini")



contextBridge.exposeInMainWorld("properties", {
    getIni: (key) => properties.get(key),
    getIniAll: () => properties.getAllProperties(),
    setIni: (key, value) => properties.set(key, value)
})

contextBridge.exposeInMainWorld("electron", {
    openDialog: () => ipcRenderer.invoke("openDialog"),
    closeModal: () => ipcRenderer.invoke("closeModal")
})
