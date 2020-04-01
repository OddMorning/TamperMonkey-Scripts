// ==UserScript==
// @name         LiteDownloader
// @version      0.4.3
// @date         2017-04-29
// @description  VK Music Downloader
// @author       GoodMorning
// @icon         http://i.imgur.com/38d31uh.png
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @run-at       document-end
// @connect *
// @match http*://vk.com/*
// @downloadURL https://pastebin.com/raw/pGBG9MuY
// @updateURL https://pastebin.com/raw/spjmeCgx
// @noframes
// ==/UserScript==
/* jshint -W097 */
/* jshint esnext: true */
'use strict';

/* ---------------------- Настройки ---------------------- */


//var options = {
    // --== Настроек больше нет. Возможно, снова появятся в будущем ==--
    //
    // lang:				'auto',					/* [ru/en/auto] */
    // instantInfo:			0,						/* [1/0] */
    // instantInfoFormat:	'%s&nbsp;&nbsp;%b🎵'	/* %s – размер, %b – битрейт */
//};
//var console = console, GM_xmlhttpRequest = GM_xmlhttpRequest, GM_addStyle = GM_addStyle;

/* ------------------------------------------------------------------------- Общие функции ------------------------------------------------------------------------- */

/* observeElements v1.0.1 (LiteDownloader tag) */
function observeElements(){var b,a="LiteDownloader";a+="-"+Math.round(1e3*performance.now()),b=arguments[0]instanceof Array?arguments:[arguments[0],arguments[1]];for(var c=new MutationObserver(function(c){
c.forEach(function(c){try{if(c.addedNodes.length)for(var d=0;d<c.addedNodes.length;d++)for(var e=c.addedNodes[d],f=0;f<b.length;f++)if(e.classList&&e.matches(b[f][0])&&!e[a])b[f][1](e),e[a]=!0;else if(
e.querySelectorAll&&e.querySelectorAll(b[f][0]).length)for(var g=e.querySelectorAll(b[f][0]),h=0;h<g.length;h++)g[h]&&!g[h][a]&&(b[f][1](g[h]),g[h][a]=!0)}catch(a){
console.group("observeElements error:"),console.error(a.message),"undefined"!=typeof d&&b[d]&&console.warn("Tag:",b[d][0]),console.log(c),console.groupEnd("observeElements error:")}})}),d=0;d<b.length;d++){
var e=document.querySelectorAll(b[d][0]);if(e.length)for(var f=0;f<e.length;f++)e[f][a]||(b[d][1](e[f]),e[f][a]=!0)}return c.observe(document.body,{childList:!0,subtree:!0}),c}

/* newEl v1.1 */
function newEl(a,b){var c=document.createElement(a),d=arguments[2]||c;return b?(Object.getOwnPropertyNames(b).forEach(function(a,e){var f=!!Object.getOwnPropertyDescriptor(b,a)&&Object.getOwnPropertyDescriptor(b,a).value;if("$"==a[0])switch(
a.slice(1)){case"content":c.innerHTML=f;break;case"children":for(e=0;e<f.length;e+=2){var g=newEl(f[e],f[e+1],d);f[e+1].$id&&(d[f[e+1].$id]=g),c.appendChild(g)}}else"_"==a[0]?c[a.slice(1)]=f:c.setAttribute(a.replace(/([A-Z])/g,"-$1").toLowerCase(),f)}),c):c}

/* ------------------------------------------------------------------------- // ------------------------------------------------------------------------- */

