import fs from 'fs'

export const utilService = {
    readJsonFile,
    writeJsonFile,
    makeId
}

function readJsonFile(path) {
    const str = fs.readFileSync(path, 'utf8')
    const json = JSON.parse(str)
    return json
}

function writeJsonFile(path, data) {
    const jsonString = JSON.stringify(data, null, 2); // Convert JSON object to string with indentation
    fs.writeFileSync(path, jsonString, 'utf8'); // Write the string to the file
}
    
function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}