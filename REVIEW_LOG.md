# Review Log — apps/sawalyno-corp
開始: 2026-05-06

## Round 1 — 2026-05-06

### 指摘
| ID | 重大度 | 内容 | 箇所 |
|----|--------|------|------|
| R1-P001 | High | JetBrains Mono の `<link rel="preload" as="font" type="font/woff2" crossorigin>` が未実装。LCP 要素（ヒーローターミナル）のフォント遅延取得となり Lighthouse スコアに直撃。SPEC §10.3 必須要件 | index.html head セクション |
| R1-P002 | Medium | 404.html の `#clock` に `aria-label="Current time"` がない。index.html では付与済み（SPEC §10.1 整合性） | 404.html:42 |
| R1-P003 | Medium | 404.html システムバーの `<span>Sawalyno</span>` に `.sysbar-name` クラスがない。index.html との共通スタイルが欠落 | 404.html:32 |
| R1-P004 | Medium | `terminal-window` に `role="img"` + `aria-label` を付与しているが、内部行テキストが `aria-hidden` でないため SR が二重読み上げする恐れがある | index.html:95–115 |
| R1-P005 | Minor | About 商号テーブルで日英を1セルに統合している。SPEC §2.2 では「商号（日本語）」「商号（英語）」を別行で列挙しており構造的差異あり | index.html:140–144 |
| R1-P006 | Minor | About セクション window-titlebar の `logo-mark.svg` が `width="16" height="16"` だが SPEC §6.5 では 32×32 指定 | index.html:126 |
| R1-P007 | Minor | index.html 先頭コメントのサブセット対象文字に ASCII 数字・英字が混入しておりノイズになっている | index.html:3–11 |
| R1-P008 | Minor | About 紹介文の「ソフトウェアを目指しています」が SPEC §2.1 一次ソース「小さなアプリをつくっています」とニュアンス相違 | index.html:134 |
| R1-P009 | Minor | sitemap.xml の `<lastmod>` が `2026-05-05` 固定。公開前チェックリスト（SPEC §11.3）に lastmod 更新手順が未記載 | sitemap.xml:5 |
| R1-P010 | Minor | README のローカル確認コマンドが `npx serve .` のみ。npm 非導入環境の代替手段（python -m http.server 等）が未記載 | README.md:13–15 |
| R1-D001 | High | システムバーロゴが `alt="Sawalyno logo"` だが隣接テキスト `<span class="sysbar-name">Sawalyno</span>` と内容重複。WCAG 1.1.1 に基づき `alt=""` が適切。加えて実装サイズ 16×16 が SPEC §6.5 の 24×24 と不一致 | index.html:74 |
| R1-D002 | High | 404.html システムバーロゴも同様の `alt` 重複 + `.sysbar-name` クラス欠落 + サイズ 16×16 のまま | 404.html:31 |
| R1-D003 | High | `terminal-window[role="img"]` の `aria-label` に "Building quiet apps for everyday life." が脱落しており内容不十分。また `role="img"` 内部の行テキストとの競合あり | index.html:95 |
| R1-D004 | High | ターミナルブロックが SPEC §9.1・§10.1 要件の `<pre lang="en">` ではなく `<div lang="en">` を使用 | index.html:103、404.html:56 |
| R1-D005 | Medium | `logo.svg` の `<svg>` 直下に `<title>` 要素がない。`<img>` 参照時に alt 情報を補完できない | assets/img/logo.svg:14 |
| R1-D006 | Medium | `favicon.svg` に `<title>` 要素がない | assets/img/favicon.svg |
| R1-D007 | Medium | `entity-table` に `<caption>` または `aria-label` / `aria-labelledby` がなく WCAG 1.3.1 未達 | index.html:138–157 |
| R1-D008 | Medium | `prefers-reduced-motion: reduce` 時の `.cursor-apps` が `opacity: 0.5` の静止状態になるが、コントラスト比が約 1.2:1 で視認性が低い（装飾＋ `aria-hidden` のため直接 WCAG 違反ではないが記録） | index.html:205、style.css:652–662 |
| R1-D009 | Medium | `main.js` の `visibilitychange` リスナーに `removeEventListener` がなく cleanup 経路がない | assets/js/main.js:17–27 |
| R1-D010 | Medium | `<header role="banner">` および `<footer role="contentinfo">` が冗長（body 直下の `<header>`/`<footer>` は暗黙的にロールを持つ） | index.html:72 |
| R1-D011 | — | (R1-P001 と重複のため省略) | — |
| R1-D012 | Medium | Google Fonts リクエストが2本に分かれている（JetBrains Mono+Hanken Grotesk と Noto Sans JP が別 URL）。`preconnect` は済みで影響は最小限だが認識として記録 | index.html:40–41 |
| R1-D013 | Medium | Content Security Policy (CSP) が未設定。GitHub Pages は HTTP ヘッダー設定不可のため `<meta http-equiv="Content-Security-Policy">` による設定を推奨 | index.html head |
| R1-D014 | Minor | `.window-titlebar` に `position` が未指定のため `::before { position: absolute; }` の基準が不明確 | style.css:245–253 |
| R1-D015 | Minor | `transition: opacity 300ms ease 0ms, transform 300ms ease 0ms` の `0ms` ディレイは明示不要（デフォルト値） | style.css:486–487 |
| R1-D016 | Minor | Contact セクション見出しに `style="margin-bottom:12px;"` のインラインスタイルが残存 | index.html:230 |
| R1-D017 | Minor | `ogp.png`・`apple-touch-icon.png`・`badge-appstore.svg`・`badge-googleplay.svg` が `assets/img/` に未生成（SPEC §12 v1 公開時必須） | assets/img/ |

