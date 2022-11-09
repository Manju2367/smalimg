window.addEventListener("load", () => {

    // let inpImg = document.getElementById("inp-img")

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
        
        let files = e.dataTransfer.files;
        let pathList = [];
        for(let i = 0; i < files.length; i++) {
            // check mime type
            if(files.item(i).type.match(/image\/.*/))
                pathList.push(files.item(i).path);
        }
        console.table(pathList);

        let result = await window.electronAPI.sendImgFiles(pathList);
        loadingContainer.classList.remove("active");
        console.log(result);
    }

    let inpImg = document.getElementById("inp-img");
    inpImg.oninput = async (e) => {
        
    }
    
});