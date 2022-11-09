window.addEventListener("load", () => {

    // let inpImg = document.getElementById("inp-img")

    const sendFiles = async (fileList) => {
        let pathList = [];
        for(let i = 0; i < fileList.length; i++) {
            // check mime type
            if(fileList.item(i).type.match(/image\/.*/))
                pathList.push(fileList.item(i).path);
        }
        return window.electronAPI.compressImages(pathList);
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
        
        let result = await sendFiles(e.dataTransfer.files);
        console.log(result);

        loadingContainer.classList.remove("active");
    }

    let inpImg = document.getElementById("inp-img");
    inpImg.oninput = async (e) => {
        loadingContainer.classList.add("active");

        let result = await sendFiles(e.target.files);
        console.log(result);

        loadingContainer.classList.remove("active");
    }
    
});