#!/usr/bin/env node

const Promise = require('bluebird')
const request = Promise.promisifyAll(require('request'))

let args = Array.prototype.slice.call(process.argv, 2)

let [method, url] = args
let headers = {}
let body = null
let queries = {}

if(!method || !url) {
  printUsage()
  process.exit(1)
}

if(! url.match(/:\/\//)) { 
  url = 'http://' + url
}

let functionName = method.toLowerCase() + 'Async'
let outputFields = { 'response.body': 1 }

for(let i = 2; i < args.length; i++) {
  let arg = args[i]

  switch(arg) {
    case '--header': case '-h':
      addHeader(args[++i])
      break
    case '--body': case '-b':
      body = args[++i]
      break;
    case '--query': case '-q':
      addQuery(args[++i])
      break
    case '-':
      body = process.stdin
      break
    case '--json':
      addHeader('ContentType=application/json')
      break
    default:
      printUsage()
      break
  }
}

request[functionName]({ url, method, headers, qs: queries, body})
  .then((res, body) => {
    output('statusCode', res.statusCode)
    output('response.body', res.body)
  })
  .catch(console.error)

//METHODS/////////////////////////

function output(field, value) {
  if (outputFields[field]) {
    console.log(value)
  }
}

function addHeader(header) {
  let [key, value] = header.split('=')
  headers[key] = value
}

function addQuery(query) {
  let [key, value] = query.split('=')
  queries[key] = value
}

function printUsage() {
  console.log('http <method> <url> [--header <key>=<value>] [--query <key>=<value>]')
}
