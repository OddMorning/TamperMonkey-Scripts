// ==UserScript==
// @name         [youtube.com] Quick Speed Button
// @version      1.6.2
// @date         2020-04-01
// @description  Script adds a custom button for setting playback speed
// @author       OddMorning
// @homepage     https://github.com/OddMorning/TamperMonkey-Scripts
// @match        https://www.youtube.com/*
// @icon         https://s.ytimg.com/yts/img/favicon_144-vfliLAfaB.png
// @updateURL    https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/site/%5Byoutube.com%5D%20Quick%20Speed%20Button.head.js
// @downloadURL  https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/site/%5Byoutube.com%5D%20Quick%20Speed%20Button.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://raw.githubusercontent.com/OddMorning/TamperMonkey-Scripts/master/scripts/lib/monkeyconfig-lite.js
// ==/UserScript==
'use strict';

const Config = new MonkeyConfig({
  title: 'Configure',
  params: {
    hide_buttons: {
      label: 'Hide "Share/Save/Dots" Buttons',
      type: 'checkbox',
      default: false,
    },
    enable_hotkeys: {
      label: 'Enable Hotkeys',
      type: 'checkbox',
      default: true,
    },
    speed_range: {
      label: 'Speed Range',
      type: 'select',
      choices: {
        extended: 'Extended (0.07 — 16.00)',
        default: 'Default (0.25 — 2.00)',
      },
      default: 'extended'
    },
  }
})

const Hotkeys = new MonkeyConfig({
  title: 'Hotkeys',
  menuCommand: true,
  params: {
    slowdown: {
      label: 'Slow Down',
      type: 'text',
      default: 'Shift + <',
    },
    speedup: {
      label: 'Speed Up',
      type: 'text',
      default: 'Shift + >',
    },
    normalspeed: {
      label: 'Normal Speed',
      type: 'text',
      default: 'Shift + "',
    },
  }
})

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* jshint ignore:start */
if (Config.get('hide_buttons')) {
GM_addStyle(`
/* Hide ... */

/* ...share button */
#primary #top-level-buttons.ytd-menu-renderer .force-icon-button:nth-child(3) {
  display: none;
}
/* ...save button */
#primary #top-level-buttons.ytd-menu-renderer .force-icon-button:nth-child(4) {
  display: none;
}
/* ...three dots button */
#primary #top-level-buttons.ytd-menu-renderer ~ #button {
  opacity: 0;
  width: 0;
}
`)
}

GM_addStyle(`
#quick_controls {
  --color-bg: var(--yt-spec-general-background-a);
  --color-text: var(--yt-spec-text-secondary);
  --color-icon: #909090;
  --icon-width: 24px;
  --icon-gap: .5rem;
  grid-auto-columns: max-content;
  color: var(--color-text);
  grid-auto-flow: column;
  padding-bottom: 4px;
  align-items: center;
  margin-left: 1rem;
  font-size: 1.3rem;
  font-weight: 500;
  grid-gap: 2rem;
  display: grid;
}

#quick_controls .qc-time-container {
  align-items: center;
  position: relative;
  cursor: default;
  display: flex;
  height: 75%;
}

#quick_controls .qc-time-container:hover .qc-time-curr {
  display: none;
}

#quick_controls .qc-time-container:hover .qc-time-remaining {
  display: initial;
}

#quick_controls .qc-time-full::before {
  content: '\\00A0/\\00A0';
}

#quick_controls .qc-time-remaining::before {
  content: '−';
}

#quick_controls .qc-time-remaining {
  display: none;
}

#quick_controls .qc-progress {
  background-color: var(--yt-spec-icon-disabled);
  position: absolute;
  margin: 0 -.5rem;
  bottom: -12px;
  height: 2px;
  right: 0;
  left: 0;
}

#quick_controls .qc-progress::before {
  background-color: var(--yt-spec-icon-inactive);
  width: calc(var(--progress) * 1%);
  position: absolute;
  height: 100%;
  content: '';
}

#quick_controls .qc-speed {
  align-items: center;
  display: flex;
  height: 100%;
}

#quick_controls .qc-speed svg {
  margin-right: var(--icon-gap);
  width: var(--icon-width);
  fill: var(--color-icon);
}

#quick_controls .qc-speed-selector {
  --left-gap: calc(var(--icon-width) + var(--icon-gap));
  --left-gap-neg: calc(var(--left-gap) * -1);
  /* -webkit-appearance: initial; */
  margin-left: var(--left-gap-neg);
  padding-left: var(--left-gap);
  background: transparent;
  cursor: pointer;
  color: inherit;
  outline: none;
  font: inherit;
  border: none;
  height: 75%;
}

#quick_controls .qc-speed-selector option {
  background: var(--color-bg);
  color: var(--color-text);
  font: inherit;
}
`);
/* jshint ignore:end */

