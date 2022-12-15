"use strict"

window.addEventListener("load", () => {

    let ini = window.properties.getIniAll()
    
    let listSettings = document.getElementById("ul-settings")
    let listItems = listSettings.querySelectorAll("li.list-settings")
    let inputOutDist = document.getElementById("input-out-dist")
    let buttonOutDist = document.getElementById("button-out-dist")
    let buttonCancel = document.getElementById("button-cancel")
    let buttonCommit = document.getElementById("button-commit")
    let buttonCommitAndClose = document.getElementById("button-commit-and-close")

    const initInput = () => {
        ini = window.properties.getIniAll()

        listItems.forEach(item => {
            let key = item.dataset.key
            let input = item.querySelector(".input-setting")

            if(input.tagName === "INPUT") {
                switch(input.type) {
                    case "text":
                        input.value = ini[key]
                        input.dataset.old = ini[key]
                        break

                    case "checkbox":
                        input.checked = window.util.convertStrToBool(ini[key])
                        input.dataset.old = ini[key]
                        break
                }
            }
        })
    }

    /**
     * 
     * @return {Array<{key: String, value: Any}>}
     */
    const checkUpdate = () => {
        let updateList = []

        listItems.forEach(item => {
            let key = item.dataset.key
            let input = item.querySelector(".input-setting")
    
            if(input.tagName === "INPUT") {
                switch(input.type) {
                    case "text":
                        if(input.value !== input.dataset.old) {
                            updateList.push({
                                key: key,
                                value: input.value
                            })
                        }
                        break
    
                    case "checkbox":
                        if(input.checked !== window.util.convertStrToBool(input.dataset.old)) {
                            updateList.push({
                                key: key,
                                value: input.checked
                            })
                        }
                        break
                }
            }
        })

        return updateList
    }

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
        checkUpdate().map((obj) => {
            const { key, value } = obj
            window.properties.setIni(key, value)
            window.properties.save().then(result => {
                window.electron.setProperties()
                initInput()
            }, error => {
                console.log(error)
            })
        })
    }

    buttonCommitAndClose.onclick = () => {
        checkUpdate().map((obj) => {
            const { key, value } = obj
            window.properties.setIni(key, value)
            window.properties.save().then(result => {
                window.electron.setProperties()
                window.electron.closeModal()
            }, error => {
                console.log(error)
            })
        })
    }

    initInput()

})
