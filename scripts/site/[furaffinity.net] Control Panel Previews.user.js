// ==UserScript==
// @name         [furaffinity.net] Control Panel Previews
// @version      1.1
// @date         2019-09-31
// @description  Adds thumbnails for favs and readable comments in the user control panes
// @author       OddMorning
// @homepage     https://github.com/OddMorning/TamperMonkey-Scripts
// @icon         http://www.furaffinity.net/themes/beta/img/favicon.ico
// @match        http*://www.furaffinity.net/*
// @updateURL    https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/site/%5Bfuraffinity.net%5D%20Control%20Panel%20Previews.head.js
// @downloadURL  https://github.com/OddMorning/TamperMonkey-Scripts/raw/master/scripts/site/%5Bfuraffinity.net%5D%20Control%20Panel%20Previews.user.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @noframes
// ==/UserScript==
/* jshint -W097 */
/* jshint esnext: true */
'use strict';

/* observeElements v1.0.1 min */
function observeElements(){var e,r="observed";r+="-"+Math.round(1e3*performance.now()),e=arguments[0]instanceof Array?arguments:[arguments[0],arguments[1]];for(var o=new MutationObserver(function(o){o.forEach(function(o){try{if(o.addedNodes.length)for(var n=0;n<o.addedNodes.length;n++)for(var t=o.addedNodes[n],l=0;l<e.length;l++)if(t.classList&&t.matches(e[l][0])&&!t[r])e[l][1](t),t[r]=!0;else if(t.querySelectorAll&&t.querySelectorAll(e[l][0]).length)for(var s=t.querySelectorAll(e[l][0]),a=0;a<s.length;a++)s[a]&&!s[a][r]&&(e[l][1](s[a]),s[a][r]=!0)}catch(c){console.group("observeElements error:"),console.error(c.message),"undefined"!=typeof n&&e[n]&&console.warn("Tag:",e[n][0]),console.log(o),console.groupEnd("observeElements error:")}})}),n=0;n<e.length;n++){var t=document.querySelectorAll(e[n][0]);if(t.length)for(var l=0;l<t.length;l++)t[l][r]||(e[n][1](t[l]),t[l][r]=!0)}return o.observe(document.body,{childList:!0,subtree:!0}),o}

function newEl(tag, attrs) {
    /* newEl v1.0.1 */
    var node = document.createElement(tag);
    if (!attrs) return node;

    Object.getOwnPropertyNames(attrs).forEach((param,i) => {
        var value = Object.getOwnPropertyDescriptor(attrs, param) ?
                    Object.getOwnPropertyDescriptor(attrs, param).value :
                    false;
        if (param[0] == '$') {
            switch (param.slice(1)) {
                case 'content':
                    node.innerHTML = value;
                    break;

                case 'children':
                    for (i=0; i<value.length; i=i+2) {
                        var baseEl = arguments[2] || node;
                        var el = newEl(value[i], value[i+1], baseEl);
                        if (value[i+1].$id) {
                            baseEl[value[i+1].$id] = el;
                        }
                        node.appendChild(el);
                    }
                    break;

                default:
                    break;
            }
        } else {
            node.setAttribute(param.replace(/([A-Z])/g,'-$1').toLowerCase(), value);
        }
    });

    return node;
}

const getCachedValue = async (valuePath, getValueFn) => {
  const storageKey = valuePath.join('_')
  const storage = typeof unsafeWindow === 'undefined' ? window.localStorage : unsafeWindow.localStorage

  const has = (key) => {
    if (!storage[key]) return false

    const { lastAccessTs } = get(key)
    const nowTs = new Date().valueOf()
    const olderThanTs = 1000 * 60 * 60 * 24 * 120 // 120 days
    const isOld = nowTs - lastAccessTs > olderThanTs

    return !isOld
  }
  const get = (key) => {
    return JSON.parse(storage[key])
  }
  const set = (key, value) => {
    const lastAccessTs = new Date().valueOf()
    storage[key] = JSON.stringify({ value, lastAccessTs })
  }

  const value = has(storageKey) ? get(storageKey).value : await getValueFn()
  set(storageKey, value) // Set value and/or update timestamp
  return value
}

