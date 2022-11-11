const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { ImagePool } = require("@squoosh/lib");
const { cpus } = require("os");
const { readFileSync, existsSync, mkdirSync, writeFile } = require("fs");
const imagePool = new ImagePool(cpus().length);

const appName = "smalimg";
// 画像出力フォルダの相対パス
const OUTPUT_DIR = "./dist";
// 画像出力フォルダの絶対パス
const OUTPUT_DIR_ABS = path.resolve(OUTPUT_DIR);
console.log(OUTPUT_DIR_ABS);
let win;

// use default options
const jpgEncodeOptions = {
    mozjpeg: {  }
};

// use default options
const pngEncodeOptions = {
    oxipng: {  }
};

/**
 * 
 * @param {*} e 
 * @param {Array<String>} fileList 
 */
const compressImages = async (e, fileList) => {
    const imagePoolList = fileList.map(fileName => {
        const imageFile = readFileSync(fileName);
        const image = imagePool.ingestImage(imageFile);
        return { name: fileName, image}
    });

    win.setTitle(`${ appName } - 圧縮中`);

    await Promise.all(
        imagePoolList.map(async (item) => {
            const { image } = item;
            if(/\.(jpe?g)$/i.test(item.name)) {
                await image.encode(jpgEncodeOptions);
            }
            if(/\.(png)$/i.test(item.name)) {
                await image.encode(pngEncodeOptions);
            }
        })
    );

    let returnObj = {
        reuslt: "success",
        pathList: []
    };
    for(const item of imagePoolList) {
        const {
            name,
            image: { encodedWith }
        } = item;

        let data;

        if(encodedWith.mozjpeg) {
            data = await encodedWith.mozjpeg;
        }

        if(encodedWith.oxipng) {
            data = await encodedWith.oxipng;
        }

        if(!existsSync(OUTPUT_DIR)) {
            mkdirSync(OUTPUT_DIR);
        }

        let outputFilename = name.replace(/^.*\\/, "");
        console.log(outputFilename);
        writeFile(`${ OUTPUT_DIR }/optimized_${ outputFilename }`, data.binary, (error, result) => {
            if(error) {
                console.log("error", error)
                returnObj.reuslt = "failure";
                return returnObj;
            }
        });
        returnObj.pathList.push(`${ OUTPUT_DIR_ABS }/optimized_${ outputFilename }`);
    }

    win.setTitle(appName);
    
    return returnObj;
}

/**
 * 
 * @param {*} e 
 * @param {Array<String>} fileList 
 * @param {String} type 
 */
const convertImages = async (e, fileList, type) => {
    return `${ fileList[0] } is ${ type } type image file.`;
}

const createWindow = () => {
    win = new BrowserWindow({
        width: 960,
        height: 640,
        title: appName,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.menuBarVisible = false;
    win.loadURL(`file://${ __dirname }/src/index.html`);
}

app.whenReady().then(() => {
    ipcMain.handle("compressImages", compressImages);
    ipcMain.handle("convertImages", convertImages);

    createWindow();
    app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if(process.platform !== "darwin") app.quit();
});
