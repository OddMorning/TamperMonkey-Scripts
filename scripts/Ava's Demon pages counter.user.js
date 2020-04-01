// ==UserScript==
// @name         Ava's Demon pages counter
// @version      1.1.2
// @date         2019-07-18
// @author       OddMorning
// @match        https://avasdemon.com/pages*
// @match        https://www.avasdemon.com/pages*
// @icon         https://avasdemon.com/favicon.ico
// @grant        none
// @run-at       document-start
// @updateURL    https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/Ava's%20Demon%20pages%20counter.head.js
// @downloadURL  https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/Ava's%20Demon%20pages%20counter.user.js
// ==/UserScript==
'use strict';

const injectInterface = () => {
  document.querySelector('#navButtons_bottom').insertAdjacentHTML('afterEnd', `
    <style>
      #pagesState {
        display: inline-block;
        margin-top: 1em;
      }
      #pagesState fieldset {
        padding: .25em 2em .5em;
        border-radius: 8px;
        border: 1px solid #c92;
        border-width: 1px 0;
      }
      #pagesState legend {
        display: block;
        letter-spacing: 3px;
        font-size: 90%;
        color: #c92;
        margin: 0 2em;
        margin: 0;
      }
      #pagesState .number {
        color: #fc3;
        text-decoration: none;
        font-size: 150%;
      }
      #pagesState .spacer {
        color: #fc3;
        position: relative;
        bottom: 3px;
        letter-spacing: -1.5px;
        padding: 0 2px;
      }
      .pagesState_nextBtnLocked {
        opacity: .5;
        pointer-events: none;
      }
      .pagesState_pictureLocked {
        pointer-events: none;
      }
    </style>
    <form id='pagesState'>
      <fieldset>
        <legend>Pages (<span id="pagesState_all">----</span>)</legend>
        <div>
          <span id="pagesState_curr" class="number">----</span>
          <span class="spacer">⮕</span>
          <span id="pagesState_left" class="number">----</span>
        </div>
      </fieldset>
    </form>
  `)
}

const updateInterface = () => {
  // `curPage` and `lastComicPage` are global variables provided by the site

  if (!document.querySelector('#pagesState')) injectInterface()

  const nextBtn = document.querySelector('#navButtons_bottom img:nth-child(2)')
  const pictureEl = document.querySelector('#page')

  const currLabel = document.querySelector('#pagesState_curr')
  const leftLabel = document.querySelector('#pagesState_left')
  const allLabel = document.querySelector('#pagesState_all')
  const pagesLeft = (lastComicPage-curPage)

  currLabel.textContent = curPage
  leftLabel.textContent = (pagesLeft+1).toString().padStart(4, '0')
  allLabel.textContent = lastComicPage

  if (pagesLeft === 0) {
    nextBtn.classList.add('pagesState_nextBtnLocked')
    pictureEl.classList.add('pagesState_pictureLocked')
  } else {
    nextBtn.classList.remove('pagesState_nextBtnLocked')
    pictureEl.classList.remove('pagesState_pictureLocked')
  }
}

// On init
document.addEventListener("DOMContentLoaded", () => {
  injectInterface()
  updateInterface()
})

// On change
window.addEventListener('hashchange', (ev) => {
  updateInterface()
})
