# EzDeck

Android、タブレット、またはブラウザーからWindowsパソコンを操作するローカルショートカットパネルです。[Dokke](https://github.com/felipenalves/Dokke) に着想を得た独立したWindows/Android向け適応版で、MITライセンスと原作者のクレジットを維持しています。

![EzDeck ロゴ](public/ezdeck-logo.png)

## 含まれる機能

- トレイアイコン、PIN、変更可能なポート、Windows起動、デスクトップショートカットを備えたネイティブWindowsホスト。
- ローカルネットワーク探索、PINペアリング、WebSocket更新に対応したAndroid APKとブラウザーPWA。
- アプリ、Webサイト、キーボードショートカット用のボタン、カスタムアイコン、複数ページ、ドラッグ&ドロップ、ライト/ダークテーマ。
- 11言語に対応。Windowsホストで選んだ言語がAndroidとブラウザーにも反映されます。

## インストール

公式リリースから `EzDeck-Setup.exe` をダウンロードして実行し、デスクトップのショートカットを開きます。Android/PWA companionはPIN、WebSocket、ローカルネットワーク検出で接続します。

[使い方](MANUAL_DE_USO.md) と [マインドマップ](MAPA_MENTAL.md) も参照してください。ローカルポートをインターネットに公開しないでください。

## ドキュメントと開発

[使い方](MANUAL_DE_USO.md) ではインストール、ペアリング、トラブルシューティングを、[マインドマップ](MAPA_MENTAL.md) ではホスト、クライアント、ローカルネットワークを説明しています。開発にはWindows 10/11とNode.js 20以上が必要です: `git clone https://github.com/eddesignerez/EzDeck.git`、`npm ci`、`.\windows\run-dev.ps1`。

## 完全な使い方

1. [公式 Releases](https://github.com/eddesignerez/EzDeck/releases) から `EzDeck-Setup.exe` をダウンロードしてインストールし、デスクトップの **EzDeck** を開きます。必要なランタイムが含まれるため、利用者は Node.js を入れる必要がありません。
2. Windows Firewall が表示された場合は **プライベート ネットワーク** だけで許可してください。ウィンドウを閉じるとホストは通知領域に入り、**EzDeck を終了** で完全に停止します。
3. PC とスマートフォン／タブレットを同じ Wi‑Fi に接続します。Windows の **アクセス** に表示されるアドレスと4桁の PIN を使います。APK はホストを自動検出し、失敗時は IP とポートを手入力します。
4. 同じアドレスを Chrome、Safari、Edge で開き、ホーム画面に追加することもできます。iPhone/iPad ではこの方法が推奨されます。

## パネル作成と同期

- ライブラリのアプリを空の場所へドラッグし、カードをドラッグして並べ替え、**X** で削除します。
- `+ ページ` でページを追加し、`− ページ` で最後の空ページを削除します。
- キーボードのボタンで `Ctrl+C` などのコマンドを作成し、`+` で `.exe`、`.lnk`、`.bat`、`.cmd` を追加します。
- カードをクリックして独自アイコンを選び、**保存** を押して Android/PWA へ変更を送信します。

キーボードコマンドはアクティブな Windows ウィンドウに送られます。管理者として起動したアプリは自動操作をブロックする場合があります。

## 設定・安全性・互換性

- **PIN** でコードを設定し、**AUTO** で新しいコードを作成、**ポート** は再起動後に変更されます。
- **Windows と共に開始**、太陽／月によるテーマ変更、言語選択は Windows ホストで行い、Android/PWA に反映されます。
- PIN を共有せず、ポートをインターネットに公開しないでください。検出に失敗した場合はホスト表示の IP とポートを使います。
- Windows 10/11、Android 5.0 以降、同じネットワーク上の最新ブラウザーに対応します。

開発には Windows 10/11 と Node.js 20 以降が必要です。`git clone https://github.com/eddesignerez/EzDeck.git`、`npm ci`、`.\windows\run-dev.ps1` を実行します。

## クレジット

EzDeck は Felipe Alves による [Dokke](https://github.com/felipenalves/Dokke) に着想を得た独立した Windows/Android 適応版で、MIT ライセンスです。元のライセンスとクレジットは [LICENSE](LICENSE) に保持されます。macOS 向けにはオリジナル Dokke を利用してください。
