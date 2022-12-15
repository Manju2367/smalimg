"use strict"

window.addEventListener("load", () => {

    const ini = window.properties.getIniAll()
    
    let listSettings = document.getElementById("ul-settings")
    let listItems = listSettings.querySelectorAll("li.list-settings")
    let inputOutDist = document.getElementById("input-out-dist")
    let buttonOutDist = document.getElementById("button-out-dist")
    let buttonCancel = document.getElementById("button-cancel")
    let buttonCommit = document.getElementById("button-commit")
    let buttonCommitAndClose = document.getElementById("button-commit-and-close")

    listItems.forEach(item => {
        let key = item.dataset.key
        /** @type {HTMLInputElement} */
        let input = item.querySelector(".input-setting")

        if(input.tagName === "INPUT") {
            switch(input.type) {
                case "text":
                    input.value = ini[key]
                    input.dataset.old = ini[key]
                    break

                case "checkbox":
                    input.checked = Boolean(ini[key])
                    input.dataset.old = ini[key]
                    break
            }
        }
    })

    buttonOutDist.onclick = () => {
        window.electron.openDialog().then(result => {
            if(!result.canceled) {
                inputOutDist.value = result.filePaths[0]
            }
        })
    }

    buttonCancel.onclick = () => {
        window.electron.closeModal()
    }

    buttonCommit.onclick = () => {

    }

    buttonCommitAndClose.onclick = () => {

    }

})
