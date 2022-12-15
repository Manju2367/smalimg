"use strict"

const convertStrToBool = str => {
    if(typeof str !== "string") { 
        return Boolean(str)
    }

    try {
        return JSON.parse(str.toLowerCase())
    } catch(error) {
        return str !== ""
    }
}