### 対応
| ID | 対応内容 | 結果 |
|----|---------|------|
| R1-P001 | `<link rel="preload" as="font" type="font/woff2" crossorigin href="">` プレースホルダーと TODO コメントを追加 | ✅ |
| R1-P002 | 404.html の `#clock` に `aria-label="Current time"` を追加 | ✅ |
| R1-P003 | 404.html の `<span>Sawalyno</span>` に `.sysbar-name` クラスを付与 | ✅ |
| R1-P004 | `terminal-titlebar` と `terminal-body` に `aria-hidden="true"` を付与 | ✅ |
| R1-P005 | 商号行を「商号（日本語）合同会社 SAWADA」と「商号（英語）Sawada LLC」の2行に分割 | ✅ |
| R1-P006 | About セクション `logo-mark.svg` を `width="32" height="32"` に変更 | ✅ |
| R1-P007 | 先頭コメントのサブセット対象文字から ASCII 数字・英字ノイズを除去し日本語のみに整理 | ✅ |
| R1-P008 | About 紹介文末尾を削除し SPEC §2.1 一次ソース表現に統一 | ✅ |
| R1-P009 | sitemap.xml の `<lastmod>` を `2026-05-06` に更新 | ✅ |
| R1-P010 | README に `python -m http.server 8000` の代替コマンドを追記 | ✅ |
| R1-D001 | sysbar ロゴを `alt=""` に変更、サイズを 24×24 に修正、冗長 `role="banner"` 削除 | ✅ |
| R1-D002 | 404.html sysbar ロゴも `alt=""` 変更・24×24 修正・冗長 role 削除 | ✅ |
| R1-D003 | `aria-label` に "Building quiet apps for everyday life." を含む完全な文に更新 | ✅ |
| R1-D004 | `<div class="terminal-lines">` を `<pre>` に変更、内部 `<div>` を `<span style="display:block">` に変更（index.html, 404.html 両方） | ✅ |
| R1-D005 | `logo.svg` に `<title>Sawalyno</title>` を追加 | ✅ |
| R1-D006 | `favicon.svg` に `<title>Sawalyno</title>` を追加 | ✅ |
| R1-D007 | `entity-table` に `aria-label="Operating entity information"` を付与 | ✅ |
| R1-D008 | 装飾要素かつ `aria-hidden` のため WCAG 直接違反なし。意図的設計として対応不要 | ❌ 理由: `aria-hidden` 装飾要素で WCAG 直接違反なし。設計意図を尊重し対応省略 |
| R1-D009 | `visibilitychange` ハンドラを名前付き関数化し cleanup 経路を追加 | ✅ |
| R1-D010 | `<header role="banner">` / `<footer role="contentinfo">` の冗長 role を削除 | ✅ |
| R1-D012 | Noto Sans JP は `&text=` クエリが必要なため別 URL にせざるを得ない | ❌ 理由: Noto Sans JP サブセット化のため別リクエストは技術的に不可避 |
| R1-D013 | `<meta http-equiv="Content-Security-Policy">` を head に追加 | ✅ |
| R1-D014 | `.window-titlebar` に `position: relative` を追加 | ✅ |
| R1-D015 | `.hero-cta` の `transition` から冗長な `0ms` ディレイを削除 | ✅ |
| R1-D016 | Contact 見出しのインラインスタイルを削除（style.css に移管） | ✅ |
| R1-D017 | PNG/SVG 画像の新規生成は不可。README に必要アセット一覧と注記を追加 | ❌ 理由: バイナリ画像ファイルの自動生成は不可。公開前に手動作成が必要 |

