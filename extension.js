const vscode = require("vscode");
const fs = require("fs");

let jsonData = {};
let keys = [];
let currentIndex = 0;
let displayItem;
let prevButton;
let nextButton;
let positionIndicator;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log("wordplug is now active!");

    // 命令：加载 JSON 文件
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

    prevButton = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        102
    );
    prevButton.text = "⬅️";
    prevButton.command = "wordplug.prev";
    prevButton.tooltip = "上一项";
    prevButton.show();
    context.subscriptions.push(prevButton);

    positionIndicator = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        101.5
    );
    context.subscriptions.push(positionIndicator);
    positionIndicator.show();

    nextButton = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        101
    );

    nextButton.text = "➡️";
    nextButton.command = "wordplug.next";
    nextButton.tooltip = "下一项";
    nextButton.show();
    context.subscriptions.push(nextButton);

    // 状态栏展示项
    displayItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );
    context.subscriptions.push(displayItem);

    // 上一项
    const prevCommand = vscode.commands.registerCommand("wordplug.prev", () => {
        if (!keys.length) return;
        currentIndex = (currentIndex - 1 + keys.length) % keys.length;
        updateDisplay();
    });
    context.subscriptions.push(prevCommand);

    // 下一项
    const nextCommand = vscode.commands.registerCommand("wordplug.next", () => {
        if (!keys.length) return;
        currentIndex = (currentIndex + 1) % keys.length;
        updateDisplay();
    });
    context.subscriptions.push(nextCommand);

    function updateDisplay() {
        if (!keys.length) {
            displayItem.text = "📘 请先选择 JSON 文件";
            positionIndicator.text = "";
        } else {
            const key = keys[currentIndex];
            displayItem.text = `📘 ${key}: ${jsonData[key]}`;
            positionIndicator.text = `${currentIndex + 1}/${keys.length}`;
        }

        displayItem.show();
        positionIndicator.show();
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
