# sawalyno-corp

Sawalyno のコーポレートサイト。[sawalyno.jp](https://sawalyno.jp/) で公開予定。

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript（静的）
- GitHub Pages でホスティング（main ブランチ）

## ローカル確認

```bash
python tools/serve.py
# → http://localhost:8123/
# LAN 内の別の PC・スマホからは http://<この PC の IP>:8123/
```

## デプロイ

main ブランチへ push すると GitHub Pages が自動デプロイ。

## 公開前に必要なアセット生成（v1 必須）

以下の画像ファイルは未生成のため、公開前に手動で作成して `assets/img/` に配置すること：

| ファイル | 用途 | 推奨サイズ |
|---|---|---|
| `ogp.png` | OGP / Twitter Card サムネイル | 1200×630px |
| `apple-touch-icon.png` | iOS ホーム画面アイコン | 180×180px |

配置済みの公式バッジ（2026-11-11 取得・日本語版。色や形は加工しない）:

| ファイル | 取得元 |
|---|---|
| `badge-appstore.svg` | Apple 公式（tools.applemediaservices.com の black / ja-jp） |
| `badge-googleplay.png` | Google 公式（play.google.com の `ja_badge_web_generic.png`。上下の透明余白だけ切り落とし） |

また、Google Fonts が返す CSS（`https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap`）を開いて JetBrains Mono Regular の woff2 URL を取得し、`index.html` の TODO コメント箇所（`<head>` 内）に `<link rel="preload" as="font" type="font/woff2" crossorigin href="取得したURL">` を追加すること。

## 画面のしくみ（sawalyno OS・2026-11 リデザイン）

同じ HTML を 2 通りに見せている。

| 条件 | 見え方 |
|---|---|
| 幅 900px 以上・高さ 480px 以上・マウス操作 | デスクトップ。ウィンドウをドラッグ・最小化・最大化・閉じる。タスクバーにタブ |
| それ以外（スマホ・タブレット・JS 無効） | ウィンドウを縦に積んだ 1 列。start メニューが目次 |

- `assets/js/pre.js` — 描画前にモード（`js` / `os` / `booting`）を `<html>` に付ける
- `assets/js/main.js` — ウィンドウ操作・ターミナル・アプリ一覧・起動シーケンス。ライブラリなし
- `data/apps.json` — 載せるアプリの一覧（正本）。`tools/build.py` が `index.html` に反映する。公開されるのは生成済みの静的 HTML なので、GitHub Pages 側でのビルドは不要
- 起動シーケンスはページを開くたびに出る（約 2 秒・キーかタップでスキップ。保存した状態には依存しない）。OS の「アニメーション効果」をオフにしている端末（`prefers-reduced-motion`）では出さない
- CSP で inline の `style` 属性と inline `<script>` は使えない。位置は JS から `element.style` で入れる
- デザイン案（Claude Design）: https://claude.ai/artifact/AyTxnMA2Ncejc1LC8TUFAc

## 更新フロー

どの変更でも、最後に `python tools/build.py` を実行してから commit → push する。

```bash
python tools/build.py
```

このコマンドが、アプリ一覧の HTML・アプリ件数・アイコン・日本語フォントのサブセット・CSS/JS のキャッシュ対策（`?v=`）・`sitemap.xml` の日付をまとめて更新する。反映漏れがないかだけ調べるときは `python tools/build.py --check`（ずれがあれば終了コード 1）。

### アプリを追加する

1. `data/apps.json` の `apps` に 1 件足す（並び順が表示順）

   ```json
   {
     "id": "aha",
     "name": "アハ体験 変化はっけん",
     "genre": "脳トレ",
     "desc": "1〜2 文の説明。",
     "tagline": "サポート系ページのヘッダーに出すひとこと",
     "color": "#F2C94C",
     "terms": false,
     "icon_source": "apps/aha/icon.png",
     "google_play": "jp.sawalyno.aha",
     "app_store_id": null
   }
   ```

   | 項目 | 内容 |
   |---|---|
   | `id` | 英小文字・数字・ハイフン。ターミナルの `open <id>` にも使われる |
   | `icon_source` | 元アイコン（1024px など）。このリポジトリのルートからの相対パス。192px の `assets/img/app-{id}.png` が自動で作られる（Pillow が必要） |
   | `google_play` | パッケージ名。未公開なら `null` →「Google Play 近日公開」 |
   | `app_store_id` | App Store の数字の ID。未公開なら `null` →「App Store 近日公開」 |

2. `python tools/build.py` を実行
3. ブラウザで確認 → commit → push

左の一覧・ターミナルの `apps` / `open`・起動画面の行は、ページ内のアプリ一覧から自動で増える。

### サポート・プライバシーポリシー・利用規約のページ

`apps/{id}/support/` の `index.html`（サポート）・`privacy.html`・`terms.html`。URL はアプリ内とストアの掲載情報から参照されているので変えない。

- **見た目は全ページ共通**: `assets/css/support.css` の 1 ファイル。アプリごとの違いは `data/apps.json` の `color`（帯の色）と `tagline`（ひとこと）だけ。文字色は色の明るさから自動で決まる
- **ヘッダー・ナビ・フッターは自動生成**: 各ページの `<main>` の外側は `tools/build.py` が作る。**手で直すのは `<main>` の中（本文）だけ**。本文は build で 1 文字も変わらない
- **新しいアプリのページを作る**: `data/apps.json` に 1 件足して `python tools/build.py`。無いページが `tools/templates/` のひな型から作られる（`terms.html` は `"terms": true` のアプリだけ）。ひな型の `【要記入…】` を本文に書き換える。残っている間は `--check` が終了コード 1 を返す
- **公開前のアプリ**: `"listed": false` を付けると、サポート系ページだけ作り、会社サイトのアプリ一覧には出さない。公開されたら `listed` を消す（または `true`）
- 本文（特に PP・利用規約）はストア審査の対象。文言を変えたら pm-spec-reviewer のレビューを通す

### ストアで公開されたとき

`data/apps.json` の `google_play` / `app_store_id` を `null` から実際の値に変えて `python tools/build.py`。「近日公開」が公式バッジのリンクに変わる。

### 手で直さないところ

- `index.html` の `<!-- apps:begin -->` 〜 `<!-- apps:end -->`（次の実行で上書きされる）
- `apps/{id}/support/*.html` の `<main>` の外側（head・ヘッダー・ナビ・フッター）
- `sitemap.xml`（全ページ分を作り直す。変わったページだけ日付が今日になる）
- `<link id="jp-font">` の `text=`、CSS/JS の `?v=`

アイコンを差し替えるときは `assets/img/app-{id}.png` を消してから実行する。
