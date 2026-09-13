# EzDeck

EzDeck 是一个本地快捷方式面板，可从 Android、平板或浏览器控制 Windows 电脑。它是受 [Dokke](https://github.com/felipenalves/Dokke) 启发的独立 Windows/Android 适配项目，并保留原 MIT 许可与致谢。

![EzDeck 标志](public/ezdeck-logo.png)

## 包含内容

- 原生 Windows 主机，带系统托盘图标、PIN、可配置端口、随 Windows 启动和桌面快捷方式。
- Android APK 与浏览器 PWA，支持局域网发现、PIN 配对和 WebSocket 更新。
- 应用、网站和键盘快捷键按钮；自定义图标、多页面、拖放排序以及浅色/深色主题。
- 支持 11 种界面语言。在 Windows 主机选择的语言会同步到 Android 和浏览器。

## 安装

从官方 Release 下载 `EzDeck-Setup.exe`，运行后使用桌面快捷方式。Android/PWA 伴侣通过 PIN、WebSocket 和局域网发现连接。

请参阅[使用手册](MANUAL_DE_USO.md)和[思维导图](MAPA_MENTAL.md)，不要将本地端口暴露到互联网。

## 文档与开发

[使用手册](MANUAL_DE_USO.md)介绍安装、配对和故障排除；[思维导图](MAPA_MENTAL.md)概述主机、客户端与局域网。开发需要 Windows 10/11 和 Node.js 20+：`git clone https://github.com/eddesignerez/EzDeck.git`、`npm ci`、`.\windows\run-dev.ps1`。

## 完整使用方法

1. 从[官方 Releases](https://github.com/eddesignerez/EzDeck/releases)下载并安装 `EzDeck-Setup.exe`，再从桌面打开 **EzDeck**。安装包已包含运行环境，普通用户无需安装 Node.js。
2. 若 Windows 防火墙询问，请仅允许在**专用网络**中访问。关闭窗口会将主机送入通知区域；使用**关闭 EzDeck**可完全停止服务。
3. 将电脑和手机/平板连接到同一 Wi‑Fi。在 Windows 窗口中查看 **访问** 后的地址和四位 PIN。APK 会自动寻找主机；失败时手动填写 IP 与端口。
4. 也可在 Chrome、Safari、Edge 中打开同一地址并添加到主屏幕；这是 iPhone/iPad 的推荐方式。

## 创建和同步面板

- 将应用拖到空位置，拖动卡片排序，使用 **X** 删除卡片。
- 使用 `+ 页面` 新增页面，使用 `− 页面` 删除最后一个空页面。
- 键盘按钮可创建 `Ctrl+C` 等命令；`+` 可添加 `.exe`、`.lnk`、`.bat` 或 `.cmd`。
- 点击卡片选择自定义图标，按**保存**将更改发送到 Android/PWA。

键盘命令会发送到当前活动的 Windows 窗口。以管理员身份运行的程序可能会阻止自动化。

## 设置、安全与兼容性

- **PIN** 设置密码，**AUTO** 生成新密码，**端口**在 EzDeck 重启后生效。
- 可启用**随 Windows 启动**、使用太阳/月亮切换主题；语言只在 Windows 主机选择，Android/PWA 会同步。
- 请勿分享 PIN 或将端口暴露到互联网。自动发现失败时使用主机显示的 IP 和端口。
- 支持 Windows 10/11、Android 5.0 及以上，以及同一网络中的现代浏览器。

开发需要 Windows 10/11 与 Node.js 20+：`git clone https://github.com/eddesignerez/EzDeck.git`、`npm ci`、`.\windows\run-dev.ps1`。

## 致谢

EzDeck 是受 Felipe Alves 的 [Dokke](https://github.com/felipenalves/Dokke) 启发的独立 Windows/Android 适配项目，使用 MIT 许可证。原始许可证和致谢保留在 [LICENSE](LICENSE)。macOS 用户请下载原始 Dokke 项目。
