window.addEventListener("load", () => {

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

    const readBase64 = async (path) => {
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
            document.body.append(canvas);
    
            canvas.toBlob(async blob => {
                let item = {};
                item[`image/png`] = blob;
                const ci = new ClipboardItem(item);
                await navigator.clipboard.write([ci]);
            });
        }
        img.src = `data:image/${ type };base64,${ base64 }`;
    }



    let imageTypeTo = document.getElementById("image-type-to");
    let inpCompress = document.getElementById("compress");
    let inpConvert = document.getElementById("convert");
    inpCompress.oninput = () => {
        imageTypeTo.disabled = true;
    }
    inpConvert.oninput = () => {
        imageTypeTo.disabled = false;
    }

    let inpContainer = document.getElementById("inp-container");
    inpContainer.ondragover = e => {
        e.preventDefault();
        inpContainer.classList.add("draging");
    }

    inpContainer.ondragleave = e => {
        e.preventDefault();
        inpContainer.classList.remove("draging");
    }

    let loadingContainer = document.getElementById("loading-container");
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

        loadingContainer.classList.remove("active");
    }

    let inpImg = document.getElementById("inp-img");
    let menuArrow = document.getElementById("menu-arrow");
    let otpContainer = document.getElementById("otp-container");
    let otpItemContainer = document.getElementById("otp-item-container");
    inpImg.oninput = async (e) => {
        loadingContainer.classList.add("active");

        while(otpItemContainer.firstChild) {
            otpItemContainer.removeChild(otpItemContainer.firstChild);
        }

        let result = await compress(e.target.files);
        for(let i = 0; i < result.pathList.length; i++) {
            let div = document.createElement("div");
            let span = document.createElement("span");

            span.innerText = result.fileList[i];
            div.append(span);
            otpItemContainer.append(div);
        }

        loadingContainer.classList.remove("active");
    }

    menuArrow.onclick = () => {
        if(otpContainer.classList.contains("active")) {
            otpContainer.classList.remove("active");
            menuArrow.classList.remove("active");
        } else {
            otpContainer.classList.add("active");
            menuArrow.classList.add("active");
        }

    }
    
});