let cooldownLastCalled = null
const getCooldownTime = (increaseByMs = 500) => {
  let lastDate = cooldownLastCalled
  let now = new Date().valueOf()

  if (!lastDate || cooldownLastCalled < now) {
    cooldownLastCalled = now + increaseByMs
    return 0
  }

  cooldownLastCalled = lastDate + increaseByMs

  return lastDate - now
}

const asyncPause = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

/* -----==========----- */

/* jshint ignore:start */
GM_addStyle(`

.upgraded-fav {
    display: flex !important;
    align-items: center;
}

.upgraded-fav .pfp,
.upgraded-fav .thumb {
    align-items: center;
    display: flex;
}

.upgraded-fav .image {
    height: 32px;
    margin: auto;
    margin-right: 5px;
}

.upgraded-fav .icon-fav {
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABtUlEQVR42mNgwAHa3dilOj3YZ4EwkC3OQCoAaoq8MIPv6vlpfJeA7HBSNctODuVY8P4g/993+/j/TgrimA8UkyTFgJiLM/mvfzzC/x+Ega64AhSLwKdBD+RkIC4B4p6pYRwL3+3n/wsz4C3QFUAXLQTKdQNxMVStDlzz5irO7Rfn8V69v4732etd/N9gGtHxK6Dc/TW8z4Bqr2ys4NwGNgRIxJ1tFr7x/gB2TdgwSO3ZJpFrQL3RIAPkJ/lwL7zfKfXh40EBwgYcEPh/v13y3URvzgVAvTIwbzhP8OGcf69D4u2HA7gN+bBf4P/tFsk3E7y5QLHiiB6Q9n1eXPNerBL+jsuAZ8uFvvd5cswFqrXFFRsT32wT+IkzELcI/QCq6celmQmUbN8hhcP7PYJgDOcf5P/XAUnajNgMkFmawrkG7FdgOLycL/nvdIHkjdNFkjdA7I/7IQbPj+daCVQrgc0Aw805/DvfLJL8f6lM6sHcIF6QwjgQnhvMu/JSucTDN4sk/q/L5APFvzY2A7hAMbEwjG8NkJ2FrAiUYIA4e1E4/9p+YEAD2Ry4woELlJHwJHk5dM0A35paqUX+VJcAAAAASUVORK5CYII=);
    display: inline-block;
    height: 16px;
    margin: 5px;
    width: 16px;
}

.upgraded-fav .date {
    border-top: 1px solid transparent; /* Fix for default styles */
    margin-left: 5px;
}

/* --- */

.upgraded-shout .image,
.upgraded-comment .image {
    height: 32px;
}

.upgraded-shout .container,
.upgraded-comment .container {
    padding: .5em 1.5em;
    display: flex;
}

.upgraded-shout .content,
.upgraded-comment .content {
    background-color: #555862;
    border-radius: .25em;
    align-items: center;
    margin-left: 1.5em;
    position: relative;
    padding: .5em;
    display: flex;
}

.upgraded-shout .content::after,
.upgraded-comment .content::after {
    border-color: transparent #555862;
    border-width: .5em .75em .5em 0;
    border-style: solid;
    position: absolute;
    display: block;
    content: '';
    right: 100%;
    z-index: 1;
    top: .25em;
    width: 0;
}

`);
/* jshint ignore:end */

/* -----==========----- */

