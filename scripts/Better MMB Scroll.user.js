// ==UserScript==
// @name         Better MMB Scroll
// @version      1.1
// @date         2020-03-31
// @author       OddMorning
// @description  Hold MMB and move mouse to scroll up and down. Inspired by Everything's scrolling
// @match        http*://*/*
// @icon         https://cdn3.iconfinder.com/data/icons/iconic-1/32/move_alt1-512.png
// @updateURL    ...
// @downloadURL  ...
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://raw.github.com/odyniec/MonkeyConfig/master/monkeyconfig.js
// ==/UserScript==
'use strict';

const Config = new MonkeyConfig({
    title: 'Configure',
    menuCommand: true,
    params: {
        scroll_speed: {
            label: 'Scroll Speed (Default: 10)',
            type: 'number',
            default: 10,
        }
    }
})

const styleStr = `cursor: ns-resize !important`
let scrollStrength = null
let lastY = null

const onEnterMode = (ev) => {
  document.body.style.cssText += `;${styleStr}`

  scrollStrength = Config.get('scroll_speed')
  lastY = ev.clientY
}

const onLeaveMode = (ev) => {
  const { style } = document.body
  style.cssText = style.cssText.replace(styleStr, '')

  scrollStrength = null
  lastY = null
}

const onMouseMove = (ev) => {
  const delta = (lastY- ev.clientY) * -1
  const top = delta * scrollStrength
  lastY = ev.clientY

  window.scrollBy({ top })
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

document.addEventListener('mousedown', (ev) => {
  if (ev.which !== 2) return
  ev.preventDefault()

  onEnterMode(ev)
  document.addEventListener('mousemove', onMouseMove)
})

document.addEventListener('mouseup', (ev) => {
  if (ev.which !== 2) return
  ev.preventDefault()

  document.removeEventListener('mousemove', onMouseMove)
  onLeaveMode(ev)
})
