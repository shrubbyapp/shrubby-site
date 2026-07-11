#!/usr/bin/env node
// html-inline drops the <head> parcel emits, so the single-file bundle ships
// without a viewport meta — mobile browsers then render it at desktop width.
// Re-inject the head and the overflow guard after every bundle build.
//   usage: node scripts/postbuild-head.mjs bundle.html
import { readFileSync, writeFileSync } from 'node:fs'

const file = process.argv[2] || 'bundle.html'
let html = readFileSync(file, 'utf8')

const HEAD =
  '<head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
  '<meta name="theme-color" content="#1f3320"></head>'
const GUARD = 'html,body{max-width:100%}body{overflow-x:hidden;-webkit-text-size-adjust:100%}'

if (!html.includes('name="viewport"')) {
  html = html.replace(/<html([^>]*)>/, (m, attrs) => `<html${attrs}>${HEAD}`)
}
if (!html.includes('overflow-x:hidden;-webkit-text-size-adjust')) {
  html = html.replace('<style>', `<style>${GUARD}`)
}

writeFileSync(file, html)
const ok = html.includes('name="viewport"') && html.includes(GUARD)
if (!ok) { console.error('postbuild-head: injection failed'); process.exit(1) }
console.log('postbuild-head: viewport meta + overflow guard present')