const els = {
  video: null,
  speedSelector: null,
  timeCurr: null,
  timeFull: null,
  timeRemaining: null,
  progress: null,
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function secondsToReadable(secondsFull) {
    if (!isFinite(secondsFull)) return '0:00'

    const secondsDec = parseInt(secondsFull, 10)
    const hours = Math.floor(secondsDec / 3600)
    const minutes = Math.floor((secondsDec - (hours * 3600)) / 60)
    const seconds = secondsDec - (hours * 3600) - (minutes * 60)
    const resultArr = []

    if (hours) { // Force minutes to have two digits
      resultArr.push(hours)
      resultArr.push(minutes.toString().padStart(2, '0'))
    } else {
      resultArr.push(minutes)
    }
    resultArr.push(seconds.toString().padStart(2, '0'))

    return resultArr.join(':')
}

function changeByOneStep(goDown) {
  const { options } = els.speedSelector
  let { selectedIndex: idx, length: count } = options

  if (goDown) {
    idx = (idx === 0) ? idx : idx - 1
  } else {
    idx = (idx + 1 === count) ? idx : idx + 1
  }

  options.selectedIndex = idx
  els.speedSelector.dispatchEvent(new Event('change'))
}

function onRateChange() {
  if (+els.speedSelector.value !== +els.video.playbackRate) {
    els.speedSelector.value = els.video.playbackRate
  }

  onTimeUpdate()
}

function onTimeUpdate() {
  if (!els.video) return

  const currTimeRaw = els.video.currentTime
  const durationRaw = els.video.duration
  const rate = els.video.playbackRate

  const currTime = els.video.currentTime / rate
  const duration = els.video.duration / rate
  const progress = currTime / duration * 100

  if (els.timeCurr) els.timeCurr.textContent = secondsToReadable(currTime)
  if (els.timeRemaining) els.timeRemaining.textContent = secondsToReadable(duration - currTime)
  if (els.timeFull) els.timeFull.textContent = secondsToReadable(duration)
  if (els.progress) els.progress.style.setProperty('--progress', progress)

}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function updateVideoElement(el) {
    els.video = el
    attachListeners(el)
}

function createControls(el) {
    const isExtended = Config.get('speed_range') === 'extended'
    const speedArray = isExtended ? [
      [16, '×16'],
      [10, '×10'],
      [5, '×5'],
      [3, '×3'],
      [2.75, '×2.75'],
      [2.5, '×2.5'],
      [2.25, '×2.25'],
      [2, '×2'],
      [1.75, '×1.75'],
      [1.5, '×1.5'],
      [1.25, '×1.25'],
      [1, 'Normal'],
      [0.75, '×0.75'],
      [0.5, '×0.5'],
      [0.25, '×0.25'],
      [0.07, '×0.07'],
    ] : [
      [2, '×2'],
      [1.75, '×1.75'],
      [1.5, '×1.5'],
      [1.25, '×1.25'],
      [1, 'Normal'],
      [0.75, '×0.75'],
      [0.5, '×0.5'],
      [0.25, '×0.25'],
    ]

    const containerEl = document.createElement('div')
    containerEl.setAttribute('id', 'quick_controls')

    const timeContainerEl = document.createElement('div')
    const timeCurrEl = document.createElement('span')
    const timeRemainingEl = document.createElement('span')
    const timeFullEl = document.createElement('span')
    const progressEl = document.createElement('div')
    timeContainerEl.setAttribute('class', 'qc-time-container')
    timeCurrEl.setAttribute('class', 'qc-time-curr')
    timeRemainingEl.setAttribute('class', 'qc-time-remaining')
    timeFullEl.setAttribute('class', 'qc-time-full')
    progressEl.setAttribute('class', 'qc-progress')
    timeCurrEl.textContent = '0:00'
    timeRemainingEl.textContent = '0:00'
    timeFullEl.textContent = '0:00'
    timeContainerEl.addEventListener('mousewheel', ev => {
        const direction = ev.deltaY < 0 ? -1 : 1
        els.video.currentTime += 5 * direction
        ev.preventDefault()
    })
    timeContainerEl.addEventListener('click', ev => {
      els.video.paused ? els.video.play() : els.video.pause()
    })
    els.timeCurr = timeCurrEl
    els.timeFull = timeFullEl
    els.timeRemaining = timeRemainingEl
    els.progress = progressEl
    timeContainerEl.appendChild(timeCurrEl)
    timeContainerEl.appendChild(timeRemainingEl)
    timeContainerEl.appendChild(timeFullEl)
    timeContainerEl.appendChild(progressEl)
    containerEl.appendChild(timeContainerEl)

    const speedContainerEl = document.createElement('div')
    const speedSelectorEl = document.createElement('select')
    speedContainerEl.setAttribute('class', 'qc-speed')
    speedSelectorEl.setAttribute('class', 'qc-speed-selector')
    speedContainerEl.insertAdjacentHTML('afterbegin', `
      <svg viewBox="0 0 24 24"><path d="M19.03 7.39L20.45 5.97C20 5.46 19.55 5 19.04 4.56L17.62 6C16.07 4.74 14.12 4 12 4C7.03 4 3 8.03 3 13S7.03 22 12 22C17 22 21 17.97 21 13C21 10.88 20.26 8.93 19.03 7.39M13 14H11V7H13V14M15 1H9V3H15V1Z"></path></svg>
    `)
    speedSelectorEl.insertAdjacentHTML('afterbegin', speedArray.map(([value, description]) => `<option value="${value}">${description}</option>`).join(''))
    speedSelectorEl.value = els.video ? els.video.playbackRate : 1
    speedSelectorEl.addEventListener('change', ev => { els.video.playbackRate = ev.target.value })
    speedSelectorEl.addEventListener('mousewheel', ev => {
      changeByOneStep(ev.deltaY < 0)
      ev.preventDefault()
    })
    els.speedSelector = speedSelectorEl
    speedContainerEl.appendChild(speedSelectorEl)
    containerEl.appendChild(speedContainerEl)

    el.parentElement.appendChild(containerEl)
}

function attachListeners(el) {
/*
  // Debug every event
  const eventsList = ['audioprocess', 'canplay', 'canplaythrough', 'complete', 'durationchange', 'emptied', 'ended', 'loadeddata', 'loadedmetadata', 'pause', 'play', 'playing ', 'progress', 'ratechange', 'seeked', 'seeking', 'stalled', 'suspend', 'timeupdate', 'volumechange', 'waiting']
  const writeEv = (ev) => { console.log('Event:', ev.type) }
  eventsList.forEach(evName => { el.addEventListener(evName, writeEv) })
*/

  el.addEventListener('durationchange', onTimeUpdate, { once: true }) // Before every other event happend
  el.addEventListener('ratechange', onRateChange) // On speed change
  el.addEventListener('timeupdate', onTimeUpdate) // On playing

  const checkHotkeyAsString = (ev, str) => {
    let [mod, key] = str.split(' + ')
    if (!key) {
      key = mod
      mod = null
    }

    mod = mod ? mod.toLowerCase() : null
    key = key ? key.toLowerCase() : null

    if (mod) {
      if (mod === 'shift' && !ev.shiftKey) return false
      if (mod === 'ctrl' && !ev.ctrlKey) return false
      if (mod === 'alt' && !ev.altKey) return false
    }

    if (ev.key.toLowerCase() !== key) return false

    return true
  }

  document.addEventListener('keydown', ev => { // Change speed on pressing keys
    // console.log(ev)
    if (!Config.get('enable_hotkeys')) return

    if (checkHotkeyAsString(ev, Hotkeys.get('slowdown'))) { changeByOneStep(false) }
    if (checkHotkeyAsString(ev, Hotkeys.get('speedup'))) { changeByOneStep(true) }
    if (checkHotkeyAsString(ev, Hotkeys.get('normalspeed'))) { els.video.playbackRate = 1 }

    // if (ev.shiftKey && ev.code === 'Comma') { changeByOneStep(false); ev.preventDefault(); ev.stopPropagation(); ev.cancelBubble = true; return false; }
    // if (ev.ctrlKey && ev.code === 'Comma') { els.video.currentTime -= 1; ev.preventDefault(); }
    // if (ev.ctrlKey && ev.code === 'Period') { els.video.currentTime += 1; ev.preventDefault(); }
  })
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* jshint ignore: start */

observeElements(
    ['video',												updateVideoElement],
    ['ytd-video-primary-info-renderer #top-level-buttons',	createControls],
)

/* observeElements v1.0.1 min */
function observeElements(){var e,r="observed";r+="-"+Math.round(1e3*performance.now()),e=arguments[0]instanceof Array?arguments:[arguments[0],arguments[1]];for(var o=new MutationObserver(function(o){o.forEach(function(o){try{if(o.addedNodes.length)for(var n=0;n<o.addedNodes.length;n++)for(var t=o.addedNodes[n],l=0;l<e.length;l++)if(t.classList&&t.matches(e[l][0])&&!t[r])e[l][1](t),t[r]=!0;else if(t.querySelectorAll&&t.querySelectorAll(e[l][0]).length)for(var s=t.querySelectorAll(e[l][0]),a=0;a<s.length;a++)s[a]&&!s[a][r]&&(e[l][1](s[a]),s[a][r]=!0)}catch(c){console.group("observeElements error:"),console.error(c.message),"undefined"!=typeof n&&e[n]&&console.warn("Tag:",e[n][0]),console.log(o),console.groupEnd("observeElements error:")}})}),n=0;n<e.length;n++){var t=document.querySelectorAll(e[n][0]);if(t.length)for(var l=0;l<t.length;l++)t[l][r]||(e[n][1](t[l]),t[l][r]=!0)}return o.observe(document.body,{childList:!0,subtree:!0}),o}

/* jshint ignore: end */
