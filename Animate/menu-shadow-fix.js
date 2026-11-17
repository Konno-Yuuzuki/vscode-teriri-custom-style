// Shadow DOM 内部注入的样式（仅作用于菜单内部元素）


// 向单个菜单容器注入样式
// function injectStyleToMenu(menuContainer) {
//   const shadowRoot = menuContainer.shadowRoot;
//   if (!shadowRoot) return; // 跳过非 Shadow DOM 的菜单
//   if (shadowRoot.querySelector('#custom-menu-inner-style')) return; // 防重复注入

//   const styleEl = document.createElement('style');
//   styleEl.id = 'custom-menu-inner-style';
//   styleEl.textContent = MENU_INNER_STYLES;
//   shadowRoot.appendChild(styleEl);
// }

// // 初始化：处理页面已存在的菜单
// document.querySelectorAll('.shadow-root-host').forEach(injectStyleToMenu);



// ============== 核心注入函数 ==============
(() => {
    "use strict"

    console.log('🚀 菜单样式注入脚本开始执行')

    // ========== Shadow 内部自定义样式 ==========
    const MENU_INNER_STYLES = `
/* 一级菜单容器：背景透明 + ::after 毛玻璃层。
   注意 1：Menu 构造器会给每一级容器（含子菜单容器）都加上 .monaco-menu-container，
   必须用 :not(.monaco-submenu) 排除子菜单，否则毛玻璃层会逐层重复生成。
   注意 2：这里直接覆盖元素背景而不是改写 --vscode-menu-background 变量——
   自定义属性会继承进子菜单，若设为 transparent，子菜单的兜底色将失效 */
.monaco-menu-container:not(.monaco-submenu) {
    background-color: transparent !important;
    &::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        inset: 0;
        display: block;
        z-index: -1;
        background-color: transparent;
        backdrop-filter: blur(10px) brightness(120%) !important;
    }

    &>.monaco-scrollable-element {
        overflow: visible !important;
        background-color: transparent !important;
    }

    /* 菜单内容层全部透明，毛玻璃统一由容器 ::after / 子菜单容器自身提供。
       后代选择器会穿透到子菜单内部，正好让子菜单的 .monaco-menu 也保持透明 */
    .monaco-menu {
        background-color: transparent !important;
    }
}

/* 二级（及更深）菜单：毛玻璃直接放在子菜单容器自身。
   子菜单嵌套在父菜单的 stacking context（position:fixed + z-index）内，
   再用 z-index:-1 的 ::after 嵌套 backdrop-filter 会采样不到背景（表现为纯透明），
   因此改为容器自身 backdrop-filter + 半透明兜底色，保证任何场景都可读 */
.monaco-submenu.menubar-menu-items-holder {
    background-color: color-mix(in srgb, var(--vscode-menu-background, #252526) 72%, transparent) !important;
    backdrop-filter: blur(10px) brightness(120%) !important;
    border-radius: 6px;

    &>.monaco-scrollable-element {
        background-color: transparent !important;
        overflow: visible !important;
    }
}

/* 菜单项装饰（对每一级菜单生效） */
.monaco-menu-container {
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
            console.log('✅ 成功注入样式到 Shadow Root')
            return true
        } catch (err) {
            console.error('注入失败：', err)
            return false
        }
    }

    // ========== 全量扫描所有菜单并注入 ==========
    function scanAllMenus() {
        const hosts = document.querySelectorAll('.shadow-root-host')
        console.debug(`扫描到 ${hosts.length} 个菜单 Shadow 宿主`)

        hosts.forEach((host) => {
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

        // 1. 全局 DOM 监听：同时监听节点增删 + 样式属性变化
        const globalObserver = new MutationObserver(() => {
            console.debug('DOM 变化触发，重新扫描菜单')
            scanAllMenus()
        })

        globalObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'] // 只监听影响菜单显隐的属性，降低性能开销
        })

        // 2. 右键事件监听：使用捕获阶段，在事件被 Monaco 拦截前触发
        document.addEventListener('contextmenu', () => {
            console.debug('捕获到右键事件，准备扫描菜单')
            setTimeout(scanAllMenus, 10)
            setTimeout(scanAllMenus, 100)
        }, true) // 关键：第三个参数 true = 捕获阶段触发

        // 3. 兜底：专门监听所有上下文菜单容器的显隐变化
        document.querySelectorAll('.context-view').forEach((view) => {
            globalObserver.observe(view, {
                attributes: true,
                attributeFilter: ['style']
            })
        })

        console.log('✅ 全部监听已启动，菜单样式注入就绪')
    }

    // 直接执行初始化
    try {
        initObserver()
    } catch (err) {
        console.error('初始化失败：', err)
    }

})()