const wipeElementContent = (el) => {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

const fetchUrlDOM = async (url) => {
  const resp = await fetch(url)
  const pageRawContent = await resp.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(pageRawContent, 'text/html')

  return doc
}

const fetchUserPfpUrl = async (url) => {
    const pfpUrl = await getCachedValue(['fa-thumbs-cache', 'pfp', url], async () => {
        await asyncPause(getCooldownTime(250))
        const doc = await fetchUrlDOM(url)
        const pfpUrl = doc.querySelector('#user-profile img').src
        return pfpUrl
    })
    return pfpUrl
}

const fetchArtUrl = async (url) => {
    const artUrl = await getCachedValue(['fa-thumbs-cache', 'art', url], async () => {
        await asyncPause(getCooldownTime(250))
        const doc = await fetchUrlDOM(url)
        const artUrl = doc.querySelector('#submissionImg').dataset.previewSrc
        return artUrl
    })
    return artUrl
}

const fetchCommentContent = async (url, commentId) => {
    const commentData = await getCachedValue(['fa-thumbs-cache', 'comment', url], async () => {
        await asyncPause(getCooldownTime(250))
        const doc = await fetchUrlDOM(url)
        const el = doc.querySelector(`[id="cid:${commentId}"]`)
        return {
            pfpUrl: el.querySelector('.comment_useravatar').src,
            commentContent: el.querySelector('.comment_text').innerHTML.trim(),
        }
    })
    return commentData
}

const fetchShoutContent = async (callback, shoutId) => {
    const shoutData = await getCachedValue(['fa-thumbs-cache', 'shout', shoutId], async () => {
        await asyncPause(getCooldownTime(250))
        return await callback(shoutId)
    })
    return shoutData
}

/* -----==========----- */

const upgradeFavItem = async (el) => {
    const [ [ userName, userUrl ], [ artName, artUrl ] ] = [...el.querySelectorAll('a')].map(el => [el.textContent, el.href])
    const userPfpUrl = await fetchUserPfpUrl(userUrl)
    const artImgUrl = await fetchArtUrl(artUrl)
    const checkboxEl = await el.querySelector('input[type="checkbox"]')
    const dateEl = await el.querySelector('.popup_date')
    const fragment = document.createDocumentFragment()

    let pfpEl = newEl('a', {
        class: 'pfp',
        href: userUrl,
        $children: [
            'img', {
                class: 'image',
                src: userPfpUrl
            },
            'strong', {
                $content: userName
            }
        ]
    })

    let favIconEl = newEl('div', {
        class: 'icon-fav',
    })

    let artEl = newEl('a', {
        class: 'thumb',
        href: artUrl,
        $children: [
            'img', {
                class: 'image',
                src: artImgUrl
            },
            'strong', {
                $content: artName
            }
        ]
    })

    checkboxEl.classList.add('checkbox')
    dateEl.classList.add('date')

    fragment.appendChild(checkboxEl)
    fragment.appendChild(pfpEl)
    fragment.appendChild(favIconEl)
    fragment.appendChild(artEl)
    fragment.appendChild(dateEl)

    wipeElementContent(el)
    el.classList.add('upgraded-fav')

    el.appendChild(fragment)
}

const upgradeCommentItem = async (el) => {
    const commentId = el.querySelector('input[type="checkbox"]').value
    const submissionUrl = el.querySelectorAll('a')[1].href
    const { pfpUrl, commentContent } = await fetchCommentContent(submissionUrl, commentId)

    let commentEl = newEl('div', {
        class: 'container',
        $children: [
            'img', {
                class: 'image',
                src: pfpUrl
            },
            'div', {
                class: 'content',
                $content: commentContent
            }
        ]
    })

    el.classList.add('upgraded-comment')
    el.appendChild(commentEl)
}

const upgradeShoutsContainer = async (rootEl) => {
    let doc = null

    const fetchShoutContentFn = async (shoutId) => {
        if (!doc) {
            const ownPageUrl = document.querySelector('#my-username').href
            doc = await fetchUrlDOM(ownPageUrl)
        }
        const shoutRemoteEl = doc.querySelector(`#shout-${shoutId}`)
        return {
            pfpUrl: shoutRemoteEl.querySelector('.comment_useravatar').src,
            shoutContent: shoutRemoteEl.querySelector('.comment_text').innerHTML.trim(),
        }
    }

    for (const el of rootEl.querySelectorAll('li')) {
        const shoutId = el.querySelector('input[type="checkbox"]').value
        const { pfpUrl, shoutContent } = await fetchShoutContent(fetchShoutContentFn, shoutId)

        let shoutEl = newEl('div', {
            class: 'container',
            $children: [
                'img', {
                    class: 'image',
                    src: pfpUrl
                },
                'div', {
                    class: 'content',
                    $content: shoutContent
                }
            ]
        })

        el.classList.add('upgraded-shout')
        el.appendChild(shoutEl)
    }
}

/* -----==========----- */

observeElements(
    ['#messages-favorites li',				upgradeFavItem],
    ['#messages-comments-submission li',	upgradeCommentItem],
    ['#messages-shouts',					upgradeShoutsContainer],
);
