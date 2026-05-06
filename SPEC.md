# Sawalyno コーポレートサイト 仕様書

最終更新：2026-05-05（SPEC-REVIEW v3 反映）
担当：Sawalyno（合同会社 SAWADA 代表）

> 本ドキュメントは社内向けの仕様書であり、HTML には反映しない注記も含む。
> サイト本体（`index.html`）に出力する内容は §7（ページ構成）と §9（メタデータ）の記載のみを正とする。

---

## 1. プロジェクト概要

### 1.1 目的
- Google Play Console 組織アカウント審査における運営者証明
- Sawalyno が開発するアプリの紹介・ダウンロード導線の集約
- 将来的な SNS / ブログ等の発信ハブ

### 1.2 サイト位置づけ
- **個人クリエイター「Sawalyno」を主体**としたサイト。運営元として合同会社 SAWADA を併記
- ハンドルネーム Sawalyno が前面に立ち、法人 Sawada LLC は About セクション内で「運営元」として明記
- 1ページ完結（ランディング型）
- 凝った機能は持たず、自己紹介＋アプリ紹介の最小構成
- Play Console / App Store 審査向けには、§2 の法人情報セクションが運営者証明として機能する

### 1.3 ターゲット
- Google Play / App Store の審査担当者（運営者実在性の確認）
- アプリのユーザー候補
- 取引先・問い合わせ希望者

---

## 2. サイト掲載情報

### 2.1 クリエイター情報（主体・**一次ソース**）

> 文言の一次ソースはこの表とする。§7 各セクションの本文は、ここから派生・展開する形で記述すること（§7.1.2 About はこの紹介文を膨らませた長文版）。

| 項目 | 内容 |
| --- | --- |
| ハンドル | Sawalyno |
| 肩書 | Solo developer / 合同会社 SAWADA 代表 |
| 拠点 | 日本 |
| 一言（日本語） | 日常にそっと寄り添う、小さなアプリをつくっています。 |
| キャッチコピー（英） | Building quiet apps for everyday life. |
| 連絡先 | sawalyno@gmail.com |

### 2.2 運営元（法人情報）

#### サイト HTML に出力する内容

| 項目 | 内容 |
| --- | --- |
| 商号（日本語） | 合同会社 SAWADA |
| 商号（英語） | Sawada LLC |
| 代表者 | Sawalyno |
| 事業内容 | モバイルアプリの企画・開発・運営 |
| 連絡先 | sawalyno@gmail.com |

#### SPEC 内部メモ（HTML 非出力）

- 所在地・電話番号は **サイト本体には一切記載しない**。サイトに「請求があれば遅滞なく開示」の文言も置かない（特商法表記の文脈と誤読されるリスクを避けるため）
- Play Console / App Store の運営者情報フォームには所在地・連絡先を実値で登録する
- 設立年月日も非掲載

#### 問い合わせメールで住所開示を求められた場合の運用方針

- サイト経由の一般問い合わせには **法的な住所開示義務はない**（個人事業主・小規模法人として、ストア提出済み情報で運営者証明は十分）
- 取引・請求書発行など正当な理由で必要な場合は、**個別にメールで返信して開示**する
- それ以外（漠然とした「住所教えて」等）は、本人確認できる文脈や具体的な目的が示されない限り開示しない
- いずれもサイト本体には掲載しない（特商法表記混同回避）

### 2.3 ストア表示名 ↔ サイト主体名の対応

| 媒体 | 表示名 |
| --- | --- |
| App Store / Google Play の Developer Name 欄 | `合同会社 SAWADA` / `Sawada LLC` |
| 本サイトの主体表示（`<title>`、ヒーロー、About 見出し） | `Sawalyno` |
| 本サイトの「運営元」併記 | `合同会社 SAWADA / Sawada LLC` |

ストアでは法人名で統一、サイト上は個人クリエイター名 Sawalyno で統一。両者は About セクションで明示的に紐づける。

---

## 3. ドメイン・インフラ

| 項目 | 内容 |
| --- | --- |
| ドメイン | `sawalyno.jp` |
| 配置 | ルート（`https://sawalyno.jp/`） |
| ホスティング | GitHub Pages |
| リポジトリ | `sawalyno-corp`（新規作成、既存サポートページ用リポジトリとは分離） |
| 配置場所（ローカル） | `C:\project\app-factory\apps\sawalyno-corp\` |
| HTTPS | GitHub Pages の独自ドメイン HTTPS 機能を使用 |
| DNS 設定 | A レコードで GitHub Pages の IP を指定、`CNAME` ファイル設置（詳細 §11.2） |

### 3.1 既存リソースとの関係
- サポートページ・プライバシーポリシーは既存の GitHub Pages ドメイン（`sawalyno.github.io/apps-support/`）にて運用継続
- 本サイトからは外部リンクで参照する（v1 公開後 1 ヶ月以内に「`sawalyno.jp/support/` への統合可否」を一度判断する）

---

## 4. 技術スタック

| レイヤ | 採用 |
| --- | --- |
| マークアップ | HTML5（静的） |
| スタイル | CSS3（バニラ、フレームワーク不使用） |
| スクリプト | バニラ JavaScript（タイピング演出・フェードイン・時計のみ） |
| ビルド | なし（静的ファイル直接デプロイ） |
| デプロイ | GitHub Pages（main ブランチ） |
| バージョン管理 | Git / GitHub |

### 4.1 ディレクトリ構成

```
sawalyno-corp/
├── index.html
├── 404.html                    # トーン統一のターミナル風 Not Found（§7.2 参照）
├── CNAME                       # sawalyno.jp
├── robots.txt
├── sitemap.xml
├── README.md
├── SPEC.md
├── SPEC-REVIEW*.md             # レビュー履歴（v1, v2, v3, ... と版管理。版が増えても本構成図は変更不要）
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── main.js
    └── img/
        ├── favicon.svg                 # 黒地に緑ピクセル S
        ├── apple-touch-icon.png        # 180x180（v1 公開時必須）
        ├── logo-mark.svg               # S シンボル単体（システムバー / フッター Start / favicon ベース）
        ├── logo.svg                    # S + ワードマーク Sawalyno（OGP / 大型表示用）
        ├── ogp.png                     # 1200x630（v1 公開時必須）
        ├── icon-eyerest.svg            # アプリ仮アイコン
        ├── icon-breathcare.svg         # アプリ仮アイコン
        ├── badge-appstore.svg          # 公式ストアバッジ（リリース後差し替え用、Apple Marketing Resources）
        └── badge-googleplay.svg        # 公式ストアバッジ（Google Play Brand Guidelines）
