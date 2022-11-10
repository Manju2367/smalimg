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
        console.log(result);

        loadingContainer.classList.remove("active");
    }

    let inpImg = document.getElementById("inp-img");
    inpImg.oninput = async (e) => {
        loadingContainer.classList.add("active");

        let result = await compress(e.target.files);
        console.log(result);

        loadingContainer.classList.remove("active");
    }
    
});