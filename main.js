const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { ImagePool } = require("@squoosh/lib");
const { cpus } = require("os");
const { readFileSync, existsSync, mkdirSync, writeFile } = require("fs");
const imagePool = new ImagePool(cpus().length);

// 画像出力フォルダ
const OUTPUT_DIR = "./dist";
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
const sendImgFiles = async (e, fileList) => {
    const imagePoolList = fileList.map(fileName => {
        const imageFile = readFileSync(fileName);
        const image = imagePool.ingestImage(imageFile);
        return { name: fileName, image}
    });

    win.setTitle("smalimg - 圧縮中");

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
                return "failed";
            }
        });
    }

    win.setTitle("smalimg");
    
    return "succeed";
}

const createWindow = () => {
    win = new BrowserWindow({
        width: 960,
        height: 640,
        title: "smalimg",
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.menuBarVisible = false;
    win.loadURL(`file://${ __dirname }/src/index.html`);
}

app.whenReady().then(() => {
    ipcMain.handle("sendImgFiles", sendImgFiles);

    createWindow();
    app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if(process.platform !== "darwin") app.quit();
});
