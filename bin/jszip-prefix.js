#!/usr/bin/env node
"use strict";

const JSZip = require("jszip");
const fs = require("../lib/fs-promise.js");
const findFiles = require("../lib/find-files.js");

const Getopt = require('node-getopt');
const getopt = new Getopt([
    ['o', 'output=FILENAME','an output filename(default: out.zip)'],
    ['p', 'prefix=PREFIX',  'add prefix to each filenames'],
    ['h', 'help',           'display this help']
]);
getopt.setHelp(
    "Usage: jszip-prefix [OPTION] dir/file ...\n" +
    "Zip all files in a directory and add prefix to the filnames.\n" +
    "\n" +
    "[[OPTIONS]]\n" +
    "\n" +
    "Installation: npm install --global jszip-prefix\n" +
    "Respository:  https://github.com/takamin/jszip-prefix"
);
const commandLine = getopt.parseSystem();
const opts = commandLine.options;
if(opts.help) {
    getopt.showHelp();
    process.exit(0);
}
const args = require("hash-arg").get("files:string[]", commandLine.argv);

const outputFilename = opts.output || "out.zip";
const prefix = opts.prefix || "";

(async () => {
    const zip = new JSZip();
    const zipFile = async pathname => {
        if(!prefix) {
            console.log(`zip: ${pathname}`);
        } else {
            console.log(`input file: ${pathname}`);
            console.log(`   zip as ${prefix}${pathname}`);
        }
        const data = await fs.readFile.async(pathname);
        zip.file(`${prefix}${pathname}`, data);
    };

    await Promise.all(args.files.map(
        async dir => await findFiles(dir, zipFile)));

    console.log(`writing ${outputFilename}`);
    const zipStream = zip.generateNodeStream({
        type: "nodebuffer",
        streamFiles: true
    });
    const outStream = fs.createWriteStream(outputFilename);
    zipStream.pipe(outStream)
        .on("finish", () => console.log("finished."));
})();
