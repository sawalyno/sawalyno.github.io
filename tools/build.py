"""sawalyno.jp を data/apps.json から組み立て直す。

    python tools/build.py           反映する
    python tools/build.py --check   反映せず、ずれがあるかだけ調べる（ずれ・未記入があれば終了コード 1）

やること:
  1. data/apps.json を検査する
  2. アイコン（assets/img/app-{id}.png・192px）を icon_source から作る
  3. index.html の <!-- apps:begin --> 〜 <!-- apps:end --> とアプリ件数を書き換える
  4. 各アプリのサポート・プライバシーポリシー・利用規約（apps/{id}/support/*.html）の
     <main> の外側（head・ヘッダー・ナビ・フッター）を作り直す。<main> の中は触らない。
     ページが無ければ tools/templates/ のひな型から作る
  5. Noto Sans JP のサブセット（&text=）を本文から作り直す
  6. CSS / JS の ?v= を中身のハッシュに付け替える（古いキャッシュ対策）
  7. sitemap.xml を作り直す（変わったページの日付を今日にする）

手で直すところ:
  - アプリの追加・公開状況・色・ひとこと → data/apps.json
    （"listed": false のアプリはサポート系ページだけ作り、会社サイトの一覧には出さない）
  - サポート・PP・規約の本文          → apps/{id}/support/*.html の <main> の中だけ
それ以外（index.html の apps:begin 〜 apps:end、各ページの <main> の外側）は
次の実行で上書きされる。
"""
import datetime
import hashlib
import html
import json
import re
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "apps.json"
INDEX = ROOT / "index.html"
NOT_FOUND = ROOT / "404.html"
TEMPLATES = ROOT / "tools" / "templates"
ASSETS = ["assets/css/style.css", "assets/css/support.css", "assets/js/pre.js", "assets/js/main.js"]
FONT_BASE = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700"
SITE = "https://sawalyno.jp"
ICON_SIZE = 192
TODO_MARK = "【要記入"

# ファイル名 → ページの種類。terms は data/apps.json で "terms": true のアプリだけ作る
KINDS = {
    "index": {"label": "サポート", "body": "doc-support", "href": "./"},
    "privacy": {"label": "プライバシーポリシー", "body": "doc-legal", "href": "./privacy.html"},
    "terms": {"label": "利用規約", "body": "doc-legal", "href": "./terms.html"},
}

REQUIRED = ("id", "name", "genre", "desc", "tagline", "color")
ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
PACKAGE_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$")
APPLE_ID_RE = re.compile(r"^[0-9]{6,12}$")
COLOR_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")
MAIN_RE = re.compile(r"<main>(.*)</main>", re.S)


def say(text: str) -> None:
    sys.stdout.buffer.write((text + "\n").encode("utf-8"))


class BuildError(Exception):
    pass


# ---------------------------------------------------------------- data
def load_apps() -> list:
    try:
        apps = json.loads(DATA.read_text(encoding="utf-8"))["apps"]
    except (OSError, ValueError, KeyError) as e:
        raise BuildError(f"data/apps.json を読めません: {e}")
    if not apps:
        raise BuildError("data/apps.json の apps が空です")
    seen = set()
    for i, app in enumerate(apps, 1):
        where = f"apps の {i} 件目（{app.get('id', '?')}）"
        for key in REQUIRED:
            if not isinstance(app.get(key), str) or not app[key].strip():
                raise BuildError(f"{where}: {key} がありません")
        if not ID_RE.match(app["id"]):
            raise BuildError(f"{where}: id は英小文字・数字・ハイフンだけにしてください")
        if app["id"] in seen:
            raise BuildError(f"{where}: id が重複しています")
        seen.add(app["id"])
        if not COLOR_RE.match(app["color"]):
            raise BuildError(f"{where}: color は #RRGGBB の形にしてください（例 #4ECDC4）")
        if app.get("google_play") and not PACKAGE_RE.match(app["google_play"]):
            raise BuildError(f"{where}: google_play はパッケージ名（例 jp.sawalyno.eyerest）にしてください")
        if app.get("app_store_id") and not APPLE_ID_RE.match(str(app["app_store_id"])):
            raise BuildError(f"{where}: app_store_id は数字だけ（例 6762698407）にしてください")
    return apps


def short_name(app: dict) -> str:
    """「息息（いきいき）」→「息息」。ページの <title> に使う。"""
    return app["name"].split("（")[0].strip()


