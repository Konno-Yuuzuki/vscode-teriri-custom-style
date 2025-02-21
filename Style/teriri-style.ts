import * as vscode from 'vscode'

// 当vscode可见编辑区发生变化时执行一些操作
export function activate(context: vscode.ExtensionContext) {
    // 监听活动文本编辑器变化，例如从一个文件切换到另一个文件
    const activeEditorChange = vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            if (editor) {
                handleEditorChange(editor)
            }
        },
    )

    // 监听所有可见文本编辑器的变化
    const visibleEditorsChange = vscode.window.onDidChangeVisibleTextEditors(
        (editors) => {
            editors.forEach((editor) => {
                handleEditorChange(editor)
            })
        },
    )

    context.subscriptions.push(activeEditorChange, visibleEditorsChange)
}

function handleEditorChange(editor: vscode.TextEditor): void {
    // 示例操作：打印当前文件名和可见区域
    console.log(`Editor changed: ${editor.document.fileName}`)
    console.log(`Visible ranges: ${JSON.stringify(editor.visibleRanges)}`)

    // 在这里加入你需要执行的其他操作
}

// 可选：定义扩展被禁用时需要清理的内容
export function deactivate() {}