```

---

## 5. デザイン仕様

### 5.1 コンセプト
**「Sawalyno のデスクトップ環境」をモチーフにした、現代的ダーク × Windows XP/7 風レトロ × ターミナル**

参考：[hell-blau.com](https://hell-blau.com/) の「現代×懐かしさ」のバランス感覚を取り入れる。サイト全体は落ち着いたダーク UI ベース。ヒーローのみ全画面ターミナル風で「起動」演出をし、以降のセクションは XP/7 風ウィンドウ・カードで構成する。

「決め所」は次の **2 箇所** に集中させ、それ以外は静かに保つ：
1. **ヒーローのターミナル起動演出**（ブートログ＋タイピング）
2. **ベベル CTA／Start ボタンに効かせる Luna 由来の青グロウ**（hover/active のみ、§5.5）

### 5.2 カラーパレット

| 役割 | 色 | 用途 |
| --- | --- | --- |
| 背景（メイン） | `#0a0a0a` | 全体背景（ほぼ黒、わずかな放射グラデを重ねる） |
| 背景（カード/ウィンドウ） | `#161616` | ウィンドウ風コンテナの本体 |
| ボーダー（外側） | `#2a2a2a` | カード外枠 |
| ボーダー（ハイライト） | `#3a3a3a` / `#5a5a5a` | XP風ベベル上辺 |
| タイトルバー | `linear-gradient(#2c2c34 → #1a1a22)` | ウィンドウ上部のクロム |
| ターミナル背景 | `#000000` | ヒーローのターミナル本体 |
| ターミナル文字（緑） | `#5fff8f` | コンソール風テキスト本文 |
| プロンプト記号 | `#4ade80` | `$` `>` |
| 本文テキスト | `#e8e8e8` | 通常本文 |
| サブテキスト | `#9a9a9a` | キャプション・補足 |
| アクセント青（Luna） | `#4ea1ff` | リンクホバー、CTA グロウ |
| 強調（黄） | `#ffcc33` | `Coming Soon` バッジ |

#### フォーカスリング色（`:focus-visible`）

| コンテキスト | リング色 | 仕様 |
| --- | --- | --- |
| 通常 UI（ダーク背景） | `#4ea1ff`（Luna 青） | `outline: 2px solid #4ea1ff; outline-offset: 2px;` |
| ターミナル内 | `#5fff8f`（緑） | `outline: 2px solid #5fff8f; outline-offset: 2px;` |
| 黄バッジ等の上 | `#0a0a0a`（黒） | コントラスト確保のため反転 |

### 5.3 タイポグラフィ

| 用途 | フォント | サイズ目安 |
| --- | --- | --- |
| 本文（日本語） | `"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif` | 16px |
| 本文（英数） | `"Hanken Grotesk", system-ui, sans-serif` | 16px |
| 等幅（ターミナル・タイトルバー・ラベル） | `"JetBrains Mono", "Fira Code", "SF Mono", "Consolas", monospace` | 13〜16px |
| 見出し H1（Hero） | JetBrains Mono Bold（緑） | 28〜40px |
| 見出し H2（セクション） | Hanken Grotesk + 等幅プレフィックス `// ` | 24〜28px |

#### CJK と等幅の取り扱い（重要）
- **JetBrains Mono は CJK グリフを持たないため、ターミナル風表示の中に日本語を直接置かない**
- ヒーローのターミナル本文は **英語のみ**で構成する（§7.1.1 参照）
- ターミナル外の日本語本文は Noto Sans JP を採用（プロポーショナル・セーフ）
- ターミナル外で「`> `」プレフィックス付きの装飾的な引用句に日本語を入れる場合は、プレフィックスのみ等幅、本文は Noto Sans JP として混植する

#### Web フォント読み込み
- Google Fonts から `Noto Sans JP` `Hanken Grotesk` `JetBrains Mono` を読み込む（`display=swap`）
- `<link rel="preconnect" href="https://fonts.googleapis.com">` と `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` を必須とする
- **Noto Sans JP は表示テキスト固定のため `&text=` クエリでサブセット化**してファイルサイズを抑える（数百KB → 数十KB へ）
- サブセット対象文字は §7 のページに登場する日本語の集合を抜き出して URL に埋める

#### サブセット文字集合の管理運用
- **v1 公開時**：§7 の日本語本文（About / Apps / Contact 等）に登場する文字を手動で重複排除し、`&text=` パラメータに埋める。HTML コメントで「サブセット対象文字一覧」を `index.html` 冒頭に併記しておく
- **本文を増やす時の運用**：HTML 編集時に新規追加文字があれば、上記コメントとフォント URL の両方を手動で更新する（`§11.4 更新フロー`に記載）
- **同期忘れ時の症状**：サブセット URL を更新しないまま新規文字を本文に追加すると、その文字だけ `□`（豆腐／tofu）で表示される。本番デプロイ前に必ず該当セクションを目視確認すること
- 将来本文が増えた場合は `node scripts/build-font-subset.js` のような簡易スクリプト化を検討（v1 では手動運用）

### 5.4 レトロ UI 要素
- **ウィンドウ風カード**：左にアイコン、中央にタイトル（等幅）、右に `_ □ ×` ボタンを持つタイトルバーを必ず備える
- **`_ □ ×` ボタンの扱い（重要）**：純粋に装飾。クリック領域を持たず、`<span aria-hidden="true">` で実装する。スクリーンリーダーには露出しない
- **ベベルボタン**：上明・下暗のグラデで立体感のあるボタン。CTA で使用。`padding: 9px 22px` + `font-size: 13px` の組み合わせにより、タッチターゲット高さは約 38px となる。WCAG 2.5.8 AA（24px 以上）は充足しており、モバイル推奨の 44px には若干届かないが、このサイトの性質（情報提供型・CTA が 1 箇所）を踏まえて現状値を設計上の意図として維持する。
- **レトロアイコン**：16〜32px のドット風 SVG をウィンドウタイトル左／フッター／コンタクト等に配置
- **トップ／ボトムのクロム要素は役割を分離**：
  - 上＝**システムバー**（ナビ＋アイデンティティ＋時計）
  - 下＝**タスクバー風フッター**（Start ボタン＋外部リンク）
  - **時計は上だけ**、**Start ボタンは下だけ**。両方に同じものを置かない