# ---------------------------------------------------------------- colour
def _luminance(color: str) -> float:
    def channel(v: int) -> float:
        c = v / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (int(color[i:i + 2], 16) for i in (1, 3, 5))
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def contrast(a: str, b: str) -> float:
    la, lb = sorted((_luminance(a), _luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def accent_vars(color: str) -> str:
    """アプリの色から、読める文字色を決める（WCAG のコントラスト 4.5:1 以上）。"""
    on_accent = "#ffffff" if contrast(color, "#ffffff") >= 4.5 else "#0f1f2a"
    r, g, b = (int(color[i:i + 2], 16) for i in (1, 3, 5))
    text = color.lower()
    while contrast(text, "#ffffff") < 4.5:      # 白地のリンク用に、同じ色相のまま暗くする
        r, g, b = int(r * 0.94), int(g * 0.94), int(b * 0.94)
        text = f"#{r:02x}{g:02x}{b:02x}"
    return f"--accent: {color.lower()}; --accent-text: {text}; --on-accent: {on_accent}"


# ---------------------------------------------------------------- icons
def build_icons(apps: list, check: bool) -> list:
    changed = []
    for app in apps:
        out = ROOT / "assets" / "img" / f"app-{app['id']}.png"
        if out.exists():
            continue  # 作り直したいときは assets/img/app-{id}.png を消してから実行する
        src = ROOT / app["icon_source"] if app.get("icon_source") else None
        if src and src.exists():
            changed.append(out)
            if not check:
                from PIL import Image  # アイコンを作るときだけ必要
                im = Image.open(src).convert("RGBA").resize((ICON_SIZE, ICON_SIZE), Image.LANCZOS)
                im.save(out, optimize=True)
        else:
            raise BuildError(
                f"{app['id']}: アイコンがありません。icon_source に元画像のパスを書くか、"
                f"assets/img/app-{app['id']}.png（{ICON_SIZE}px）を置いてください"
            )
    return changed


# ---------------------------------------------------------------- company site: app list
def render_store_links(app: dict) -> list:
    rows = []
    if app.get("google_play"):
        url = "https://play.google.com/store/apps/details?id=" + app["google_play"]
        rows.append(
            f'<a class="store-badge" data-store="Play" href="{html.escape(url)}" target="_blank" rel="noopener">'
            '<img src="/assets/img/badge-googleplay.png" alt="Google Play で手に入れよう" width="150" height="44"></a>'
        )
    else:
        rows.append('<span class="btn-soon">Google Play 近日公開</span>')
    if app.get("app_store_id"):
        url = f"https://apps.apple.com/jp/app/id{app['app_store_id']}"
        rows.append(
            f'<a class="store-badge" data-store="iOS" href="{html.escape(url)}" target="_blank" rel="noopener">'
            '<img src="/assets/img/badge-appstore.svg" alt="App Store からダウンロード" width="120" height="44"></a>'
        )
    else:
        rows.append('<span class="btn-soon">App Store 近日公開</span>')
    return rows


def render_app(app: dict) -> str:
    e = html.escape
    lang = "" if app["name"].isascii() else ' lang="ja"'
    links = "\n".join("              " + row for row in render_store_links(app))
    docs = "".join(
        f'<a href="/apps/{app["id"]}/support/{"" if k == "index" else k + ".html"}" target="_blank" rel="noopener">{KINDS[k]["label"]}</a>'
        for k in kinds_for(app)
    )
    return f"""          <article class="app" id="app-{app['id']}" data-app="{app['id']}">
            <div class="app-head">
              <img class="app-icon" src="/assets/img/app-{app['id']}.png" alt="{e(app['name'])} のアイコン" width="84" height="84">
              <div>
                <h3 class="app-name"{lang}>{e(app['name'])}</h3>
                <span class="app-genre">{e(app['genre'])}</span>
              </div>
            </div>
            <p class="app-desc">{e(app['desc'])}</p>
            <div class="store-links">
{links}
            </div>
            <p class="app-docs">{docs}</p>
          </article>"""


BLOCK_RE = re.compile(r"(<!-- apps:begin[^>]*-->\n).*?(\n[ \t]*<!-- apps:end -->)", re.S)
COUNT_RE = re.compile(r'(<span id="app-count">)[^<]*(</span>)')


def apply_apps(page: str, apps: list) -> str:
    apps = [a for a in apps if a.get("listed", True)]   # "listed": false は一覧に出さない（公開前）
    body = "\n\n".join(render_app(a) for a in apps)
    page, n = BLOCK_RE.subn(lambda m: m.group(1) + body + m.group(2), page)
    if n != 1:
        raise BuildError("index.html に <!-- apps:begin --> 〜 <!-- apps:end --> が見つかりません")
    page, n = COUNT_RE.subn(lambda m: f"{m.group(1)}{len(apps)} 個のアプリ{m.group(2)}", page)
    if n != 1:
        raise BuildError('index.html に <span id="app-count"> が見つかりません')
    return page


# ---------------------------------------------------------------- support / privacy / terms
def page_path(app: dict, kind: str) -> Path:
    return ROOT / "apps" / app["id"] / "support" / f"{kind}.html"


def kinds_for(app: dict) -> list:
    """このアプリが持つページ。terms は "terms": true か、すでにファイルがあるとき。"""
    kinds = ["index", "privacy"]
    if app.get("terms") or page_path(app, "terms").exists():
        kinds.append("terms")
    return kinds


def render_nav_items(app: dict, current: str, indent: str) -> str:
    rows = []
    for kind in kinds_for(app):
        cur = ' aria-current="page"' if kind == current else ""
        rows.append(f'{indent}<li><a href="{KINDS[kind]["href"]}"{cur}>{KINDS[kind]["label"]}</a></li>')
    return "\n".join(rows)


def render_page(app: dict, kind: str, main_inner: str) -> str:
    e = html.escape
    info = KINDS[kind]
    name, tagline = e(app["name"]), e(app["tagline"])
    if kind == "index":
        brand = f'<h1 class="doc-app">{name}</h1>'
        title_block = ""
    else:
        brand = f'<a class="doc-app" href="./">{name}</a>'
        title_block = f'\n  <div class="doc-title">\n    <h1>{info["label"]}</h1>\n  </div>\n'
    return f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{e(short_name(app))} {info["label"]}</title>
  <link rel="icon" href="/assets/img/favicon.png" type="image/png" sizes="64x64">
  <link rel="stylesheet" href="/assets/css/support.css">
</head>
<body class="doc {info["body"]}" style="{accent_vars(app["color"])}">
  <!-- main 要素の外側は tools/build.py が data/apps.json から作る。手で直すのは main 要素の中だけ -->
  <header class="doc-header">
    <div class="doc-brand">
      <img class="doc-icon" src="/assets/img/app-{app["id"]}.png" alt="" width="60" height="60">
      <div>
        {brand}
        <p class="doc-tagline">{tagline}</p>
      </div>
    </div>
  </header>
  <nav class="doc-nav" aria-label="{name} のページ">
    <ul>
{render_nav_items(app, kind, "      ")}
    </ul>
  </nav>
{title_block}
  <main>{main_inner}</main>

  <footer class="doc-footer">
    <div class="doc-footer-inner">
      <ul>
{render_nav_items(app, "", "        ")}
      </ul>
      <a class="doc-maker" href="/">
        <img src="/assets/img/logo-mark-64.png" alt="" width="28" height="28">
        <span>© 2026 sawalyno / SAWADA LLC</span>
      </a>
    </div>
  </footer>
</body>
</html>
"""


def scaffold_main(app: dict, kind: str) -> str:
    """新しいアプリのページ本文を、ひな型から作る（要記入の印つき）。"""
    template = TEMPLATES / f"support-{kind}.html"
    if not template.exists():
        raise BuildError(f"ひな型がありません: tools/templates/support-{kind}.html")
    text = template.read_text(encoding="utf-8")
    return text.replace("{{NAME}}", html.escape(app["name"])).replace("{{SHORT}}", html.escape(short_name(app)))


def build_support_pages(apps: list) -> dict:
    """{path: (old_text or None, new_text)} を返す。<main> の中身は 1 文字も変えない。"""
    result = {}
    for app in apps:
        for kind in kinds_for(app):
            path = page_path(app, kind)
            if path.exists():
                old = path.read_text(encoding="utf-8")
                m = MAIN_RE.search(old)
                if not m or old.count("<main>") != 1:
                    raise BuildError(f"{path.relative_to(ROOT).as_posix()}: <main> 〜 </main> が 1 組ではありません")
                inner = m.group(1)
            else:
                old, inner = None, scaffold_main(app, kind)
            result[path] = (old, render_page(app, kind, inner))
    return result


# ---------------------------------------------------------------- font subset
def apply_font_subset(page: str, texts: list) -> str:
    chars = {chr(c) for c in range(0x20, 0x7F)}  # 日本語の文に混ざる英数字・記号
    for text in texts:
        chars.update(ch for ch in text if ord(ch) >= 0x2E80 or ch in "©・—…")
    subset = urllib.parse.quote("".join(sorted(chars)), safe="")
    href = f"{FONT_BASE}&amp;text={subset}&amp;display=swap"
    page, n = re.subn(r'(<link id="jp-font" href=")[^"]*(")', lambda m: m.group(1) + href + m.group(2), page)
    if n != 1:
        raise BuildError('index.html に <link id="jp-font"> が見つかりません')
    return page


# ---------------------------------------------------------------- cache stamps
def apply_stamps(page: str) -> str:
    for rel in ASSETS:
        digest = hashlib.sha256((ROOT / rel).read_bytes()).hexdigest()[:8]
        page = re.sub(r'(/' + re.escape(rel) + r')(\?v=[^"]*)?(")', lambda m: f"{m.group(1)}?v={digest}{m.group(3)}", page)
    return page


# ---------------------------------------------------------------- sitemap
def url_of(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return SITE + "/"
    return SITE + "/" + (rel[: -len("index.html")] if rel.endswith("/index.html") else rel)


def render_sitemap(paths: list, changed: set, old_text: str) -> str:
    old = dict(re.findall(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", old_text))
    today = datetime.date.today().isoformat()
    rows = []
    for path in paths:
        loc = url_of(path)
        lastmod = today if (path in changed or loc not in old) else old[loc]
        priority = "1.0" if path == INDEX else "0.5"
        rows.append(
            f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{lastmod}</lastmod>\n"
            f"    <changefreq>monthly</changefreq>\n    <priority>{priority}</priority>\n  </url>"
        )
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(rows) + "\n</urlset>\n")


# ---------------------------------------------------------------- main
def main() -> int:
    check = "--check" in sys.argv[1:]
    rel = lambda p: p.relative_to(ROOT).as_posix()
    try:
        apps = load_apps()
        changed_names = [rel(p) for p in build_icons(apps, check)]

        pages = {}                                   # path -> (old, new)
        index_old = INDEX.read_text(encoding="utf-8")
        index_new = apply_apps(index_old, apps)
        js_text = (ROOT / "assets" / "js" / "main.js").read_text(encoding="utf-8")
        index_new = apply_font_subset(index_new, [index_new, js_text])
        pages[INDEX] = (index_old, index_new)
        nf = NOT_FOUND.read_text(encoding="utf-8")
        pages[NOT_FOUND] = (nf, nf)
        pages.update(build_support_pages(apps))
        pages = {p: (old, apply_stamps(new)) for p, (old, new) in pages.items()}
    except BuildError as e:
        say(f"エラー: {e}")
        return 2

    changed = {p for p, (old, new) in pages.items() if old != new}
    sitemap_path = ROOT / "sitemap.xml"
    sitemap_old = sitemap_path.read_text(encoding="utf-8")
    listed = [p for p in pages if p != NOT_FOUND]
    sitemap_new = render_sitemap(listed, changed, sitemap_old)
    changed_names += [rel(p) for p in pages if p in changed]
    if sitemap_new != sitemap_old:
        changed_names.append("sitemap.xml")
    todo = [rel(p) for p, (_, new) in pages.items() if TODO_MARK in new]

    if check:
        code = 0
        if changed_names:
            say("未反映の変更があります（python tools/build.py を実行してください）: " + ", ".join(changed_names))
            code = 1
        if todo:
            say("要記入が残っています（公開前に本文を書いてください）: " + ", ".join(todo))
            code = 1
        if code == 0:
            say(f"OK: {len(apps)} 個のアプリ・{len(pages) - 2} 枚のサポート系ページ・ずれなし")
        return code

    for p, (old, new) in pages.items():
        if old != new:
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(new, encoding="utf-8", newline="\n")
    if sitemap_new != sitemap_old:
        sitemap_path.write_text(sitemap_new, encoding="utf-8", newline="\n")
    hidden = [a["id"] for a in apps if not a.get("listed", True)]
    if hidden:
        say("会社サイトの一覧には出していません（listed: false）: " + ", ".join(hidden))
    say(f"{len(apps)} 個のアプリを反映しました。" + ("変更: " + ", ".join(changed_names) if changed_names else "変更なし"))
    if todo:
        say("要記入が残っています（公開前に本文を書いてください）: " + ", ".join(todo))
    return 0


if __name__ == "__main__":
    sys.exit(main())
