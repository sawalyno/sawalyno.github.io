# sawalyno-corp

Sawalyno のコーポレートサイト。[sawalyno.jp](https://sawalyno.jp/) で公開予定。

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript（静的）
- GitHub Pages でホスティング（main ブランチ）

## ローカル確認

```bash
npx serve .
# → http://localhost:3000

# npm 非導入環境（Python 3）
python -m http.server 8000
# → http://localhost:8000
```

## デプロイ

main ブランチへ push すると GitHub Pages が自動デプロイ。

## 公開前に必要なアセット生成（v1 必須）

以下の画像ファイルは未生成のため、公開前に手動で作成して `assets/img/` に配置すること：

| ファイル | 用途 | 推奨サイズ |
|---|---|---|
| `ogp.png` | OGP / Twitter Card サムネイル | 1200×630px |
| `apple-touch-icon.png` | iOS ホーム画面アイコン | 180×180px |
| `badge-appstore.svg` | App Store ダウンロードバッジ | Apple 公式素材を使用 |
| `badge-googleplay.svg` | Google Play ダウンロードバッジ | Google 公式素材を使用 |

また、Google Fonts が返す CSS（`https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap`）を開いて JetBrains Mono Regular の woff2 URL を取得し、`index.html` の TODO コメント箇所（`<head>` 内）に `<link rel="preload" as="font" type="font/woff2" crossorigin href="取得したURL">` を追加すること。

## 更新フロー

1. HTML/CSS/JS 編集 → commit → push
2. アプリ追加時：Apps セクションにカード追記 + アイコン SVG 追加
3. 本文に新しい日本語を追加した場合：`index.html` 冒頭コメントの「サブセット対象文字一覧」と `<link>` の `&text=` パラメータを手動同期（忘れると `□` 表示になる）
4. コンテンツ更新時は `sitemap.xml` の `<lastmod>` を更新日に合わせること
