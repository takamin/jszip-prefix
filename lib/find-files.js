"use strict";
const fs = require("../lib/fs-promise.js");
const path = require("path");

/**
 * @async
 * @returns {Promise} A promise.
 */
async function findFiles(name, onFileFound) {
    const list = [];
    await findFiles_(name, list, onFileFound);
    return list;
}

async function findFiles_(name, list, onFileFound) {
    const rootStats = await fs.stat.async(name);
    if(rootStats.isDirectory()) {
        const files = await fs.readdir.async(name);
        return Promise.all(files.map( async file => {
            const pathname = path.join(name, file);
            await findFiles_(pathname, list, onFileFound);
        }));
    } else if(!onFileFound) {
        list.push(name);
    } else {
        const ret = onFileFound(name);
        if(!ret) {
            list.push(name);
        } else if(ret.constructor === Promise) {
            list.push(await ret);
        } else {
            list.push(ret);
        }
    }
}

module.exports = findFiles;