- **タスクバー風フッター**：左に擬似 Start ボタン（装飾、リンクなし）、右にリンク群
  - Start ボタンは `cursor: default` を指定して「押せない」ことを視覚的に示す
  - メイン CTA（ヒーローの `View Apps ↓`）とは視覚階層を明確に差別化（Start は控えめなトーン、CTA は前面に出る）
  - `_ □ ×` と同様に押下フィードバック（`scale(0.98)` 等）は与えない（押せると誤認させない）

### 5.5 アニメーション・演出（控えめだが「決め所」だけは効かせる）
- **ブート演出（合計尺・確定）**：ヒーローのターミナルに数行のログをスタッガーでフェードイン → 最終行のみタイピング。**フェード〜タイピング完了までの合計を 1100〜1400ms に収める**（§7.1.1 の細目数値はこの合計に内包される）
- **タイピング**：最後の 1 行（キャッチコピー）のみタイプライター風に表示。カーソル `_` は点滅
- **カーソル点滅の仕様**：
  - 周期 **1.0〜1.2 秒（≒ 0.83〜1.0Hz）** — WCAG 2.3.1（3Hz 超 flashing 禁止）の安全圏に収める
  - 適用箇所：ヒーロー末尾、Apps セクション末尾「More apps loading...」プレースホルダー
  - Apps プレースホルダーは常時点滅（装飾）。`prefers-reduced-motion: reduce` 時は静止
- **セクションフェード**：各ウィンドウは初回表示時に 200〜300ms で `translateY(8px) → 0` + opacity フェード
  - **トリガー方式（確定）**：`IntersectionObserver` で各セクションの初回入域時に発火。on-load の一斉発火やスクロール連動アニメーションは使わない（「スクロール連動アニメは原則使わない」原則の唯一の例外として、入域検知のみ許容）
  - 一度発火したセクションは再度監視せず、再スクロール時にちらつかせない
- **ホバー / 押下**：
  - ボタン・リンクは色／影変化（150ms）
  - ベベル CTA の press 時に Luna 青グロウ：`box-shadow: 0 0 0 2px rgba(78,161,255,0.35)`
  - フッター Start ボタンの hover で青のリングが **1 周のみ完結（ワンショット）** で表示（300ms、`animation-iteration-count: 1` で固定）。hover 中ループしない
  - `prefers-reduced-motion: reduce` 時、Start ボタン hover は色変化のみにフォールバック
- スクロール連動アニメーションは原則使わない
- `prefers-reduced-motion: reduce` を尊重し、すべて即時表示にフォールバック

### 5.6 背景・テクスチャ
- 背景に薄い SVG ノイズオーバーレイ（**初期値 opacity 0.035**、実装時に ±0.01 範囲で目視チューニング可）
- 薄いスキャンライン（`repeating-linear-gradient`、**初期値 opacity 0.030**、実装時に ±0.01 範囲で目視チューニング可）
- いずれも `pointer-events: none` の固定オーバーレイ
- `prefers-reduced-motion: reduce` 時はノイズ・スキャンライン共に opacity 0 にフォールバック（揺らぎを避ける）

### 5.7 レスポンシブ
- **Apps セクションの段組（確定）**：`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` でブレークポイントレスに実装する。1024px の固定ブレークポイントは設けない（オーナー一任で確定）
- ここでの「ブレークポイントレス」は **Apps セクションの段組決定のみ** を指す。フォントサイズ・余白・システムバーのバージョン省略表記など、サイト全体の微調整には従来どおり `768px` 等のメディアクエリを使用してよい
- セクション全体の補助ブレークポイント：`~767px` でモバイル微調整（フォントサイズ・余白）を許容
- ウィンドウ風カードはスマホでもタイトルバー維持。`_ □ ×` は小さく表示（装飾）
- ターミナルセクションは横スクロールせず折り返し
- システムバーはスマホで `Sawalyno OS v1.0` のバージョン表記を省略

---

## 6. ロゴ・ファビコン仕様

### 6.1 メインロゴ
- 黒背景（#000）+ 緑ピクセル（#5fff8f）
- 「S」を強調したドット絵風シンボル＋ワードマーク `Sawalyno`
- バリエーション：
  - `logo.svg`：シンボル＋ワードマーク横並び（OGP・大型表示用）
  - `logo-mark.svg`：S シンボル単体（正方形、システムバー / フッター Start / favicon ベース）

### 6.2 ピクセル「S」シンボル仕様
- 8x8 グリッドのピクセルアート風
- 黒の正方形背景に緑のドットで `S` を描く
- `shape-rendering="crispEdges"` を指定してシャープに
- **通常表示サイズは 16 / 24 / 32 / 64px のいずれかから選ぶ**（8x8 グリッドが整数倍の物理ピクセルにマップされ、粒度が統一される）。任意サイズでの拡縮は禁止
- **規定外サイズの例外**：
  - `apple-touch-icon.png`（180×180）：8x8 を整数倍できない規定サイズ。SVG ベースで 180×180 にスケール → PNG ラスタライズ時は **最近傍補間（nearest neighbor）** を用いてピクセル粒度を維持する
  - `favicon.svg`（実体は SVG なのでサイズ非依存）／ブラウザが要求した時に 16/32/48 等で表示される場合あり：`shape-rendering="crispEdges"` でブラウザ任せにする

### 6.3 ファビコン
- `favicon.svg`（モダンブラウザ用、SVG ベースで軽量）
- `apple-touch-icon.png`（180x180、v1 公開時必須）
- デザイン：黒地に緑ピクセル S（同モチーフ）

