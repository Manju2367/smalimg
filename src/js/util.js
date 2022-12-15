"use strict"

/**
 * convert String to Boolean
 * @param {String} str 
 * @return {Boolean}
 */
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

exports.convertStrToBool = convertStrToBool