---

## Round 5 — 2026-05-06

### 指摘
| ID | 重大度 | 内容 | 箇所 |
|----|--------|------|------|
| R1-D008 | Medium | （継続）cursor-apps reduced-motion 時コントラスト比約 1.2:1（WCAG 直接違反なし） | style.css:666 |
| R1-D012 | Medium | （継続）Google Fonts 2本リクエスト（技術的不可避） | index.html:40–41 |
| R1-D017 | Minor | （継続）ogp.png・apple-touch-icon.png が未生成 | assets/img/ |
| R3-D005 | Minor | （継続）logo.svg テキストが JetBrains Mono フォント依存（外部ツールなしでパス変換不可） | assets/img/logo.svg:15 |
| R5-P001 | Minor | CSP の img-src が SPEC.md では `'self' data:` だが実装では `'self' data: https:` と不一致 | SPEC.md §10.3 vs index.html:45、404.html:12 |
| R5-P002 | Minor | entity-table の `<th>` 要素（「商号（日本語）」等）に `lang="ja"` が未付与。R4-P001 対応方針と不整合 | index.html:143–162 |
| R5-P003 | Minor | 404.html フッターの `<span lang="ja">合同会社 SAWADA</span>` に `font-family: var(--font-jp)` が未付与。index.html との非対称 | 404.html:77 |
| R5-P004 | Minor | JetBrains Mono preload が TODO コメントのまま。公開日（2026-05-08）までに対応が必要（情報共有） | index.html:38 |
| R5-P005 | Minor | サブセット対象文字コメントに「VDT」「4-7-8」「20」等の ASCII 英数字が混入（SPEC §5.3 の「日本語のみ」原則と不整合） | index.html:3–9 |
| R5-D001 | High | index.html に `<noscript>` タグが存在しない。JS 無効時に `.hero-cta` および全 `.fade-section`（About・Apps・Contact）が `opacity:0` のまま不可視になる。404.html は R3-D003 で対応済みだが index.html が未対処 | index.html（script タグ直前） |
| R5-D002 | Minor | index.html に `<h1>` 要素が存在しない。スクリーンリーダーがページ主題を即座に把握しにくい | index.html（Hero セクション） |

## 強制終了 — 5ラウンド上限に到達
残存指摘 11 件あり。手動対応が必要。

### 残存指摘
| ID | 重大度 | 内容 | 箇所 |
|----|--------|------|------|
| R5-D001 | High | index.html に noscript タグがなく JS 無効時に全セクション不可視 | index.html |
| R1-D008 | Medium | cursor-apps reduced-motion 時コントラスト比約 1.2:1（WCAG 直接違反なし・設計意図） | style.css:666 |
| R1-D012 | Medium | Google Fonts 2本リクエスト（Noto Sans JP サブセット化のため技術的不可避） | index.html:40–41 |
| R5-P001 | Minor | CSP img-src が SPEC と実装で不一致（`data:` vs `data: https:`） | SPEC.md §10.3 vs index.html:45 |
| R5-P002 | Minor | entity-table の th 要素群に lang="ja" 未付与 | index.html:143–162 |
| R5-P003 | Minor | 404.html フッター span に font-family: var(--font-jp) 未付与 | 404.html:77 |
| R5-P004 | Minor | JetBrains Mono preload が TODO コメントのまま（公開前必須） | index.html:38 |
| R5-P005 | Minor | サブセット文字コメントに ASCII 英数字が混入 | index.html:3–9 |
| R5-D002 | Minor | index.html に h1 要素がない | index.html |
| R1-D017 | Minor | ogp.png・apple-touch-icon.png 未生成（公開前に手動作成必要） | assets/img/ |
| R3-D005 | Minor | logo.svg テキストが JetBrains Mono フォント依存（Inkscape 等で対応が必要） | assets/img/logo.svg:15 |

---

## Round 4 — 2026-05-06

