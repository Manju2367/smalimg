window.addEventListener("load", () => {

    let imageTypeTo = document.getElementById("image-type-to");
    let inpCompress = document.getElementById("compress");
    let inpConvert = document.getElementById("convert");
    let inpContainer = document.getElementById("inp-container");
    let loadingContainer = document.getElementById("loading-container");
    let inpImg = document.getElementById("inp-img");
    let menuArrow = document.getElementById("menu-arrow");
    let menuArrowWrapper = document.getElementById("menu-arrow-wrapper");
    let otpContainer = document.getElementById("otp-container");
    let otpItemContainer = document.getElementById("otp-item-container");



    const compress = async (fileList) => {
        let pathList = [];
        for(let i = 0; i < fileList.length; i++) {
            // check mime type
            if(fileList.item(i).type.match(/image\/.*/))
                pathList.push(fileList.item(i).path);
        }
        return window.electronAPI.compressImages(pathList);
    }

    const convert = async (fileList, type) => {
        let pathList = [];
        for(let i = 0; i < fileList.length; i++) {
            // check mime type
            if(fileList.item(i).type.match(/image\/.*/))
                pathList.push(fileList.item(i).path);
        }
        return window.electronAPI.convertImages(pathList, type);
    };

    const copyImg = async (path) => {
        let returnObj = await window.electronAPI.readBase64(path);
        let type = returnObj.type;
        let base64 = returnObj.base64;
        let img = new Image();
        img.onload = () => {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
    
            canvas.toBlob(async blob => {
                let item = {};
                item[`image/png`] = blob;
                const ci = new ClipboardItem(item);
                await navigator.clipboard.write([ci]);
            });
        }
        img.src = `data:image/${ type };base64,${ base64 }`;
    }

    const appendToOtp = (result) => {
        while(otpItemContainer.firstChild) {
            otpItemContainer.removeChild(otpItemContainer.firstChild);
        }

        for(let i = 0; i < result.pathList.length; i++) {
            let div = document.createElement("div");
            let span = document.createElement("span");
            let imgCopyWrapper = document.createElement("div");
            let imgCopy = document.createElement("img");
            let imgCheck = document.createElement("img");

            imgCopyWrapper.classList.add("img-copy-wrapper");
            imgCopyWrapper.dataset.path = result.pathList[i];
            imgCopyWrapper.onclick = () => {
                copyImg(result.pathList[i]).then(() => {
                    imgCheck.classList.add("active");
                    setInterval(() => {
                        imgCheck.classList.remove("active");
                    }, 2000);
                }).catch(error => {
                    console.error(error);
                });
            }
            imgCopy.src = "img/copy.png";
            imgCopy.alt = "Copy";
            imgCopy.classList.add("img-copy");
            imgCopy.width = 25;
            imgCopy.height = 25;
            imgCheck.src = "img/check.png";
            imgCheck.alt = "✓";
            imgCheck.classList.add("img-check");
            imgCheck.width = 30;
            imgCheck.height = 30;

            span.innerText = result.fileList[i];
            div.classList.add("otp-item");
            div.append(span);
            imgCopyWrapper.append(imgCopy);
            div.append(imgCopyWrapper);
            div.append(imgCheck);
            otpItemContainer.append(div);
        }
    }

    inpCompress.oninput = () => {
        imageTypeTo.disabled = true;
    }
    inpConvert.oninput = () => {
        imageTypeTo.disabled = false;
    }

    inpContainer.ondragover = e => {
        e.preventDefault();
        inpContainer.classList.add("draging");
    }

    inpContainer.ondragleave = e => {
        e.preventDefault();
        inpContainer.classList.remove("draging");
    }

    inpContainer.ondrop = async (e) => {
        e.preventDefault();
        inpContainer.classList.remove("draging");
        loadingContainer.classList.add("active");

        let result;
        if(inpConvert.checked) {
            let selectedIndex = imageTypeTo.selectedIndex;
            let selectedType = imageTypeTo.options[selectedIndex].value;
            result = await convert(e.dataTransfer.files, selectedType);
        } else {
            result = await compress(e.dataTransfer.files);
        }
        appendToOtp(result);

        loadingContainer.classList.remove("active");
    }

    inpImg.oninput = async (e) => {
        if(e.target.files.length === 0) return; 

        loadingContainer.classList.add("active");

        let result;
        if(inpConvert.checked) {
            let selectedIndex = imageTypeTo.selectedIndex;
            let selectedType = imageTypeTo.options[selectedIndex].value;
            result = await convert(e.target.files, selectedType);
        } else {
            result = await compress(e.target.files);
        }
        appendToOtp(result);

        loadingContainer.classList.remove("active");
    }

    menuArrowWrapper.onclick = () => {
        if(otpContainer.classList.contains("active")) {
            otpContainer.classList.remove("active");
            menuArrow.classList.remove("active");
        } else {
            otpContainer.classList.add("active");
            menuArrow.classList.add("active");
        }

    }
    
});