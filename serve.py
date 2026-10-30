#!/usr/bin/env python3
import argparse
import mimetypes
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit


class LocalSiteHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self._serve_pretty_url()

    def do_HEAD(self):
        self._serve_pretty_url(send_body=False)

    def _serve_pretty_url(self, send_body=True):
        parsed = urlsplit(self.path)
        path = unquote(parsed.path)

        if path.startswith("/"):
            relative_path = path.lstrip("/")
        else:
            relative_path = path

        if not relative_path:
            relative_path = "index.html"

        if relative_path.lower().endswith(".html"):
            if relative_path.lower() == "index.html" and path == "/":
                relative_path = "index.html"
            else:
                if relative_path.lower() == "index.html":
                    clean_path = "/"
                else:
                    clean_path = "/" + relative_path[:-5]
                if parsed.query:
                    clean_path += "?" + parsed.query
                self.send_response(301)
                self.send_header("Location", clean_path)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

        # /about/ -> /about  (trailing slash irundha css/js relative paths break aagum)
        if len(path) > 1 and path.endswith("/"):
            stripped = path.rstrip("/")
            target = os.path.join(os.getcwd(), stripped.lstrip("/"))
            if not os.path.isdir(target) and os.path.isfile(target + ".html"):
                clean_path = stripped
                if parsed.query:
                    clean_path += "?" + parsed.query
                self.send_response(301)
                self.send_header("Location", clean_path)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

        file_path = os.path.normpath(os.path.join(os.getcwd(), relative_path))
        root = os.path.abspath(os.getcwd()) + os.sep
        file_path_absolute = os.path.abspath(file_path)

        if file_path_absolute != root.rstrip(os.sep) and not file_path_absolute.startswith(root):
            self.send_error(403, "Forbidden")
            return

        if os.path.isdir(file_path_absolute):
            index_path = os.path.join(file_path_absolute, "index.html")
            if os.path.isfile(index_path):
                file_path_absolute = index_path
        elif not os.path.isfile(file_path_absolute) and os.path.splitext(file_path_absolute)[1] == "":
            html_path = file_path_absolute + ".html"
            if os.path.isfile(html_path):
                file_path_absolute = html_path

        if not os.path.isfile(file_path_absolute):
            self.send_error(404, "File not found")
            return

        try:
            with open(file_path_absolute, "rb") as file:
                content = file.read()
        except OSError as exc:
            self.send_error(500, str(exc))
            return

        content_type, _ = mimetypes.guess_type(file_path_absolute)
        self.send_response(200)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if send_body:
            self.wfile.write(content)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Local preview server with extensionless .html URL support")
    parser.add_argument("--port", "-p", type=int, default=5501)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadingHTTPServer((args.host, args.port), LocalSiteHandler)
    print(f"Serving {os.getcwd()} at http://{args.host}:{args.port}/")
    print(f"Example: http://{args.host}:{args.port}/business-automation")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()