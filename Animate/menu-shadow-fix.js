// Shadow DOM 内部注入的样式（仅作用于菜单内部元素）




// ============== 核心注入函数 ==============
(() => {
    "use strict"

    // ========== Shadow 内部自定义样式 ==========
    const MENU_INNER_STYLES = `
/* 滚动容器：完全透明，透出外层毛玻璃 */
.monaco-menu-container {
    --vscode-menu-background: transparent !important;
    &::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        inset: 0;
        display: block;
        z-index: -1;
        background-color: transparent;
        backdrop-filter: blur(6px) brightness(120%) !important;
    }

    &>.monaco-scrollable-element {
        overflow: visible !important;
    }


    .monaco-action-bar .action-item {
        & span.keybinding {
            padding: 0 2em 0 0;
        }

        & span.action-label::after {
        content: "👈";
        margin-left: 1em;
        visibility: hidden;
        display: inline-block;
    }

        &.focused>.action-menu-item>span.action-label::after {
            visibility: visible;
        }
    }
}
`

    // ========== 核心注入函数 ==========
    function injectStyleToShadow(hostElement) {
        try {
            const shadowRoot = hostElement.shadowRoot
            if (!shadowRoot) return false

            if (shadowRoot.querySelector('#custom-menu-inner-style')) return true

            const styleEl = document.createElement('style')
            styleEl.id = 'custom-menu-inner-style'
            styleEl.textContent = MENU_INNER_STYLES
            shadowRoot.appendChild(styleEl)
            return true
        } catch (err) {
            console.error('注入失败：', err)
            return false
        }
    }

    // ========== 全量扫描所有菜单并注入 ==========
    function scanAllMenus() {
        const hosts = document.querySelectorAll('.shadow-root-host')        hosts.forEach((host) => {
            if (injectStyleToShadow(host)) return
            // 三级重试，覆盖所有异步挂载时机
            queueMicrotask(() => injectStyleToShadow(host))
            setTimeout(() => injectStyleToShadow(host), 50)
            setTimeout(() => injectStyleToShadow(host), 200)
        })
    }

    // ========== 初始化监听 ==========
    function initObserver() {
        // 初始化先扫一次
        scanAllMenus()

        // 1. 全局 DOM 监听（rAF 防抖：合并同一帧内的多次变化，避免风暴式全量扫描）
        let scanQueued = false
        function scheduleScan() {
            if (scanQueued) return
            scanQueued = true
            requestAnimationFrame(() => {
                scanQueued = false
                scanAllMenus()
            })
        }
        const globalObserver = new MutationObserver(scheduleScan)

        globalObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'] // 只监听影响菜单显隐的属性，降低性能开销
        })

        // 2. 右键事件监听：使用捕获阶段，在事件被 Monaco 拦截前触发
        document.addEventListener('contextmenu', () => {
            scheduleScan()
        }, true) // 关键：第三个参数 true = 捕获阶段触发

        // 3. 兜底：专门监听所有上下文菜单容器的显隐变化
        document.querySelectorAll('.context-view').forEach((view) => {
            globalObserver.observe(view, {
                attributes: true,
                attributeFilter: ['style']
            })
        })

    }

    // 直接执行初始化
    try {
        initObserver()
    } catch (err) {
        console.error('初始化失败：', err)
    }

})()
