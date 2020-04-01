// ==UserScript==
// @name         MonkeyConfig Lite
// @namespace    https://github.com/OddMorning
// @version      1.0
// @author       OddMorning
// @date         2020-04-01
// @description  Easy configuration dialog builder for user scripts, inspired by MonkeyConfig
// @include      *
// ==/UserScript==
'use strict';

let MonkeyConfig
(function(){

  // Check if there are missing permissions
  const hasMissingPermissions = typeof GM_getValue === 'undefined' ||
    typeof GM_setValue === 'undefined' ||
    typeof GM_addStyle === 'undefined' ||
    typeof GM_registerMenuCommand === 'undefined'

  if (hasMissingPermissions) {
    throw new Error(`[MonkeyConfig Lite]: Can't inject script because not all needed permissions were granted!

      Please make sure the following permissions are granted:

      // ==UserScript==
      // <...>
      // @grant        GM_registerMenuCommand
      // @grant        GM_addStyle
      // @grant        GM_getValue
      // @grant        GM_setValue
      // <...>
      // ==/UserScript==
    `)
  }

  let classes = {
    prefix: `__MonkeyConfig-Lite-${Math.round(Math.random() * 10000)}`,
    beforeAppear: 'before-appear',
    beforeDisappear: 'before-remove',
    disppearAnimationMs: 200,
  }
  let styleAdded = false
  let stylesheet = `
    #${classes.prefix}-container {
      --ShadowSmall: 0 0 2px 0 rgba(60, 64, 67, .30), 0 0 3px 1px rgba(60, 64, 67, .15);
      --TransFnDecelerate: cubic-bezier(0, 0, .2, 1);
      --TransTmAreaMediumIn: 250ms;
      --TransTmAreaMediumOut: 200ms;
      font-family: 'Segoe UI', Arial, sans-serif;
      justify-content: center;
      align-items: center;
      z-index: 999999999;
      position: fixed;
      display: flex;
      bottom: 0;
      right: 0;
      left: 0;
      top: 0;
    }

    #${classes.prefix}-backdrop {
      transition: backdrop-filter var(--TransTmAreaMediumIn) var(--TransFnDecelerate);
      backdrop-filter: blur(1px) brightness(.8);
      position: absolute;
      height: 100%;
      width: 100%;
    }
    #${classes.prefix}-container.${classes.beforeAppear} #${classes.prefix}-backdrop {
      backdrop-filter: none;
    }
    #${classes.prefix}-container.${classes.beforeDisappear} #${classes.prefix}-backdrop {
      transition: backdrop-filter var(--TransTmAreaMediumOut) var(--TransFnDecelerate);
      backdrop-filter: none;
    }

    #${classes.prefix}-content {
      transition: transform var(--TransTmAreaMediumOut) var(--TransFnDecelerate), opacity var(--TransTmAreaMediumOut) var(--TransFnDecelerate);
      box-shadow: var(--ShadowSmall);
      background-color: #FFF;
      padding: 1rem 1.5rem;
      border-radius: 2px;
      z-index: 99999999;
      min-width: 350px;
      grid-gap: .75rem;
      display: grid;
    }
    #${classes.prefix}-container.${classes.beforeAppear} #${classes.prefix}-content {
      transform: translateY(3px);
      opacity: 0;
    }
    #${classes.prefix}-container.${classes.beforeDisappear} #${classes.prefix}-content {
      transform: translateY(-3px);
      opacity: 0;
    }

    #${classes.prefix}-header {
      --logo-size: 32px;
      grid-template-columns: var(--logo-size) 1fr var(--logo-size);
      align-items: center;
      font-size: 1.25rem;
      text-align: center;
      user-select: none;
      grid-gap: 1rem;
      display: grid;
    }

    #${classes.prefix}-logo {
      background-image: url('${GM_info.script.icon64 || GM_info.script.icon}');
      background-repeat: no-repeat;
      height: var(--logo-size);
      width: var(--logo-size);
      background-size: cover;
    }

    .${classes.prefix}-separator {
      height: 1px;
      background-color: rgba(0,0,0,.1);
    }

    #${classes.prefix}-close-btn {
      justify-self: center;
      align-self: center;
      cursor: pointer;
      line-height: 1;
      padding: 8px;
      height: 16px;
      width: 16px;
    }

    #${classes.prefix}-body {
      grid-template-columns: max-content 1fr max-content;
      align-items: stretch;
      grid-gap: .5rem 1rem;
      display: grid;
    }

    .${classes.prefix}-label {
      align-self: center;
    }

    .${classes.prefix}-field {
      padding: .25rem .5rem;
      font: inherit;
      outline: none;
    }

    .${classes.prefix}-input-checkbox {
      justify-self: center;
      align-self: center;
      margin: 0;
    }

    .${classes.prefix}-btn {
      background-color: rgba(0,0,0,.05);
      border-radius: 2px;
      cursor: pointer;
      line-height: 1;
      outline: none;
      display: flex;
      font: inherit;
      height: 100%;
      border: none;
    }
    .${classes.prefix}-btn:hover {
      background-color: rgba(0,0,0,.1);
    }
    .${classes.prefix}-btn:active {
      background-color: rgba(0,0,0,.15);
    }
    .${classes.prefix}-btn svg {
      width:16px;
      height:16px;
    }
    .${classes.prefix}-hidden {
      visibility: hidden;
    }
  `

  /** Render each option */
  function renderItem (parentEl, key, param) {
    const value = this.get(key)

    const labelEl = document.createElement('div')
    labelEl.setAttribute('class', `${classes.prefix}-label`)
    labelEl.textContent = param.label
    parentEl.appendChild(labelEl)

    const buttonsEl = document.createElement('div')
    const defaultBtnEl = document.createElement('button')
    defaultBtnEl.setAttribute('class', `${classes.prefix}-btn ${classes.prefix}-default-btn`)
    defaultBtnEl.setAttribute('title', `Set default value ("${param.default}")`)
    buttonsEl.appendChild(defaultBtnEl)

    defaultBtnEl.insertAdjacentHTML('beforeend',`
      <svg viewBox="0 0 24 24">
        <path fill="#6F6F6F" d="M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z"></path>
      </svg>
    `)

    let inputEl
    let defaultCallback
    switch (param.type) {
      case 'text':
        inputEl = document.createElement('input')
        inputEl.setAttribute('class', `${classes.prefix}-field ${classes.prefix}-input-text`)
        inputEl.setAttribute('type', 'text')
        break;
      case 'number':
        inputEl = document.createElement('input')
        inputEl.setAttribute('class', `${classes.prefix}-field ${classes.prefix}-input-number`)
        inputEl.setAttribute('type', 'number')
        break;
      case 'checkbox':
        inputEl = document.createElement('input')
        inputEl.setAttribute('class', `${classes.prefix}-input-checkbox`)
        inputEl.setAttribute('type', 'checkbox')
        break;
      case 'select':
        inputEl = document.createElement('select')
        inputEl.setAttribute('class', `${classes.prefix}-field ${classes.prefix}-input-select`)
        for (const [value, label] of Object.entries(param.choices)) {
          inputEl.insertAdjacentHTML('beforeend', `<option value='${value}'>${label}</option>`)
        }
        break;
    }
    switch (param.type) {
      case 'text':
      case 'number':
      case 'select':
        inputEl.value = value
        defaultCallback = () => { inputEl.value = param.default; inputEl.dispatchEvent(new Event('change')) }
        break;
      case 'checkbox':
        inputEl.checked = value
        defaultCallback = () => { inputEl.checked = param.default; inputEl.dispatchEvent(new Event('change')) }
        break;
    }
    defaultBtnEl.addEventListener('click', defaultCallback)
    inputEl.setAttribute('name', param.label)

    const onChange = (value) => {
      this.set(key, value)

      if (value === param.default) {
        defaultBtnEl.classList.add(`${classes.prefix}-hidden`)
      } else {
        defaultBtnEl.classList.remove(`${classes.prefix}-hidden`)
      }
    }
    inputEl.addEventListener('change', (ev) => {
      switch (param.type) {
        case 'text':
        case 'select':
          onChange(inputEl.value)
          break;
        case 'number':
          onChange(+inputEl.value)
          break;
        case 'checkbox':
          onChange(inputEl.checked)
          break;
      }
    })
    onChange(value)

    parentEl.appendChild(inputEl)
    parentEl.appendChild(buttonsEl)
  }

  /** Render config window content */
  function renderPage (rootEl) {
    const headerEl = document.createElement('div')
    headerEl.setAttribute('id', `${classes.prefix}-header`)
    headerEl.insertAdjacentHTML('beforeend', `<div id="${classes.prefix}-logo"></div>`)
    headerEl.insertAdjacentHTML('beforeend', `<div id="${classes.prefix}-title">${this.title}</div>`)
    // headerEl.insertAdjacentHTML('beforeend', `<div id="${classes.prefix}-close-btn"></div>`)
    // headerEl.querySelector(`#${classes.prefix}-close-btn`).addEventListener('click', () => { this.close() })

    const closeEl = document.createElement('div')
    closeEl.setAttribute('id', `${classes.prefix}-close-btn`)
    closeEl.addEventListener('click', () => { this.close() })
    closeEl.insertAdjacentHTML('beforeend',`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.001 512.001">
        <path d="M284.286 256.002L506.143 34.144c7.811-7.811 7.811-20.475 0-28.285-7.811-7.81-20.475-7.811-28.285 0L256 227.717 34.143 5.859c-7.811-7.811-20.475-7.811-28.285 0-7.81 7.811-7.811 20.475 0 28.285l221.857 221.857L5.858 477.859c-7.811 7.811-7.811 20.475 0 28.285 3.905 3.905 9.024 5.857 14.143 5.857 5.119 0 10.237-1.952 14.143-5.857L256 284.287l221.857 221.857c3.905 3.905 9.024 5.857 14.143 5.857s10.237-1.952 14.143-5.857c7.811-7.811 7.811-20.475 0-28.285L284.286 256.002z"/>
      </svg>
    `)
    headerEl.appendChild(closeEl)

    const bodyEl = document.createElement('div')
    bodyEl.setAttribute('id', `${classes.prefix}-body`)

    for (const [key, param] of Object.entries(this.params)) {
      renderItem.bind(this)(bodyEl, key, param)
    }

    rootEl.appendChild(headerEl)
    rootEl.insertAdjacentHTML('beforeend', `<div class="${classes.prefix}-separator"></div>`)
    rootEl.appendChild(bodyEl)
  }

  /** Fill / generate missing user params */
  function normalizeParams (paramsRaw) {
    const params = {}

    const keyToLabel = (str) => str                           // 'some_value'
      .replace(/_(\w)/g, (_, letter) => letter.toUpperCase()) // 'someValue'
      .replace(/([A-Z])/g, (_, letter) => ` ${letter}`)       // 'some Value'
      .replace(/(\w)/, (_, letter) => letter.toUpperCase())   // 'Some Value'

    for (const [key, paramRaw] of Object.entries(paramsRaw)) {
      const param = {
        label: null,
        type: null,
        default: null,
        choices: null,
      }

      // Generate label from key if needed
      param.label = paramRaw.label || keyToLabel(key)

      // Sanitize type and set default values
      switch (paramRaw.type) {
        case 'number':
          param.type = 'number'
          param.default = paramRaw.default || 0
          break;
        case 'checkbox':
        case 'boolean':
          param.type = 'checkbox'
          param.default = paramRaw.default || false
          break;
        case 'select':
        case 'choice':
        case 'dropdown':
          param.type = 'select'
          param.default = paramRaw.default || null
          break;
        default:
          param.type = 'text'
          param.default = paramRaw.default || ''
          break;
      }

      // Normalize choices for 'select' type (turn Array into Object if needed)
      if (param.type === 'select') {
        const choicesRaw = paramRaw.choices
        const isArray = Array.isArray(choicesRaw)
        const isObject = typeof choicesRaw === 'object'

        if (isArray) {
          param.choices = {}
          for (const choice of choicesRaw) {
            param.choices[choice] = choice
          }
        } else if (isObject) {
          param.choices = choicesRaw
        } else {
          throw new Error(`"choices" key of param "${key}" is either missing or is not Array or Object!`)
        }
      }

      params[key] = param
    }

    return params
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  /** Class to use outside */
  class MonkeyConfigClass {
    constructor ({ title, menuCommand, params } = {}) {
      this.title = title
      this.params = normalizeParams(params)
      Object.defineProperty(this, '_el', { value: null, enumerable: false, writable: true })
      Object.defineProperty(this, '_isOpened', { value: false, enumerable: false, writable: true })
      Object.defineProperty(this, '_optionsRawName', { value: `_MonkeyConfig_${title.replace(/[^a-zA-Z0-9]/g, '_')}_cfg`, enumerable: false, writable: true })
      Object.defineProperty(this, 'userValues', { value: JSON.parse(GM_getValue(this._optionsRawName, '{}')), enumerable: false, writable: true })

      // Add button to extension menu
      if (menuCommand !== false) {
        GM_registerMenuCommand(title, () => {
          if (this._isOpened) {
            this.close()
          } else {
            this.open()
          }
        })
      }
    }

    get (key) {
      const userValue = this.userValues[key]
      const defaultValue = this.params[key].default
      const hasUserValue = typeof userValue !== 'undefined'
      const hasDefaultValue = typeof defaultValue !== 'undefined'
      const isValidKey = hasUserValue || hasDefaultValue

      if (!isValidKey) return undefined
      return hasUserValue ? userValue : defaultValue
    }

    set (key, val) {
      const userValue = this.userValues[key]
      const defaultValue = this.params[key].default
      const hasUserValue = typeof userValue !== 'undefined'

      if (!hasUserValue && val === defaultValue) {
        return
      } else if (hasUserValue && val === userValue) {
        return
      } else if (val === defaultValue) {
        delete this.userValues[key]
      } else {
        this.userValues[key] = val
      }

      GM_setValue(this._optionsRawName, JSON.stringify(this.userValues))
    }

    open () {
      if (this._isOpened) return

      if (!styleAdded) {
        GM_addStyle(stylesheet)
        styleAdded = true
      }

      const containerEl = document.createElement('div')
      containerEl.setAttribute('id', `${classes.prefix}-container`)
      containerEl.setAttribute('class', classes.beforeAppear)

      const backdropEl = document.createElement('div')
      backdropEl.setAttribute('id', `${classes.prefix}-backdrop`)
      backdropEl.addEventListener('click', ev => { this.close() })
      containerEl.appendChild(backdropEl)

      const contentEl = document.createElement('div')
      contentEl.setAttribute('id', `${classes.prefix}-content`)
      renderPage.bind(this)(contentEl)
      containerEl.appendChild(contentEl)

      document.body.appendChild(containerEl)

      requestAnimationFrame(() => {
        containerEl.classList.remove(classes.beforeAppear)
      })

      this._el = containerEl
      this._isOpened = true
    }

    close () {
      console.log('close', this)
      if (!this._isOpened) return

      this._el.classList.add(classes.beforeDisappear)
      setTimeout(() => {
        this._el.remove()
        this._el = null
      }, classes.disppearAnimationMs)

      this._isOpened = false
    }
  }

  MonkeyConfig = MonkeyConfigClass
})();
