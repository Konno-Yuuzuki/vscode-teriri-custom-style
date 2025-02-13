const el = document.querySelector('.shadow-root-host')
const shadowRoot = el.shadowRoot

const style = document.createElement('style')
style.textContent = `
    .monaco-scrollable-element {
        background-color: transparent !important;
        backdrop-filter: blur(20px) brightness(120%);
    }
`
shadowRoot.appendChild(style)