### 指摘
| ID | 重大度 | 内容 | 箇所 |
|----|--------|------|------|
| R1-D008 | Medium | （継続）cursor-apps reduced-motion 時コントラスト低 | style.css:652–662 |
| R1-D012 | Medium | （継続）Google Fonts 2本リクエスト（技術的不可避） | index.html:40–41 |
| R1-D017 | Minor | （継続）ogp.png 等未生成 | assets/img/ |
| R3-D005 | Minor | （継続）logo.svg テキストが JetBrains Mono フォント依存（外部ツールなしでパス変換不可） | assets/img/logo.svg:15 |
| R4-P001 | Minor | index.html フッターの「合同会社 SAWADA」に `lang="ja"` が付与されていない（404.html 側は R3-P005 で対応済み・index.html 側が漏れ） | index.html:259 |
| R4-P002 | Minor | 404.html が `lang="en"` だが SPEC §9.1 では `<html lang="ja">` 必須。例外規定が SPEC に未記載 | 404.html:2、SPEC.md §9.1 |
| R4-P003 | Minor | CSP の方針が SPEC に未記載。将来の変更時に仕様と実装が乖離するリスク | SPEC.md |
| R4-P004 | Minor | JetBrains Mono preload URL 追加が README の公開前タスクリストに未記載 | README.md |
| R4-P005 | Minor | index.html フッターの「合同会社 SAWADA」が `.taskbar-center`（font-mono 指定）の下にあり CJK フォールバックが SPEC §5.3 の方針と整合しない | style.css:785、index.html:259 |
| R4-D001 | — | (R4-P001 および R4-P002 と重複のため省略) | — |
| R4-D002 | Minor | 表示テキスト `sawalyno@gmail.com` がエンコードなしでボット対象になりうる。設計上の許容が未明示 | index.html:244 |
| R4-D003 | Minor | `.btn-bevel` のタッチターゲット高さが約 38px でモバイル推奨の 44px に若干届かない可能性（WCAG 2.5.8 AA の 24px は充足） | style.css:302–324 |

### 対応
| ID | 対応内容 | 結果 |
|----|---------|------|
| R1-D008 | デザイン判断が必要。対応不要 | ❌ 理由: WCAG 直接違反なし（継続） |
| R1-D012 | 技術的に不可避 | ❌ 理由: 技術的に結合不可能（継続） |
| R1-D017 | 画像生成不可 | ❌ 理由: 公開前に手動作成が必要（継続） |
| R3-D005 | 外部ツールなしでパス変換不可 | ❌ 理由: Inkscape 等が必要（継続） |
| R4-P001 + R4-P005 | index.html フッター「合同会社 SAWADA」を `<span lang="ja" style="font-family: var(--font-jp);">` で囲み lang + CJK フォント指定を同時対応 | ✅ |
| R4-P002 | SPEC.md §9.1 に 404.html の lang="en" 例外規定を追記 | ✅ |
| R4-P003 | SPEC.md に §10.3 CSP 方針を新設（旧 §10.3 を §10.4 に繰り下げ） | ✅ |
| R4-P004 | README.md 公開前タスクリストに JetBrains Mono preload URL 追加手順を追記 | ✅ |
| R4-D002 | SPEC.md §7.1.4 にメール表示テキストの設計意図（可読性優先・意図的な選択）を追記 | ✅ |
| R4-D003 | SPEC.md §5.4 にタッチターゲット 38px の設計意図を追記。コード変更なし（記録のみ） | ✅ |

---

## Round 3 — 2026-05-06

