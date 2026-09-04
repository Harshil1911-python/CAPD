#!/usr/bin/env python3
"""
Simple static file server for the Capacitor web assets.
Usage: python3 scripts/serve.py
Then open http://localhost:3000
"""
import http.server
import socketserver
import os
import sys

PORT = 3000
WEB_DIR = os.path.join(os.path.dirname(__file__), "..", "www")

os.chdir(WEB_DIR)

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving Capacitor demo at http://localhost:{PORT}")
    print("Press Ctrl+C to stop")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        sys.exit(0)
