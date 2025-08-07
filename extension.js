const vscode = require("vscode");
const fs = require("fs");

let jsonData = {};
let keys = [];
let currentIndex = 0;
let displayItem;
let prevButton;
let nextButton;
let positionIndicator;
let modeToggleButton;

let isSpellingMode = false; // 🔄 模式状态

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log("wordplug is now active!");

    const loadCommand = vscode.commands.registerCommand(
        "wordplug.loadJson",
        async () => {
            const uri = await vscode.window.showOpenDialog({
                canSelectMany: false,
                openLabel: "word-plug-json",
                filters: {
                    JSON: ["json"],
                },
            });

            if (!uri || uri.length === 0) {
                vscode.window.showWarningMessage("未选择任何文件");
                return;
            }

            try {
                const content = fs.readFileSync(uri[0].fsPath, "utf8");
                jsonData = JSON.parse(content);
                keys = Object.keys(jsonData);
                currentIndex = 0;
                vscode.window.showInformationMessage(
                    `JSON 加载成功，共有 ${keys.length} 项`
                );
                updateDisplay();
            } catch (e) {
                vscode.window.showErrorMessage(
                    "读取或解析 JSON 失败: " + e.message
                );
            }
        }
    );

    context.subscriptions.push(loadCommand);

    // 上一项按钮
    prevButton = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        102
    );
    prevButton.text = "⬅️";
    prevButton.command = "wordplug.prev";
    prevButton.tooltip = "上一项";
    prevButton.show();
    context.subscriptions.push(prevButton);

    // 当前位置
    positionIndicator = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        101.5
    );
    context.subscriptions.push(positionIndicator);
    positionIndicator.show();

    // 下一项按钮
    nextButton = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        101
    );
    nextButton.text = "➡️";
    nextButton.command = "wordplug.next";
    nextButton.tooltip = "下一项";
    nextButton.show();
    context.subscriptions.push(nextButton);

    // 模式切换按钮
    modeToggleButton = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100.5
    );
    modeToggleButton.text = "👁️";
    modeToggleButton.command = "wordplug.toggleMode";
    modeToggleButton.tooltip = "点击切换拼写/查看模式";
    modeToggleButton.show();
    context.subscriptions.push(modeToggleButton);

    // 状态栏展示项
    displayItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );
    context.subscriptions.push(displayItem);

    const prevCommand = vscode.commands.registerCommand("wordplug.prev", () => {
        if (!keys.length) return;
        currentIndex = (currentIndex - 1 + keys.length) % keys.length;
        updateDisplay();
    });
    context.subscriptions.push(prevCommand);

    const nextCommand = vscode.commands.registerCommand("wordplug.next", () => {
        if (!keys.length) return;
        currentIndex = (currentIndex + 1) % keys.length;
        updateDisplay();
    });
    context.subscriptions.push(nextCommand);

    const toggleModeCommand = vscode.commands.registerCommand(
        "wordplug.toggleMode",
        () => {
            isSpellingMode = !isSpellingMode;
            modeToggleButton.text = isSpellingMode ? "✏️" : "👁️";
            updateDisplay();
        }
    );
    context.subscriptions.push(toggleModeCommand);

    async function updateDisplay() {
        if (!keys.length) {
            displayItem.text = "📘 请先选择 JSON 文件";
            positionIndicator.text = "";
            return;
        }

        const key = keys[currentIndex];
        const value = jsonData[key];

        if (isSpellingMode) {
            const input = await vscode.window.showInputBox({
                prompt: `翻译: ${value}\n请输入对应的文本：`,
                placeHolder: "请输入对应的英文单词",
                ignoreFocusOut: true,
            });

            if (input !== undefined) {
                if (input.trim().toLowerCase() === key.toLowerCase()) {
                    vscode.window.showInformationMessage("✅ 拼写正确！");
                } else {
                    vscode.window.showErrorMessage(
                        `❌ 拼写错误，正确答案是：${key}`
                    );
                }
            }

            displayItem.text = `✏️ 翻译: ${value}`;
        } else {
            displayItem.text = `📘 ${key}: ${value}`;
        }

        positionIndicator.text = `${currentIndex + 1}/${keys.length}`;
        displayItem.show();
        positionIndicator.show();
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
