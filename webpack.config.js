import path from 'path'
import fs from 'fs-extra'
import {fileURLToPath} from 'url'

const rootFolder = path.dirname(fileURLToPath(import.meta.url))
const outputFolder = path.resolve(rootFolder, 'webpacked')

const entries = {
  demo5: './demo5.js',
  demo6: './demo6.js'
}

export default {
  // each file is its own entry
  entry: entries,

  output: {
    // output each test entry to its own file name
    filename: '[name].js',
    path: outputFolder,

    // clean the dist folder on each rebuild
    clean: true,
  }
}
