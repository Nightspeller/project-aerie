// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let fs = require('fs')

let id3 = require('id3js')

const {dialog} = require('electron').remote


dialog.showOpenDialog({properties: ['openFile', 'multiSelections']}, fileNames => {
    if (fileNames) {
        initializeAmplitude(fileNames)
    }
})

let initializeAmplitude = fileNames => {
    let tagsPromises = fileNames.map(fileName => {
        return new Promise((resolve, reject) => {
            id3({file: fileName, type: id3.OPEN_LOCAL}, (err, tags) => {
                resolve(tags)
            })
        })
    })

    Promise.all(tagsPromises).then(tags => {
        let songs = tags.map((tag, index) => {
            let arrayBufferView = new Uint8Array(tag.v2.image.data)
            let blob = new Blob([arrayBufferView], {type: tag.v2.image.mime})
            let imageUrl = window.URL.createObjectURL(blob)
            return {
                'name': tag.title,
                'artist': tag.artist,
                'album': tag.album,
                'url': fileNames[index],
                'cover_art_url': imageUrl
            }
        })
        console.log(songs)
        Amplitude.init({
            'songs': songs
        })
    })
}