### 6.4 OGP 画像
- `ogp.png`（1200 x 630、v1 公開時必須）
- 黒背景にロゴ＋`Sawalyno — Building quiet apps for everyday life.`

### 6.5 ロゴ利用マトリクス

| 場所 | 使用アセット | サイズ | 備考 |
| --- | --- | --- | --- |
| システムバー左 | `logo-mark.svg` | 24x24 | サイトの主アイデンティティ位置 |
| ヒーロー | なし | — | ターミナルウィンドウが視覚アンカー。ロゴはシステムバー上で既出のため二重露出を避ける |
| About 見出し横（任意） | `logo-mark.svg` | 32x32 | 任意装飾。8x8 グリッドの整数倍 |
| フッター Start ボタン | `logo-mark.svg`（インライン SVG） | 16x16 | 8x8 グリッドの整数倍。システムバーと粒度統一（§6.2 のサイズ規定） |
| `favicon.svg` / `apple-touch-icon.png` | `logo-mark.svg` のクロップ | 各規定サイズ | — |
| `ogp.png` | `logo.svg`（ワードマーク版） | 中央配置 | — |

### 6.6 ストアバッジ（リリース後差し替え用）
- `badge-appstore.svg`：Apple Marketing Resources の公式アセットを使用（独自改変不可、規定の余白を遵守）
- `badge-googleplay.svg`：Google Play Brand Guidelines の公式アセットを使用
- v1 では `Coming Soon` バッジで代替し、ストアリリース時にこれらに差し替える

---

## 7. ページ構成（1ページ・縦スクロール）

```
┌─────────────────────────────────────────────┐
│ [skip to main content（visually-hidden）]    │
├─────────────────────────────────────────────┤
│ 0. システムバー（固定上部）                   │
│    [S] Sawalyno OS v1.0  about apps  --:--:--│
├─────────────────────────────────────────────┤
│ 1. ヒーロー（ターミナル風セクション・英語のみ）│
│    ターミナルウィンドウに boot ログ＋        │
│    タイプライター演出のキャッチコピー         │
│    [View Apps ↓] CTA ベベルボタン            │
├─────────────────────────────────────────────┤
│ 2. About — sawalyno.txt                     │
│    Sawalyno の自己紹介（日本語可）           │
│    続けて「Operating Entity」として           │
│    合同会社 SAWADA を小さな表で併記          │
├─────────────────────────────────────────────┤
│ 3. // Apps                                  │
│    eyerest / BreathCare / More coming...    │
│    各カードにアイコン・説明・Coming Soon バッジ│
├─────────────────────────────────────────────┤
│ 4. Contact — mail.txt                       │
│    sawalyno@gmail.com（mailto）              │
├─────────────────────────────────────────────┤
│ 5. タスクバー風フッター（Start / 外部リンク）│
└─────────────────────────────────────────────┘
```

### 7.1 セクション詳細

#### 7.1.0 システムバー（固定）
- 左：S ロゴ + `Sawalyno OS v1.0`
- 中央：`about` `apps` `contact` のアンカーリンク（等幅・小サイズ）
- 右：JS で更新するリアルタイム時計（`HH:MM:SS`）
- 高さ：32px、半透明背景＋backdrop-filter blur
- **時計の精度方針**：装飾扱い。`setInterval(1000)` で更新するが、タブ非アクティブ時の throttle による多少のズレは許容。`document.addEventListener("visibilitychange", ...)` でアクティブ復帰時に即時再描画する
- 時計は `aria-live="off"`（読み上げに割り込まない）

#### 7.1.1 ヒーロー（ターミナル風・英語のみ）
- 縦 80vh 程度
- ターミナルウィンドウ（タイトルバー：`bash — sawalyno@sawada: ~`）
- **内部テキストは英語のみ**（CJK 等幅問題を避ける）：
  ```
  $ whoami
  sawalyno
  $ cat profile.txt
  Solo developer based in Japan.
  Operating under Sawada LLC.
  $ ./greet --tagline
  > Building quiet apps for everyday life.
  $ _
  ```
- 行ごとにフェードイン（800〜1000ms）→ 最後の `> Building quiet apps...` のみタイピング演出（300〜400ms）→ 末尾カーソル点滅（**フェード〜タイピング完了の合計を §5.5 の 1100〜1400ms 以内に収める。両者の数値を単純加算しないこと**）
- CTA ベベルボタン：`View Apps ↓`（XP 風、Luna 青グロウ on press）

#### 7.1.2 About — sawalyno.txt
- ウィンドウ風カード1枚
- タイトルバー：`About — sawalyno.txt`
- 本文構成：
  - 見出し：`I'm Sawalyno.`（H2）
  - 紹介文（日本語2〜3行、§2.1 一次ソースから派生）：
    > 日本を拠点に、ひとりで日用のための小さなアプリをつくっています。デザインから実装、運用までを一人で。日常にそっと寄り添うソフトウェアを目指しています。
  - サブカード「Operating Entity」：§2.2 の表（HTML 出力分のみ）

#### 7.1.3 // Apps
- セクションタイトル：`// Apps`（`// ` はサブテキスト色、`Apps` は本文色）
- ウィンドウ風カードを並べる（PC: 2〜3カラム、SP: 1カラム、§5.7）
- 各カード：
  - タイトルバー：`{app}.app`
  - アプリアイコン（仮、SVG）
  - アプリ名（H3）
  - ジャンル（タグ）
  - 一言説明
  - `Coming Soon` バッジ（リリース後 `badge-appstore.svg` / `badge-googleplay.svg` に差し替え）
- 末尾に「More apps loading...」のプレースホルダーカード（カーソル常時点滅、`prefers-reduced-motion` 時は静止）

##### 初期掲載アプリ（DB から起こした説明文）

| アプリ名 | ジャンル | 一言説明 |
| --- | --- | --- |
| **eyerest** | 目のストレッチタイマー | 20分ごとにそっと休憩を促し、目のストレッチをガイドする。VDT 作業の小さな相棒。 |
| **BreathCare** | 呼吸法 / メンタルケア | 4-7-8 呼吸・ボックス呼吸など、世界中で実践される呼吸法を日本語ガイドで体験できる。 |

