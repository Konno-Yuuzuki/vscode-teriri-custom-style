/**
 * 编辑器右键菜单磨玻璃效果
 */

;(function () {
    'use strict'

    function waitForElement(el, fn) {
        const timer = setInterval(() => {
            const elRef = document.querySelector(el)
            if (elRef) {
                fn(elRef)
                clearInterval(timer)
            }
        }, 10)
    }

    function addCustomContextMenuStyle(shadowRootEl) {
        const shadowRoot = shadowRootEl.shadowRoot

        const style = document.createElement('style')
        style.textContent = `
        .context-view.monaco-menu-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: block;
            background-color: transparent !important;
            backdrop-filter: blur(20px) brightness(120%);
            z-index: -1;
        }
        .monaco-scrollable-element {
            background-color: transparent !important;
        }


        li.action-item.disabled {
            display: none !important;
        }

        `
        shadowRoot.appendChild(style)
    }
    waitForElement('.shadow-root-host', addCustomContextMenuStyle)
})()