GM_addStyle(`
/* -- Собственно, кнопка -- */
.audio_row .audio_acts #download {
    display: block;
    background-repeat: no-repeat;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cg%20style%3D%22fill%3Anone%3B%22%3E%3Cpath%20d%3D%22M2%2C0h20c1.1%2C0%2C2%2C0.9%2C2%2C2v20c0%2C1.1-0.9%2C2-2%2C2H2c-1.1%2C0-2-0.9-2-2V2C0%2C0.9%2C0.9%2C0%2C2%2C0z%22%2F%3E%3Cpath%20d%3D%22M14%2C10h-4V5h4V10z%20M18%2C17H6v2h12V17z%20M17%2C10H7l5%2C6.3L17%2C10z%22%20fill%3D%22%23828A99%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E")
}

/* -- Крестик при скачивании -- */
.audio_is_downloading .download_panel,
.abort_btn {
  display: block !important;
}
.abort_btn {
  float: right !important;
}
.audio_is_downloading > div:not(.download_panel) {
  display: none !important;
}




/* -- Кнопка (что-то старое) -- */
/*
.audio_row:hover .audio_duration_wrap:not(.audio_is_downloading) .audio_acts,
.audio_row.inlined.audio_row_current:hover .audio_duration {
  display: inline !important;
}
.choose_audio_rows .audio_row:hover .audio_duration,
#profile_audios .audio_row:hover .audio_duration {
  display: none !important;
}
.audio_row:hover .audio_acts {
  float: right;
}
.audio_row.inlined.audio_row_current:hover .audio_acts #download {
  margin: 0 1px 0 6px;
}
.audio_row.audio_row_current.canadd:hover .audio_acts #download {
  margin-left: 12px;
}
*/

/* -- Мгновенная инфа (тоже что-то старое) -- */
/*
.audio_duration,
.audio_litedownloader_info {
  display: inline-block;
}
.audio_row:hover .audio_litedownloader_info {
  display: none;
}
.audio_litedownloader_info {
  transform: translateY(-1px);
  font-size: 0.75em;
}
*/
`);

/* ------------------------------------------------------------------------- */

function formatBytes(bytes, returnArrayOfNumberAndSize, customSizes) {
    if (parseInt(bytes) === 0) return '0 B';
    var sizes = customSizes || ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var k = 1024;
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    var s = (bytes / Math.pow(k, i)).toString();
    s = s.slice(0, (s[3] == '.') ? 3 : 4);
    return returnArrayOfNumberAndSize ? [s, sizes[i]] : s+' '+sizes[i];
}