#### 7.1.4 Contact — mail.txt
- ウィンドウ風カード
- タイトルバー：`Contact — mail.txt`
- 本文：
  - `お問い合わせはメールにてお願いいたします。`
  - メールアドレス（mailto、等幅・大きめ）
- **mailto のスパム対策とアクセシビリティの両立**：
  - **`href` 側のみ HTML エンティティで難読化**（例：`href="mailto:&#115;awalyno&#64;gmail.com"`）
  - **表示テキスト（`<a>` の中身）はプレーン文字列**で `sawalyno@gmail.com` と書く。SR が 1 文字ずつ読み上げる事故を防ぐ
  - 補強として `aria-label="Email Sawalyno (sawalyno at gmail dot com)"` を併記
  - 本格対策は Gmail フィルタに寄せる
  - **設計上の意図**：表示テキストはプレーンで可読性を優先。`href` 側のみエンティティ化でボット対策とする。クローラーによるアドレス収集リスクは Gmail フィルタ運用で吸収する設計であり、エンコード省略は意図的な選択である。
- 将来の SNS リンク追加用スペース（HTML コメント `<!-- social links coming soon -->`）を確保

#### 7.1.5 タスクバー風フッター
- 左：擬似 Start ボタン `[S] start`（装飾、リンクなし。hover で青リングが 1 周）
- 中央：`© 2026 Sawalyno · 合同会社 SAWADA`
- 右：`support ↗` / `privacy ↗` リンク
  - 既存 GitHub Pages へ外部リンク：`target="_blank"` + **`rel="noopener noreferrer"` 必須**
  - リンクテキストに外部リンクアイコン `↗` を付ける
- 高さ：40px

### 7.2 404 ページ（`404.html`）
- サイト全体のトーンを保ったターミナル風 Not Found
- 文面例（英語のみ）：
  ```
  $ cd ./that-page
  bash: cd: ./that-page: No such file or directory
  $ ./go-home
  ```
- ホームへ戻る CTA を1つ（ベベルボタン、`Back to /`）
- システムバー / フッターは index と共通

---

## 8. キャッチコピー（確定）

**確定：A `> Building quiet apps for everyday life.`**

- ヒーロー終盤でタイピング表示
- OGP 画像にも掲載
- 日本語訳の併記は当面行わない（ターミナル文体の統一感を優先）

---

## 9. SEO / メタデータ

### 9.0 検索ターゲット方針
- **主：日本国内の日本語検索**（`description` は日本語ベース）
- 副：英語圏でのブランド検索（`Sawalyno` 直引き）。英語の `og:description` は短い英文 1 行（キャッチコピー）で対応
- 英語圏の発見性を高めたくなった段階で `description` を二言語ブレンド型に書き換える

### 9.1 基本メタタグ

`<html lang="ja">` を必ず指定する（サイト本文は日本語が主のため）。ターミナルブロックなど英語のみのコンテンツには `<pre lang="en">` を当て、SR の言語切替と検索エンジンの言語判定に効かせる。ただし `404.html` はコンテンツが英語主体のターミナル表示のため `lang="en"` を許容する。フッター等の日本語テキストには `lang="ja"` を個別に付与すること。

```html
<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>Sawalyno — Building quiet apps for everyday life.</title>
<meta name="description" content="Sawalyno の公式サイト。日常にそっと寄り添う小さなモバイルアプリをつくっています。運営：合同会社 SAWADA（Sawada LLC）。">
<meta name="theme-color" content="#0a0a0a">
<link rel="canonical" href="https://sawalyno.jp/">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">

<meta property="og:title" content="Sawalyno">
<meta property="og:description" content="Building quiet apps for everyday life.">
<meta property="og:image" content="https://sawalyno.jp/assets/img/ogp.png">
<meta property="og:url" content="https://sawalyno.jp/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Sawalyno">
<meta property="og:locale" content="ja_JP">

<meta name="twitter:card" content="summary_large_image">
<!-- twitter:site / twitter:creator は SNS 開設後に追加 -->
</head>
```

### 9.2 JSON-LD（schema.org/Organization）

法人実在性を Google に明示するため、`<head>` 末尾に以下を埋め込む。

> 構造方針：v1 は `Organization` 単独で出す。サイト主体性（Sawalyno = 個人クリエイター）と運営元（Sawada LLC）の関係は `alternateName: "Sawalyno"` ＋ `founder.name: "Sawalyno"` で表現する。将来的により厳密にしたい場合は `@graph` で `Person`（id: `#sawalyno`）と `Organization`（id: `#sawada-llc`）を並べ、`Person.worksFor` で関連付ける構造に書き換える（v1 では採用しない）。

> **重要**：JSON-LD は厳密 JSON のため、`<script>` タグの中身に `// ...` 形式のコメントを入れてはならない（パースエラー）。注記が必要な場合は `<script>` の外側に HTML コメント `<!-- ... -->` で書くこと。

```html
<!-- TODO: SNS 開設時に "sameAs" の配列に URL を追加する -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Sawada LLC",
  "legalName": "合同会社 SAWADA",
  "alternateName": "Sawalyno",
  "url": "https://sawalyno.jp/",
  "logo": "https://sawalyno.jp/assets/img/logo.svg",
  "email": "sawalyno@gmail.com",
  "sameAs": [],
  "founder": {
    "@type": "Person",
    "name": "Sawalyno"
  }
}
</script>
```

