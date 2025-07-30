import http.server
import socketserver
import webbrowser
import socket
import logging

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

# Get local IP - improved method
def get_local_ip():
    try:
        # Connect to a remote address (doesn't actually send data)
        # This helps determine which local interface would be used
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
        return ip
    except Exception:
        # Fallback method
        try:
            hostname = socket.gethostname()
            return socket.gethostbyname(hostname)
        except Exception:
            return "127.0.0.1"

# Get local IP
local_ip = get_local_ip()

# Also get all network interfaces for debugging
def get_all_local_ips():
    try:
        hostname = socket.gethostname()
        all_ips = socket.getaddrinfo(hostname, None)
        ips = set()
        for addr_info in all_ips:
            ip = addr_info[4][0]
            if ':' not in ip:  # Filter out IPv6 addresses
                ips.add(ip)
        return list(ips)
    except Exception as e:
        print(f"Error getting all IPs: {e}")
        return []

all_ips = get_all_local_ips()

# Print diagnostic information
print(f"Local IP (detected): {local_ip}")
print(f"All local IPs: {all_ips}")
print(f"Hostname: {socket.gethostname()}")

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Serveur démarré sur le port {PORT}")
    print(f"Serveur local : http://localhost:{PORT}")
    print(f"Depuis un autre appareil : http://{local_ip}:{PORT}")
    print("Le serveur écoute sur toutes les interfaces (0.0.0.0)")
    webbrowser.open(f"http://localhost:{PORT}")
    httpd.serve_forever()
