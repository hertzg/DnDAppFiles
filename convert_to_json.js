#!/bin/env node
var XML2JSON = require('xml2json')
    , FS = require('fs')
    , Path = require('path')
    , Assert = require('assert')

if (process.argv.length !== 3) {
    console.error('usage: node convert_to_json.js input_xml')
    process.exit(1)
}

function removeEmptyObjects(target) {
    Object.keys(target).map(function (key) {
        if (target[key] instanceof Object) {
            if (!Object.keys(target[key]).length && typeof target[key].getMonth !== 'function') {
                if (Array.isArray(target)) {
                    target.splice(parseInt(key, 10), 1)
                } else {
                    delete target[key]
                }
            } else {
                removeEmptyObjects(target[key])
            }
        } else if (target[key] === null) {
            delete target[key]
        }
    })
    return target
}

FS.realpath(Path.normalize(process.argv[2]), function (err, source) {
    Assert.ifError(err)
    var input = Path.parse(source)
        , target = Path.join(Path.join(input.dir, input.name + '.json'))

    FS.readFile(source, {encoding: 'utf-8'}, function (err, xmlContent) {
        Assert.ifError(err)

        var json = XML2JSON.toJson(xmlContent, {
            object: true,
            coerce: true,
            sanitize: true,
            trim: true,
            arrayNotation: false
        })

        var cleanJson = removeEmptyObjects(json)
            , jsonString = JSON.stringify(cleanJson, null, 2)

        FS.writeFile(target, jsonString, function (err) {
            Assert.ifError(err)
            console.log('Wrote to %j', target)
        })
    })
})