公開前に Google [Rich Results Test](https://search.google.com/test/rich-results) で valid を確認する（§11.3 チェックリスト）。

### 9.3 robots / sitemap
- `robots.txt`：全許可、`Sitemap: https://sawalyno.jp/sitemap.xml` を明記
- `sitemap.xml`：トップ1ページのみ（404 は除外）

---

## 10. アクセシビリティ・パフォーマンス

### 10.1 アクセシビリティ
- **`<html lang="ja">` を必須**。ターミナルブロックなど英語のみのコンテンツには `<pre lang="en">` で言語切替を明示（§9.1）
- ターミナルの緑文字は `#5fff8f` on `#000` で WCAG AAA 相当のコントラストを確保
- 画像には `alt` 属性必須（装飾的なものは `alt=""`）
- ナビゲーションランドマーク（`<header>` `<nav>` `<main>` `<footer>`）を適切に使用
- **Skip Link**：ページ冒頭に `<a class="skip-link" href="#main">Skip to main content</a>` を配置。`visually-hidden` で隠し、`:focus` で可視化
- **`_ □ ×` の装飾扱い**：`<span aria-hidden="true">` で実装、クリック領域を持たない（§5.4）
- **フォーカスリング**：§5.2 の色対応に従う。`:focus-visible` で明示
- **タイピング・フェード・カーソル点滅・スキャンライン・ノイズ**は `prefers-reduced-motion: reduce` で即時表示／静止／非表示にフォールバック
- **時計の読み上げ抑制**：`aria-live="off"`

### 10.2 パフォーマンス目標（Web Vitals ベース）

| 指標 | 目標 |
| --- | --- |
| LCP（fast 3G） | ≤ 2.5s |
| TBT | ≤ 200ms |
| CLS | ≤ 0.05 |
| 総ファイルサイズ（フォント除く） | ≤ 200KB |
| Lighthouse Performance / Accessibility / Best Practices / SEO | 各 90+ |

### 10.3 Content Security Policy

`<meta http-equiv="Content-Security-Policy">` で以下のポリシーを全ページに適用する：`default-src 'self'`、`font-src https://fonts.gstatic.com`、`style-src 'self' https://fonts.googleapis.com`、`script-src 'self'`、`img-src 'self' data:`、`connect-src 'none'`。外部スクリプトや任意の外部通信をデフォルト遮断し、Google Fonts の読み込みに必要なオリジンのみを最小限で許可する。

### 10.4 パフォーマンス施策
- フォントは `display=swap`、`preconnect` 実施（§5.3）
- Noto Sans JP は `&text=` でサブセット読み込み（§5.3）
- **JetBrains Mono は LCP 候補（ヒーロー・ターミナル）に直結するため `<link rel="preload" as="font" type="font/woff2" crossorigin>` で優先取得**（必要に応じて Regular ウェイト1種のみ）
- ヒーロー LCP 設計：ターミナルウィンドウの**枠（CSS で描画される黒背景）**を LCP 要素にし、フォント未到着時もカクつかないようにする。フォント到着で文字が後から差し替わる FOUT は許容（CLS は起こさない構造）
- 画像は SVG 中心。PNG（OGP、apple-touch）は最適化（pngquant 等）
- JS は単一ファイル（`main.js`）・defer 読み込み

---

## 11. デプロイ・運用

### 11.1 GitHub リポジトリ
- 新規リポジトリ：`sawalyno-corp`（確定）
- 公開設定：Public（GitHub Pages 利用のため）
- main ブランチを Pages のソースに指定

### 11.2 独自ドメイン設定手順（実施タスク）
1. リポジトリに `CNAME` ファイル作成（中身：`sawalyno.jp`）
2. ドメインの DNS で **A レコード**を GitHub Pages の IP に設定
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. （任意・推奨）**AAAA レコード**で IPv6 にも対応
   - `2606:50c0:8000::153`
   - `2606:50c0:8001::153`
   - `2606:50c0:8002::153`
   - `2606:50c0:8003::153`
4. （任意）`www.sawalyno.jp` の CNAME を `sawalyno.github.io` に設定
5. **CAA レコードの確認・設定**：
   - まず `dig CAA sawalyno.jp +short`（または `nslookup -type=CAA sawalyno.jp`）で既存 CAA を確認する
   - 何も返らなければスキップ可
   - `0 issue "..."` 形式のレコードが存在する場合、`letsencrypt.org` を許可していないと GitHub Pages の HTTPS 証明書発行が失敗する。`0 issue "letsencrypt.org"` を追加する
6. GitHub リポジトリ Settings → Pages → Custom domain に `sawalyno.jp` を入力
7. Enforce HTTPS にチェック

### 11.3 公開前チェックリスト
本番反映前に以下を必ず実施する。

- [ ] Lighthouse スポット計測（Performance / Accessibility / Best Practices / SEO 各 90+）
- [ ] 主要ブラウザ目視確認（Chrome / Safari / Edge）
- [ ] iPhone / iPad 実機で safe-area 確認（システムバー・フッターが切れない）
- [ ] リンク切れ確認（外部 support / privacy へのリンク含む）
- [ ] OGP プレビュー確認（X / Slack / LinkedIn の Card Validator 系で1つ以上）
- [ ] `prefers-reduced-motion: reduce` 時の動作確認
- [ ] スクリーンリーダーで `_ □ ×` が読み上げられないこと
- [ ] **JSON-LD が [Rich Results Test](https://search.google.com/test/rich-results) でエラーなし**
- [ ] `sitemap.xml` の `<lastmod>` を公開日に更新する
- [ ] JetBrains Mono の preload URL（woff2）を確定して `<link rel="preload" as="font" type="font/woff2" crossorigin href="URL">` を追加したか

### 11.4 更新フロー
- ローカルで HTML/CSS/JS 編集 → コミット → push → 自動デプロイ
- アプリ追加時：`index.html` の Apps セクションにカード追記＋アイコン SVG 追加
- アプリリリース時：`Coming Soon` バッジを公式ストアバッジに差し替え
- **本文に新しい日本語を追加した時**：Noto Sans JP の `&text=` サブセット URL と、`index.html` 冒頭の「サブセット対象文字一覧」HTML コメントを手動で同期更新（§5.3 サブセット運用）。**同期し忘れると追加文字が `□`（豆腐）になるため、デプロイ前に該当セクションを目視確認する**

---

## 12. スケジュール

| マイルストーン | 期日目安 |
| --- | --- |
| 仕様書承認 | 2026-05-05 |
| ロゴ・ファビコン・**OGP・apple-touch-icon** 作成 | 2026-05-06 |
| HTML/CSS/JS 実装（v1） | 2026-05-06〜07 |
| ローカル確認・調整・公開前チェック | 2026-05-07 |
| ドメイン接続・公開 | 2026-05-08 |
| Play Console 組織申請 | 2026-05-08 以降 |
| リリース可能環境整備 | 2026-05-19 まで（2週間以内） |
| 既存 `apps-support` との統合可否判断 | 2026-06-08 まで（v1 公開後 1 ヶ月以内） |

---

## 13. 確定事項

### 13.1 v1 確定（オーナー初回回答）

- [x] リポジトリ名：`sawalyno-corp`
- [x] キャッチコピー：A `> Building quiet apps for everyday life.`
- [x] アプリ仮アイコン：プレースホルダ（黒地に緑ピクセル風）で進める
- [x] eyerest / BreathCare の一言説明：DB から起こし、§7.1.3 に記載
- [x] サイト主体：個人クリエイター Sawalyno。法人は About 内の「運営元」として併記
- [x] アプリ名表記：DB に従い `BreathCare`（`BraceCare` は表記ブレのため不採用）

### 13.2 v1 レビュー対応で追加確定（SPEC-REVIEW.md 反映）

- [x] ターミナル内テキストは英語のみ（CJK 等幅問題回避）
- [x] サイト本体に「住所は請求があれば開示」等の文言を載せない（特商法表記混同回避）
- [x] `_ □ ×` は装飾扱い（`aria-hidden="true"`、クリック領域なし）
- [x] JSON-LD Organization を `<head>` に埋め込む
- [x] フォントは Google Fonts、Noto Sans JP は `&text=` でサブセット
- [x] 公開前チェックリストを §11.3 に明記
- [x] OGP / apple-touch-icon は v1 公開時必須（§12 ロゴ作成日に組み込み）

### 13.3 v2 レビュー対応で追加確定（SPEC-REVIEW-v2.md 反映）

- [x] ブート演出の合計尺は 1100〜1400ms に内包（フェード＋タイピングを単純加算しない、§5.5 / §7.1.1）
- [x] フッター Start ボタンの青リングは 1 周完結ワンショット（`iteration-count: 1`）、`prefers-reduced-motion` 時は色変化のみ
- [x] mailto は href 側のみエンティティ化、表示テキストはプレーン、`aria-label` 併記
- [x] JSON-LD 内に JS 形式コメントを置かない。`sameAs: []` で空配列初期化、注記は HTML コメントへ
- [x] CAA 確認は能動手順（`dig CAA` → 必要時に `letsencrypt.org` 追加）
- [x] カーソル点滅周期 1.0〜1.2 秒（WCAG 2.3.1 配慮）
- [x] ノイズ・スキャンラインの初期値を仮確定（0.035 / 0.030、±0.01 で目視チューニング）
- [x] ピクセル「S」シンボルの表示サイズは 16/24/32/64px の整数倍に限定
- [x] サブセット文字集合は v1 では手動運用、HTML コメントで対象文字一覧を併記
- [x] §11.3 公開前チェックリストに JSON-LD Rich Results Test を追加
- [x] §9.0 検索ターゲット方針：日本国内日本語検索を主、英語ブランド検索を副

### 13.4 オーナー一任で確定（2026-05-05 取得）

- [x] **Apps セクションの段組**：`auto-fit, minmax(280px, 1fr)` でブレークポイントレスに実装（§5.7）
- [x] **mailto の難読化レベル**：`href` 側のみ HTML エンティティ難読化、表示テキストはプレーン、`aria-label` 併記（§7.1.4 の方針をそのまま採用）
- [x] **JSON-LD `founder.name`**：`Sawalyno`（ハンドル名）で出力。サイト主体性を優先し、戸籍名は採用しない（§9.2）
- [x] **CAA レコード**：実装時に `dig CAA sawalyno.jp +short` で確認 → 何もなければスキップ、`0 issue "..."` がある場合のみ `letsencrypt.org` を追加（§11.2 手順5）

### 13.5 v3 レビュー対応で追加確定（SPEC-REVIEW-v3.md 反映）

- [x] §4.1 のレビュー履歴を `SPEC-REVIEW*.md` のグロブ表記化
- [x] `apple-touch-icon.png`（180px）と `favicon.svg` をピクセル粒度規定の例外として §6.2 に明記
- [x] フッター Start ボタンに `cursor: default` を指定、押下フィードバックを与えない、CTA と視覚階層を差別化（§5.4）
- [x] **`<html lang="ja">` を必須**、ターミナルブロックは `<pre lang="en">` を当てる（§9.1, §10.1）
- [x] セクションフェードのトリガーは `IntersectionObserver` で初回入域時に発火（一度のみ）と確定（§5.5）
- [x] §5.7「ブレークポイントレス」は **Apps 段組決定のみ** を指すと明記（メディアクエリ自体の使用は許容）
- [x] LCP 設計：JetBrains Mono を `<link rel="preload">`、ターミナル**枠**を LCP 要素に。フォント未到着でも CLS を起こさない（§10.3）
- [x] §11.4 サブセット同期忘れ時の症状（`□` 豆腐表示）を明記
- [x] JSON-LD は v1 では `Organization` 単独。`@graph` で `Person`+`Organization` 並列化は将来オプションとして §9.2 に併記
- [x] 住所開示の問い合わせ対応方針を §2.2 SPEC 内部メモに追記（法的義務はないが、正当理由はメール個別返信で対応）

## 14. 残課題・将来検討

- [ ] SNS 運用開始時のリンク追加（X / GitHub / Note 等）→ JSON-LD `sameAs` と Twitter Card `twitter:site`/`twitter:creator` も同時更新
- [ ] `apps-support` 既存サイトとの統合（2026-06-08 までに判断）
- [ ] アプリリリース後の Coming Soon → 公式ストアバッジ差し替え運用
- [ ] サブセット文字集合のスクリプト化（`scripts/build-font-subset.js`）：本文が増えた段階で検討

---

## 付録 A：レビュー対応マトリクス

### v1（SPEC-REVIEW.md）

| Review # | 区分 | 重要度 | 対応箇所 | ステータス |
| --- | --- | --- | --- | --- |
| R-01 | 技術 | 高 | §5.3, §7.1.1, §13 | ✅ ターミナル英語のみ |
| R-02 | SEO/法務 | 高 | §9.2 | ✅ JSON-LD 追加 |
| R-03 | SEO | 中 | §9.1 | ✅ og:locale / theme-color / icon リンク追加 |
| R-04 | 法務 | 高 | §2.2, §13 | ✅ 「請求があれば開示」を HTML 非出力に |
| R-05 | 整合 | 中 | §6.5 | ✅ ロゴ利用マトリクス追加 |
| R-06 | デザイン | 中 | §5.4 | ✅ 上＝時計、下＝Start に分離 |
| R-07 | デザイン | 中 | §5.5, §5.6 | ✅ ブート 1100〜1400ms / opacity 引き上げ |
| R-08 | デザイン | 中 | §5.7 | ✅ 1024px 中間ブレークポイントまたは auto-fit |
| R-09 | A11y | 高 | §5.4, §10.1 | ✅ aria-hidden 仕様化 |
| R-10 | A11y | 中 | §5.2 | ✅ focus-visible 色対応表追加 |
| R-11 | A11y | 低 | §10.1 | ✅ Skip Link 追加 |
| R-12 | 技術 | 中 | §7.2 | ✅ 404 ページ仕様追加 |
| R-13 | 性能 | 中 | §5.3, §10.3 | ✅ preconnect / &text= サブセット |
| R-14 | SEO | 中 | §6.6, §7.1.3 | ✅ ストアバッジ運用追加 |
| R-15 | 運用 | 低 | §7.1.4 | ✅ HTML エンティティ難読化方針 |
| R-16 | 整合 | 中 | §7.1.5, §3.1, §12 | ✅ rel=noopener / ↗ / 統合判断期日 |
| R-17 | 技術 | 低 | §11.2 | ✅ AAAA / CAA 注記追加 |
| R-18 | 整合 | 中 | §12, §13 | ✅ OGP / apple-touch を 5/6 に組み込み |
| R-19 | デザイン | 低 | §5.1, §5.5 | ✅ Luna 青グロウを CTA / Start に |
| R-20 | デザイン | 低 | §5.5, §7.1.3 | ✅ Apps カーソル例外を明記 |
| R-21 | 整合 | 低 | §2.1, §7.1.2 | ✅ 一次ソース指定 |
| R-22 | 法務/運営 | 低 | §2.3 | ✅ ストア表示名 ↔ サイト主体名対応表 |
| R-23 | 技術 | 低 | §7.1.0 | ✅ 時計の精度方針＋visibilitychange |
| R-24 | 性能 | 低 | §10.2 | ✅ Web Vitals ベース指標へ |
| R-25 | 運用 | 低 | §11.3 | ✅ 公開前チェックリスト 7 項目 |

### v2（SPEC-REVIEW-v2.md）

| Review # | 区分 | 重要度 | 対応箇所 | ステータス |
| --- | --- | --- | --- | --- |
| V2-01 | 整合 | 高 | §5.5, §7.1.1 | ✅ ブート合計尺の内包を両セクションに明記 |
| V2-02 | 整合 | 中 | §6.5 | ✅ ヒーロー行に「ロゴ非掲載」の理由を併記 |
| V2-03 | デザイン | 中 | §5.5 | ✅ Start 青リングをワンショット（iteration-count: 1）に固定 |
| V2-04 | A11y | 中 | §7.1.4 | ✅ href 側のみ難読化、表示はプレーン、aria-label 併記 |
| V2-05 | SEO | 中 | §9.2 | ✅ JSON-LD コメント除去、`sameAs: []` 初期化 |
| V2-06 | SEO | 低 | §9.0 | ✅ 検索ターゲット方針（JP 主・EN 副）明記 |
| V2-07 | 技術 | 中 | §11.2 | ✅ CAA 確認手順を能動形に書き換え |
| V2-08 | 整合 | 低 | §14 | ✅ 段組決定の担当・タイミングを明記 |
| V2-09 | デザイン | 低 | §5.6 | ✅ ノイズ 0.035 / スキャンライン 0.030 を初期値確定 |
| V2-10 | 整合 | 低 | §11.3 | ✅ Rich Results Test をチェックリストに追加 |
| V2-11 | A11y | 低 | §5.5 | ✅ カーソル点滅周期 1.0〜1.2 秒（WCAG 2.3.1 安全圏） |
| V2-12 | 技術 | 低 | §5.3, §11.4 | ✅ サブセット文字集合の手動運用ルール追加 |
| V2-13 | デザイン | 低 | §6.2, §6.5 | ✅ 表示サイズを 16/24/32/64px 整数倍に固定 |
| V2-14 | 運用 | 低 | §13 | ✅ §13 を v1 / v1 レビュー / v2 レビューに 3 分割 |

### v3（SPEC-REVIEW-v3.md）

| Review # | 区分 | 重要度 | 対応箇所 | ステータス |
| --- | --- | --- | --- | --- |
| V3-01 | 整合 | 中 | §4.1 | ✅ `SPEC-REVIEW*.md` のグロブ表記化、版が増えても本構成図は変更不要 |
| V3-02 | 整合 | 低 | §6.2 | ✅ apple-touch-icon（180px）/ favicon を粒度規定の例外として明記、最近傍補間でラスタライズ |
| V3-03 | A11y | 低 | §5.4 | ✅ Start ボタンに `cursor: default`、押下フィードバック禁止、CTA と視覚差別化 |
| V3-04 | A11y/SEO | 中 | §9.1, §10.1 | ✅ `<html lang="ja">` 必須、ターミナルは `<pre lang="en">` |
| V3-05 | デザイン | 低 | §5.5 | ✅ セクションフェードは `IntersectionObserver` 初回入域発火に確定 |
| V3-06 | 整合 | 低 | §5.7 | ✅ 「ブレークポイントレス」は段組決定のみを指すと明記 |
| V3-07 | 性能 | 低 | §10.3 | ✅ JetBrains Mono を preload、ターミナル枠を LCP 要素に |
| V3-08 | 運用 | 低 | §5.3, §11.4 | ✅ サブセット同期忘れ時の症状（豆腐表示）を明記 |
| V3-09 | デザイン | 低 | §5.4 | ✅ 装飾扱いの押下フィードバック禁止を消極側で確定 |
| V3-10 | SEO | 低 | §9.2 | ✅ v1 は Organization 単独、`@graph` 並列化は将来オプションとして併記 |
| V3-11 | 法務 | 低 | §2.2 | ✅ 住所開示問い合わせ対応方針を SPEC 内部メモに追記 |
