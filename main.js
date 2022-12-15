const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const { ImagePool } = require("@squoosh/lib")
const { cpus } = require("os")
const { readFileSync, existsSync, mkdirSync, writeFile } = require("fs")

const imagePool = new ImagePool(cpus().length)
const appName = "smalimg"
// 画像出力フォルダの相対パス
const OUTPUT_DIR = "./dist"
// 画像出力フォルダの絶対パス
const OUTPUT_DIR_ABS = path.resolve(OUTPUT_DIR)
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

let win



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

        if(!existsSync(OUTPUT_DIR)) {
            mkdirSync(OUTPUT_DIR)
        }

        let outputFilename = name.replace(/^.*\\/, "")
        writeFile(`${ OUTPUT_DIR }/optimized_${ outputFilename }`, data.binary, (error, result) => {
            if(error) {
                console.log("error", error)
                returnObj.reuslt = "failure"
                return returnObj
            }
        })
        returnObj.fileList.push(`optimized_${ outputFilename }`)
        returnObj.pathList.push(`${ OUTPUT_DIR_ABS }/optimized_${ outputFilename }`)
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

        if(!existsSync(OUTPUT_DIR)) {
            mkdirSync(OUTPUT_DIR)
        }

        let outputFilename = name.replace(/^.*\\/, "").replace(/^(.+)\..+$/, "$1")
        writeFile(`${ OUTPUT_DIR }/optimized_${ outputFilename }.${ type }`, data.binary, (error, result) => {
            if(error) {
                console.log("error", error)
                returnObj.reuslt = "failure"
                return returnObj
            }
        })
        returnObj.fileList.push(`optimized_${ outputFilename }.${ type }`)
        returnObj.pathList.push(`${ OUTPUT_DIR_ABS }/optimized_${ outputFilename }.${ type }`)
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
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        icon: `${ __dirname }/src/img/icon.ico`
    })

    win.menuBarVisible = false
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