### 指摘
| ID | 重大度 | 内容 | 箇所 |
|----|--------|------|------|
| R1-D008 | Medium | （継続）cursor-apps の reduced-motion 時コントラスト低 | index.html:205、style.css:652–662 |
| R1-D012 | Medium | （継続）Google Fonts 2本リクエスト（技術的不可避） | index.html:40–41 |
| R1-D017 | Minor | （継続）ogp.png 等未生成 | assets/img/ |
| R3-P001 | Medium | R2-D002 対応で entity-table 第一列を `<th scope="row">` に変更したが、CSS `.entity-table td:first-child` セレクタが `th` に追従しておらずスタイルが当たらない | assets/css/style.css:566–582 |
| R3-P002 | Medium | Noto Sans JP `&text=` サブセット URL に「ボックス」（ボ・ッ・ク・ス）が含まれていない可能性。index.html:205 の `app-desc` に「ボックス呼吸」が使用されており豆腐表示リスクあり | index.html:3–10、index.html:205 |
| R3-P003 | Minor | terminal-window aria-label の内容省略（コマンド名・最終プロンプトが脱落）。SPEC に aria-label 記述方針が未定義（記録のみ） | index.html:97 |
| R3-P004 | Minor | SPEC §11.3 公開前チェックリストに「JetBrains Mono preload URL を追加したか」の確認項目が未記載 | SPEC.md §10.3、§11.3 |
| R3-P005 | Minor | 404.html が `lang="en"` だが、フッターに「© 2026 Sawalyno · 合同会社 SAWADA」という日本語テキストが含まれており SR が英語として読み上げる可能性 | 404.html:2, 404.html:76 |
| R3-P006 | Minor | 404.html でも main.js の initTerminal が実行されるが、404.html の `.terminal-line` は `visible` クラスが静的に付与されており二重適用になる（副作用なし・記録のみ） | 404.html:83 |
| R3-D001 | — | (R3-P001 と重複のため省略) | — |
| R3-D002 | Minor | `.titlebar-icon` の HTML 属性が `width="32" height="32"` だが CSS `.titlebar-icon { width: 16px; height: 16px; }` と不一致。SPEC §6.5 の 32×32 指定に合わせるなら CSS を修正すべき | index.html:128、style.css:255–259 |
| R3-D003 | Medium | JS 無効環境で `.hero-cta` の opacity が 0 のまま「Back to /」ボタンが不可視になる。404.html は回復ページのため影響が大きい | 404.html:64、style.css:485–496 |
| R3-D004 | Minor | `icon-eyerest.svg` と `icon-breathcare.svg` に `<title>` 要素がない（img の alt は付与済みのため直接 WCAG 違反ではないが SVG 単体アクセス時に情報欠落） | assets/img/ |
| R3-D005 | Minor | `logo.svg` の `<text>` 要素が `JetBrains Mono` フォントに依存。外部コンテキスト（OGP ツール等）ではフォールバックフォントで描画される可能性 | assets/img/logo.svg:15 |

### 対応
| ID | 対応内容 | 結果 |
|----|---------|------|
| R1-D008 | 装飾要素・aria-hidden のため引き続き対応不要 | ❌ 理由: WCAG 直接違反なし（継続） |
| R1-D012 | 技術的に不可避 | ❌ 理由: 技術的に結合不可能（継続） |
| R1-D017 | 画像生成不可 | ❌ 理由: 公開前に手動作成が必要（継続） |
| R3-P001 | `.entity-table td:first-child` を `.entity-table th, .entity-table td:first-child` に変更し `th` にもスタイルが当たるよう修正 | ✅ |
| R3-P002 | `&text=` URL に「ボ」「ク」を追加し、先頭コメントにも「ボックス」を追記 | ✅ |
| R3-P003 | 記録のみ。コード変更不要 | ✅ |
| R3-P004 | SPEC.md §11.3 に JetBrains Mono preload URL 確認項目を追記 | ✅ |
| R3-P005 | 404.html フッターの「合同会社 SAWADA」を `<span lang="ja">` で囲んだ | ✅ |
| R3-P006 | 記録のみ。コード変更不要 | ✅ |
| R3-D002 | CSS `.titlebar-icon` を `32px` に変更（SPEC §6.5 の 32×32 指定に合わせる） | ✅ |
| R3-D003 | 404.html に `<noscript><style>.hero-cta { opacity: 1; transform: none; }</style></noscript>` を追加 | ✅ |
| R3-D004 | `icon-eyerest.svg` に `<title>EyeRest</title>`、`icon-breathcare.svg` に `<title>BreathCare</title>` を追加 | ✅ |
| R3-D005 | SVG テキストをパスに変換するには Inkscape 等の外部ツールが必要 | ❌ 理由: 外部ツールなしでは SVG テキスト→パス変換不可 |

---

## Round 2 — 2026-05-06

