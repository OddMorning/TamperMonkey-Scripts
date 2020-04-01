// ==UserScript==
// @name         Better MMB Scroll
// @version      1.1.2
// @date         2020-04-01
// @author       OddMorning
// @description  Hold MMB and move mouse to scroll up and down. Inspired by Everything's scrolling
// @match        http*://*/*
// @icon         https://cdn3.iconfinder.com/data/icons/iconic-1/32/move_alt1-512.png
// @updateURL    https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/common/Better%20MMB%20Scroll.head.js
// @downloadURL  https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/common/Better%20MMB%20Scroll.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://raw.githubusercontent.com/OddMorning/TamperMonkey-Scripts/master/lib/monkeyconfig-lite.js
// ==/UserScript==
'use strict';

const Config = new MonkeyConfig({
  title: 'Configure',
  params: {
    scroll_speed: {
      label: 'Scroll Speed',
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

