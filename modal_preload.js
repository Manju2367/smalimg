"use strict"

const { contextBridge, ipcRenderer } = require("electron")
const { existsSync, writeFileSync } = require("fs")
const propertiesReader = require("properties-reader")
const { convertStrToBool } = require("./src/js/util")

// app.iniの存在チェック
if(!existsSync("app.ini")) {
    const ini = 
        `dist=C:\\Users\\${ userInfo().username }\\Pictures\\smalimg\n` +
        "devmode=false\n"
    writeFileSync("app.ini", ini, { encoding: "utf-8" })
}

const properties = propertiesReader("app.ini", "utf-8")



contextBridge.exposeInMainWorld("properties", {
    getIni: (key) => properties.get(key),
    getIniAll: () => properties.getAllProperties(),
    setIni: (key, value) => properties.set(key, value),
    save: () => properties.save("app.ini")
})

contextBridge.exposeInMainWorld("electron", {
    openDialog: () => ipcRenderer.invoke("openDialog"),
    closeModal: () => ipcRenderer.invoke("closeModal"),
    setProperties: () => ipcRenderer.invoke("setProperties")
})

contextBridge.exposeInMainWorld("util", {
    convertStrToBool: (str) => convertStrToBool(str)
})
