#!/usr/bin/env node

const INDENT = 2

let fs = require('fs')
let args = Array.prototype.slice.call(process.argv, 2)
let properties = []

for(let i = 0; i < args.length; i++) {
  let arg = args[i]

  switch(arg) {
    case '-':
      stream = process.stdin
      break
    case '--file': case '-f':
      stream = fs.createReadStream(args[++i])
      break
    default:
      properties.push(arg)
      break
  }
}




Promise.resolve()
  .then(() => {
    return new Promise((resolve, reject) => {
      let raw = ''
      if (!stream) { 
        printUsage() 
        reject(new Error('no stream was passed in'))
      }

      stream.on('data', data => raw += data)
      stream.on('error', reject)
      stream.on('end', () => { resolve(raw) })
    })
  })
  .then(raw => {
    json = JSON.parse(raw)

    properties.forEach((field) => {
      let tokens = field.split('.')
      console.log(getField(json, tokens))
    })
  })


function getField(json, tokens, i) {
  i = i || 0
  let current = tokens[i]

  if(current === '*') {
    let results = []
    for(let field in json) {
      results.push(getField(json[field], tokens, i+1))
    }
    return results.join('\n')
  } else if (/\(.*\)/.test(current)) {
    let subfields = current.slice(1, current.length - 1).split(',')

    return subfields.map((subfield) => {
      return getField(json[subfield], tokens, i+1)
    }).join(' ')
    
  } else if(current) {
    return getField(json[current], tokens, ++i)
  } else {
    if(typeof json === "object") {
      return JSON.stringify(json, null, INDENT)
    } else {
      return json
    }
  }
}
