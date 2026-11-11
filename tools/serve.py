"""確認用のローカルサーバー。ブラウザにキャッシュさせない。

    python tools/serve.py          → http://localhost:8123/
    python tools/serve.py 9000     → ポートを変える

`python -m http.server` だとブラウザが古い HTML を使い回すことがあり、
別の PC やスマホから見たときに直したはずの内容が出ない。このサーバーは
毎回取り直させる。LAN 内の他の端末からは http://<この PC の IP>:8123/ で見られる。
本番（GitHub Pages）には関係しない。
"""
import functools
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
    handler = functools.partial(NoCacheHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("0.0.0.0", port), handler) as httpd:
        sys.stdout.buffer.write(f"http://localhost:{port}/  (Ctrl+C で停止)\n".encode("utf-8"))
        sys.stdout.buffer.flush()
        httpd.serve_forever()


if __name__ == "__main__":
    main()