var liteDownloader = {
    appendDownloadButton: (el) => {
      let shift = el.closest('._im_mess_stack') ? '[7, 10, 0]' : '[7, 4, 0]', // Реализация самого вк, он в личных сообщениях сдвигает тултип выше такой проверкой
          buttonEl = newEl('div', {
            class: 'audio_act',
            id: 'download',
           // onmouseover: `showTooltip(this, {text: \"<span id='tooltip_${el.dataset.fullId}'>${loc.tooltip}</span>\", black: 1, shift: ${shift}, needLeft: true})`,
            onmouseover: `showTooltip(this, {text: \"${loc.tooltip}\", black: 1, shift: ${shift}, needLeft: true})`
          });
      buttonEl.addEventListener('click', ev => { liteDownloader.getUrl(el); });
      // buttonEl.addEventListener('contextmenu', ev => { ev.preventDefault(); liteDownloader.showAudioInfo(el); });
      el.querySelector('.audio_acts').appendChild(buttonEl);

      /*
        if (options.instantInfo && !parentEl.matches('#profile .audio_row'))
            liteDownloader.getSongData(parentEl, (data) => {
                var instantInfoEl = newEl('div', {
                    class: 'audio_litedownloader_info',
                    $content: options.instantInfoFormat.replace('%s', data.size).replace('%b', data.bitrate)
                });
                el.querySelector('.audio_duration_wrap').insertAdjacentElement('afterBegin', instantInfoEl);
            });
        */
    },
    getUrl: (el, returnUrlOnly) => {
        var infourl = `https://vk.com/al_audio.php?act=reload_audio&al=1&ids=${el.dataset.fullId}`;

        var oReq = new XMLHttpRequest();
        oReq.open('GET', infourl, true);
        oReq.onload = () => {
            var arr = JSON.parse(oReq.response.match(/\[\[.*?\]\]/)[0])[0];
            liteDownloader.download(el, {
                url: liteDownloader.magic(arr[2]),
                title: arr[3],
                artist: arr[4]
            });
        };
        oReq.onerror = (e) => console.error(':(', e);
        oReq.send();
    },
    magic: (url) => {
        /* https://toster.ru/q/398540 */
        /* Взято из файла audioplayer.js */

        function e(a){if(~a.indexOf("audio_api_unavailable")){var b=a.split("?extra=")[1].split("#"),c=o(b[1]);if(b=o(b[0]),!c||!b)return a;c=c.split(String.fromCharCode(9));for(var d,e,f=c.length;f--;){
        if(e=c[f].split(String.fromCharCode(11)),d=e.splice(0,1,b)[0],!s[d])return a;b=s[d].apply(null,e)}if(b&&"http"===b.substr(0,4))return b}return a}function o(b){if(!b||b.length%4==1)return!1;
        for(var c,d,e=0,f=0,g="";d=b.charAt(f++);)d=a.indexOf(d),~d&&(c=e%4?64*c+d:d,e++%4)&&(g+=String.fromCharCode(255&c>>(-2*e&6)));return g}var a="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=",
        s={v:function(a){return a.split("").reverse().join("")},r:function(b,c){b=b.split("");for(var d,e=a+a,f=b.length;f--;)d=e.indexOf(b[f]),~d&&(b[f]=e.substr(d-c,1));return b.join("")},x:function(a,b){
        var c=[];return b=b.charCodeAt(0),a.split("").forEach(function(a){c.push(String.fromCharCode(a.charCodeAt(0)^b))}),c.join("")}};

        return e(url);
    },
    download: (el, data) => {
      el = el.querySelector('.audio_row_inner');

      var oReq = new XMLHttpRequest();
      oReq.open('GET', data.url, true);
      oReq.responseType = 'blob';
      oReq.onprogress = (ev) => liteDownloader.onProgress(el, ev);
      oReq.onload = () => liteDownloader.onLoad(oReq, el, data);
      oReq.onerror =  function () {
        var gmReq = GM_xmlhttpRequest({
          method: 'GET',
          responseType: 'blob',
          url: data.url,
          onprogress: oReq.onprogress,
          onload: (r) => liteDownloader.onLoad(r, el, data),
          onerror: (e) => console.error(':(', e)
        });
        panelEl.abortBtn.addEventListener('click', function(ev) { liteDownloader.onAbort(el, gmReq, true); });
      };

      var panelEl = liteDownloader.attachPanel(el);
      panelEl.abortBtn.addEventListener('click', function(ev) { ev.stopPropagation(); liteDownloader.onAbort(el, oReq); });
      el.style.backgroundImage = `linear-gradient(to right, #FFF 0, rgba(79, 210, 77, 0.1) 0)`;

      oReq.send();
    },
    onProgress: (el, ev) => {
        el.style.backgroundImage = `linear-gradient(to right, rgba(79, 210, 77, 0.75) ${ev.loaded / ev.total * 100}%, rgba(79, 210, 77, 0.1) 0)`;
    },
    onAbort: (el, oReq, abortOnly) => {
        oReq.abort();
        if (abortOnly) return;
        liteDownloader.fadeProgressBar(el, true);
        liteDownloader.attachPanel(el, true);
    },
    onLoad: (r, el, data) => {
      let file = new Blob([r.response], { type : 'application/octet-stream' }),
          name = newEl('span', {$content: `${data.artist.trim()} – ${data.title.trim()}.mp3`});
      let a = newEl('a', {
        href: window.URL.createObjectURL(file),
        download: name.textContent,
      });
      a.click();
      liteDownloader.fadeProgressBar(el);
      liteDownloader.attachPanel(el, true);
      let hiTechKostyl = el.closest('body').liteDownloaderOnDownloadCallback;
      if (hiTechKostyl) hiTechKostyl(data, el);
    },
    attachPanel: (el, removeInfo) => {
        var baseEl = el.querySelector('.audio_duration_wrap'),
            baseClass = 'audio_is_downloading';
        if (removeInfo) {
            baseEl.classList.remove(baseClass);
            baseEl.querySelector('.download_panel').remove();
            return;
        }
        var panelEl = newEl('div', {
            class: 'download_panel audio_acts',
            $children: [
                'div', {
                    $id: 'abortBtn',
                    class: 'audio_act _audio_act_delete abort_btn',
                    id: 'delete'
                }
            ]
        });
        baseEl.classList.add(baseClass);
        baseEl.appendChild(panelEl);
        return panelEl;
    },
    fadeProgressBar: (el, error) => {
        var color = error ? '212, 90, 90' : '79, 210, 77';
        var timer = {
            startTime: performance.now(),
            duration: 500,
            procedure: setInterval(() => {
                let timePassed = performance.now() - timer.startTime;

                if (timePassed >= timer.duration) {
                    clearInterval(timer.procedure);
                    timer.draw(1);
                    return;
                }

                timer.draw(timePassed / timer.duration, data);

            }, 20),
            draw: (progress) => {
                el.style.backgroundImage = (progress == 1) ? '' : `linear-gradient(to right, rgba(${color}, ${(1-progress)*0.75}) 100%, #FFF 0)`;
            }
        };
    },
    /*
    getSongData: (el, callback) => {
        GM_xmlhttpRequest({
            method: 'HEAD',
            timeout: 3000,
            url: liteDownloader.getUrl(el, true),
            onload: response => {
                let rawSize = response.responseHeaders.match( /content-length: (\d*)/i )[1],
                    songDuration = el.dataset.duration,
                    songSize = formatBytes(rawSize, false, loc.sizes),
                    songBitrate = Math.ceil(rawSize/1024/songDuration) * 8,
                    rawSongBitrate = ((rawSize/1024/songDuration) * 8).toFixed(1);
                songBitrate = songBitrate > 320 ? 320 : songBitrate;

                el.dataset.rawBitrate = rawSongBitrate;
                el.dataset.rawSize = rawSize;
                el.dataset.bitrate = songBitrate;
                el.dataset.size = songSize;
                el.dataset.hasInfo = true;

                if (callback) callback({
                    rawBitrate: rawSongBitrate,
                    rawSize: rawSize,
                    bitrate: songBitrate,
                    size: songSize
                });
            }
        });
    },
    showAudioInfo: (el) => {
        if (el.dataset.hasExtendedTooltip) return;

        var tooltipEl = document.getElementById('tooltip_'+el.dataset.fullId);

        var updateTooltip = (content) => {
            let before = [tooltipEl.offsetWidth, tooltipEl.offsetHeight];
            tooltipEl.innerHTML = content;
            let after = [tooltipEl.offsetWidth, tooltipEl.offsetHeight];

            let tooltipStyle = tooltipEl.closest('.tt_w').style,
                origLeft = tooltipStyle.left.slice(0, -2),
                origTop = tooltipStyle.top.slice(0, -2);
            tooltipStyle.left = origLeft-(after[0]-before[0])+'px';
            tooltipStyle.top = origTop-(after[1]-before[1])+'px';
        };

        var showSongInfo = data => {
            data = data || {
                rawBitrate: el.dataset.rawBitrate,
                bitrate: el.dataset.bitrate,
                size: el.dataset.size
            };
            updateTooltip(`${loc.size}: ${data.size}<br>${loc.bitrate}: ${data.bitrate} kbps<br>Raw bitrate: ${data.rawBitrate} kbps`);
        };

        if (el.dataset.hasInfo) {
            showSongInfo();
        } else {
            updateTooltip('.........');
            liteDownloader.getSongData(el, () => { showSongInfo(); });
        }

        el.dataset.hasExtendedTooltip = true;
    }
    */
};

/* ------------------------------------------------------------------------- */

/*
var loc, lang;
if (options.lang == 'auto') lang = (cur.lang.global_delete == 'Удалить') ? 'ru' : 'en';
*/
var loc, lang = (cur.lang.global_delete == 'Удалить') ? 'ru' : 'en';

switch (lang) {
    case 'ru':
        loc = {
            sizes: ['байт', 'КБ', 'МБ'],
            tooltip: 'Скачать аудиозапись',
            bitrate: 'Битрейт',
            size: 'Размер'
        };
        break;
    default:
        loc = {
            sizes: ['B', 'KB', 'MB'],
            tooltip: 'Download song',
            bitrate: 'Bitrate',
            size: 'Size'
        };
}

observeElements(['.audio_row', liteDownloader.appendDownloadButton]);
