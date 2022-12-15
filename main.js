"use strict"

const { app, BrowserWindow, ipcMain } = require("electron")
const propertiesReader = require("properties-reader")
const path = require("path")
const { ImagePool } = require("@squoosh/lib")
const { cpus } = require("os")
const { readFileSync, existsSync, mkdirSync, writeFile, writeFileSync } = require("fs")

if(!existsSync("app.ini")) {
    const ini = 
        "# 出力ファイル\n" +
        `dist=${ path.join(__dirname, "/dist") }\n\n` +
        "devmode=false\n"
    writeFileSync("app.ini", ini, { encoding: "utf-8" })
}

const imagePool = new ImagePool(cpus().length)
const properties = propertiesReader("app.ini")
const appName = "smalimg"
// 画像出力フォルダ
const outputDir = properties.get("dist")
const devmode = Boolean(properties.get("devmode"))
// use default options
const jpgEncodeOptions = {
    mozjpeg: {}
}
const pngEncodeOptions = {
    oxipng: {}
}
const webpEncodeOptions = {
    webp: {}
}
const jxlEncodeOptions = {
    jxl: {}
}

let win = null



/**
 * 
 * @param {*} e 
 * @param {Array<String>} fileList 
 */
const compressImages = async (e, fileList) => {
    const imagePoolList = fileList.map(fileName => {
        const imageFile = readFileSync(fileName)
        const image = imagePool.ingestImage(imageFile)
        return { name: fileName, image}
    })

    win.setTitle(`${ appName } - 圧縮中`)

    await Promise.all(
        imagePoolList.map(async (item) => {
            const { image } = item
            if(/\.(jpe?g)$/i.test(item.name)) {
                await image.encode(jpgEncodeOptions)
            }
            if(/\.(png)$/i.test(item.name)) {
                await image.encode(pngEncodeOptions)
            }
            if(/\.(webp)$/i.test(item.name)) {
                await image.encode(webpEncodeOptions)
            }
            if(/\.(jxl)$/i.test(item.name)) {
                await image.encode(jxlEncodeOptions)
            }
        })
    )

    let returnObj = {
        reuslt: "success",
        fileList: [],
        pathList: []
    }
    for(const item of imagePoolList) {
        const {
            name,
            image: { encodedWith }
        } = item

        let data

        if(encodedWith.mozjpeg) {
            data = await encodedWith.mozjpeg
        }

        if(encodedWith.oxipng) {
            data = await encodedWith.oxipng
        }

        if(!existsSync(outputDir)) {
            mkdirSync(outputDir)
        }

        let outputFilename = name.replace(/^.*\\/, "")
        writeFile(`${ outputDir }/optimized_${ outputFilename }`, data.binary, (error, result) => {
            if(error) {
                console.log("error", error)
                returnObj.reuslt = "failure"
                return returnObj
            }
        })
        returnObj.fileList.push(`optimized_${ outputFilename }`)
        returnObj.pathList.push(`${ outputDir }/optimized_${ outputFilename }`)
    }

    win.setTitle(appName)
    
    return returnObj
}

/**
 * 
 * @param {*} e 
 * @param {Array<String>} fileList 
 * @param {String} type 
 */
const convertImages = async (e, fileList, type) => {
    const imagePoolList = fileList.map(fileName => {
        const imageFile = readFileSync(fileName)
        const image = imagePool.ingestImage(imageFile)
        return { name: fileName, image}
    })

    win.setTitle(`${ appName } - 変換中`)

    await Promise.all(
        imagePoolList.map(async (item) => {
            const { image } = item
            if(type === "jpg") {
                await image.encode(jpgEncodeOptions)
            }
            if(type === "png") {
                await image.encode(pngEncodeOptions)
            }
            if(type === "webp") {
                await image.encode(webpEncodeOptions)
            }
            if(type === "jxl") {
                await image.encode(jxlEncodeOptions)
            }
        })
    )

    let returnObj = {
        reuslt: "success",
        fileList: [],
        pathList: []
    }
    for(const item of imagePoolList) {
        const {
            name,
            image: { encodedWith }
        } = item

        let data

        if(type === "jpg") {
            data = await encodedWith.mozjpeg
        }
        if(type === "png") {
            data = await encodedWith.oxipng
        }
        if(type === "webp") {
            data = await encodedWith.webp
        }
        if(type === "jxl") {
            data = await encodedWith.jxl
        }

        if(!existsSync(outputDir)) {
            mkdirSync(outputDir)
        }

        let outputFilename = name.replace(/^.*\\/, "").replace(/^(.+)\..+$/, "$1")
        writeFile(`${ outputDir }/optimized_${ outputFilename }.${ type }`, data.binary, (error, result) => {
            if(error) {
                console.log("error", error)
                returnObj.reuslt = "failure"
                return returnObj
            }
        })
        returnObj.fileList.push(`optimized_${ outputFilename }.${ type }`)
        returnObj.pathList.push(`${ outputDir }/optimized_${ outputFilename }.${ type }`)
    }

    win.setTitle(appName)
    
    return returnObj
}

/**
 * 
 * @param {*} e 
 * @param {String} url 
 */
const readBase64 = async (e, url) => {
    let splitedWithComma = url.split(".")
    const type = splitedWithComma[splitedWithComma.length - 1]
    const base64Data = readFileSync(url, {
        encoding: "base64"
    })

    return {
        type: type,
        base64: base64Data
    }
}

const createWindow = () => {
    win = new BrowserWindow({
        width: 960,
        height: 640,
        title: appName,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            devTools: devmode
        },
        icon: path.join(__dirname, "/src/img/icon.ico")
    })

    win.loadURL(`file://${ __dirname }/src/index.html`)
}

app.whenReady().then(() => {
    ipcMain.handle("compressImages", compressImages)
    ipcMain.handle("convertImages", convertImages)
    ipcMain.handle("readBase64", readBase64)

    createWindow()
    app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on("window-all-closed", () => {
    if(process.platform !== "darwin") app.quit()
})
