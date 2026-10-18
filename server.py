"""
Project Showcase Hub - Local Development & Auto-Sync Server
Zero-dependency Python server that serves static files and provides a local API
to automatically save your project visibility selections to disk.
"""

import http.server
import socketserver
import json
import os
import urllib.parse

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class HubRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_POST(self):
        if self.path == '/api/save-selection':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            try:
                payload = json.loads(post_data)
                visible_ids = set(payload.get('visibleIds', []))
                
                # 1. Update data/projects.json
                json_path = os.path.join(BASE_DIR, 'data', 'projects.json')
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                for proj in data.get('projects', []):
                    proj['visible'] = proj['id'] in visible_ids
                
                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                # 2. Update data/projects-data.js
                js_path = os.path.join(BASE_DIR, 'data', 'projects-data.js')
                with open(js_path, 'w', encoding='utf-8') as f:
                    f.write("/**\n * Project Catalog Data Source\n * Automatically updated by Project Curator.\n */\n")
                    f.write("window.PROJECTS_DATA = ")
                    json.dump(data, f, indent=2, ensure_ascii=False)
                    f.write(";\n")
                
                response = {
                    "success": True,
                    "message": "Selection saved to disk! All future visitors will see these selected projects.",
                    "visibleCount": len(visible_ids)
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                print(f"[Hub Server] Updated selection: {len(visible_ids)} visible projects saved to disk.")
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), HubRequestHandler) as httpd:
        print("=" * 60)
        print(f"🚀 Project Showcase Hub Server running at: http://localhost:{PORT}")
        print("📁 Changes made via 'Select Projects' will auto-save to disk.")
        print("=" * 60)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