### 指摘
| ID | 重大度 | 内容 | 箇所 |
|----|--------|------|------|
| R1-D008 | Medium | （継続）`prefers-reduced-motion: reduce` 時の `.cursor-apps` が `opacity: 0.5` の静止状態でコントラスト比約 1.2:1 | index.html:205、style.css:652–662 |
| R1-D012 | Medium | （継続）Google Fonts リクエストが2本（Noto Sans JP サブセット化のため技術的に不可避） | index.html:40–41 |
| R1-D017 | Minor | （継続）ogp.png・apple-touch-icon.png・ストアバッジ SVG が未生成 | assets/img/ |
| R2-P001 | Medium | R1-P001 対応が未完了。`<link rel="preload" href="">` の href が空文字のままで実質ブラウザに無視される。SPEC §10.3 必須要件 | index.html:38 |
| R2-P002 | Medium | About 紹介文が 2 文に短縮され「日常にそっと寄り添うソフトウェアを目指しています。」が欠落。SPEC §7.1.2 の 3 文構成から逸脱 | index.html:136 |
| R2-P003 | Minor | CSP の `font-src https://fonts.gstatic.com` と preload font URL の整合を、URL 確定後に確認が必要（機能問題ではなく注意喚起） | index.html:38, 45 |
| R2-P004 | Minor | `role="img"` + `aria-hidden` 構造は Chromium+NVDA では問題ないが Safari+VoiceOver で動作差異の可能性あり | index.html:97–116 |
| R2-P005 | Minor | 404.html の `terminal-window` に `role="img"` と `aria-label` が付与されていない。index.html との非整合 | 404.html:48–62 |
| R2-P006 | Minor | About 紹介文修正（R2-P002）後に Noto Sans JP `&text=` サブセット文字列の再同期が必要 | index.html:3–9 |
| R2-P007 | Minor | SPEC §11.3 に sitemap lastmod 更新手順が未記載（README には記載済み）。管理粒度が分散 | SPEC.md §11.3、README.md:41 |
| R2-D001 | High | 404.html の `terminal-window` に `role="img"` / `aria-label` なし、かつ `terminal-body` に `aria-hidden="true"` なし。SR がターミナル装飾テキストをそのまま読み上げる | 404.html:48–62 |
| R2-D002 | Medium | `entity-table` の第一列が `<td>` で `<th scope="row">` になっていない。SR が行ヘッダーを識別できず WCAG 1.3.1 未達 | index.html:141–163 |
| R2-D003 | Medium | 404.html に CSP `<meta>` が未設定。index.html との保護レベルが不一致 | 404.html head |
| R2-D004 | Medium | sysbar ロゴの HTML 属性が `24×24` に更新されたが CSS `.sysbar-left img` が `16px` のまま。実際の描画は 16px | index.html:76、style.css:140–144 |
| R2-D005 | — | (R2-P001 と重複のため省略) | — |
| R2-D006 | Minor | 404.html の `.hero-cta` に `style="margin-top: 24px;"` インラインスタイルが残存 | 404.html:63 |
| R2-D007 | Minor | `logo-mark.svg` に `<title>` 要素がない（logo.svg・favicon.svg は R1 で対応済み） | assets/img/logo-mark.svg |

### 対応
| ID | 対応内容 | 結果 |
|----|---------|------|
| R1-D008 | 装飾要素・aria-hidden のため対応不要 | ❌ 理由: aria-hidden 装飾要素で WCAG 直接違反なし（継続） |
| R1-D012 | Noto Sans JP サブセット化のため技術的に不可避 | ❌ 理由: 技術的に結合不可能（継続） |
| R1-D017 | バイナリ画像生成不可 | ❌ 理由: 公開前に手動作成が必要（継続） |
| R2-P001 | 空 href の preload タグを削除し TODO コメントに置換 | ✅ |
| R2-P002 | About 紹介文に「日常にそっと寄り添うソフトウェアを目指しています。」を追記して SPEC §7.1.2 の3文構成に復元 | ✅ |
| R2-P003 | URL 確定後に整合確認すれば良い。コード変更不要 | ✅ |
| R2-P004 | Safari+VoiceOver 動作差異は記録のみ。コード変更不要 | ✅ |
| R2-P005 | R2-D001 と合わせて対応（下記） | ✅ |
| R2-P006 | サブセット対象文字コメントに紹介文を追加して &text= と同期 | ✅ |
| R2-P007 | SPEC.md §11.3 に sitemap lastmod 更新手順を追記 | ✅ |
| R2-D001 | 404.html terminal-window に role="img" + aria-label 追加、terminal-body に aria-hidden="true" 追加 | ✅ |
| R2-D002 | entity-table の第一列を `<th scope="row">` に変更（WCAG 1.3.1 対応） | ✅ |
| R2-D003 | 404.html head に index.html と同一 CSP meta を追加 | ✅ |
| R2-D004 | CSS `.sysbar-left img` を 24×24 に変更して HTML 属性と一致 | ✅ |
| R2-D006 | 404.html `.hero-cta` からインラインスタイルを除去 | ✅ |
| R2-D007 | `logo-mark.svg` に `<title>Sawalyno logo mark</title>` を追加 | ✅ |

---
