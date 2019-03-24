"use strict";
const fs = require("fs");
const makeAsync = f => (...args) =>
    new Promise((resolve, reject) => {
        args.push((err, data) => {
            if(err) reject(err); else resolve(data);
        });
        f.apply(global, args);
    });

Object.keys(fs)
    .filter(name => !name.match(/Sync$/))
    .filter(name => typeof(fs[name]) === "function")
    .filter(name => fs[name].constructor === Function)
    .forEach(name => fs[name].async = makeAsync(fs[name]));

module.exports = fs;
