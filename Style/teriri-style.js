window.onload = () => {
    const editorContainer = document.querySelector('.editor-container')
    console.log('editorContainer', editorContainer)
    const contextMenuListener = editorContainer.addEventListener(
        'contextmenu',
        function (event) {
            console.log('contextMenuListener')
            const el = document.querySelector('.shadow-root-host')
            const shadowRoot = el.shadowRoot

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
    `
            shadowRoot.appendChild(style)
            removeEventListener('contextmenu', contextMenuListener)
        },
    )
}
