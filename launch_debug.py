import http.server
import socketserver
import webbrowser
import socket
import os
import sys
import traceback

# Enhanced logging function
def debug_print(message):
    print(f"[DEBUG] {message}")
    # Also write to a log file for external users
    try:
        with open("launch_debug.log", "a") as f:
            f.write(f"[DEBUG] {message}\n")
    except Exception as e:
        pass  # Ignore log file errors

# Print Python version and platform
debug_print(f"Python version: {sys.version}")
debug_print(f"Platform: {sys.platform}")
debug_print(f"Executable: {sys.executable}")
debug_print(f"Frozen: {getattr(sys, 'frozen', False)}")

# Change to the directory where the executable is located
if getattr(sys, 'frozen', False):
    # If running as compiled executable
    application_path = os.path.dirname(sys.executable)
    debug_print(f"Running as executable, path: {application_path}")
else:
    # If running as script
    application_path = os.path.dirname(os.path.abspath(__file__))
    debug_print(f"Running as script, path: {application_path}")

# Change working directory
try:
    os.chdir(application_path)
    debug_print(f"Changed working directory to: {os.getcwd()}")
except Exception as e:
    debug_print(f"Failed to change directory: {e}")
    debug_print(f"Current directory: {os.getcwd()}")

# List files in current directory for debugging
try:
    files = os.listdir(".")
    debug_print(f"Files in current directory: {files}")
    if "index.html" in files:
        debug_print("Found index.html")
    else:
        debug_print("WARNING: index.html not found!")
        
    if "js" in files:
        debug_print("Found js directory")
    else:
        debug_print("WARNING: js directory not found!")
        
    if "css" in files:
        debug_print("Found css directory")
    else:
        debug_print("WARNING: css directory not found!")
except Exception as e:
    debug_print(f"Failed to list directory contents: {e}")

PORT = 8000

class DebugHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()
    
    def log_message(self, format, *args):
        debug_print(f"HTTP Server: {format % args}")

# Get local IP - improved method
def get_local_ip():
    try:
        # Connect to a remote address (doesn't actually send data)
        # This helps determine which local interface would be used
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
        debug_print(f"Local IP detected: {ip}")
        return ip
    except Exception as e:
        debug_print(f"Error getting local IP (method 1): {e}")
        # Fallback method
        try:
            hostname = socket.gethostname()
            ip = socket.gethostbyname(hostname)
            debug_print(f"Local IP (fallback method): {ip}")
            return ip
        except Exception as e2:
            debug_print(f"Error getting local IP (fallback method): {e2}")
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
        debug_print(f"All local IPs: {list(ips)}")
        return list(ips)
    except Exception as e:
        debug_print(f"Error getting all IPs: {e}")
        return []

all_ips = get_all_local_ips()

# Print diagnostic information
debug_print(f"Local IP (detected): {local_ip}")
debug_print(f"Hostname: {socket.gethostname()}")

# Try to start the server
try:
    debug_print("Attempting to start HTTP server...")
    with socketserver.TCPServer(("0.0.0.0", PORT), DebugHandler) as httpd:
        debug_print(f"Serveur démarré sur le port {PORT}")
        debug_print(f"Serveur local : http://localhost:{PORT}")
        debug_print(f"Depuis un autre appareil : http://{local_ip}:{PORT}")
        debug_print("Le serveur écoute sur toutes les interfaces (0.0.0.0)")
        
        # Try to open browser
        try:
            debug_print("Attempting to open browser...")
            webbrowser.open(f"http://localhost:{PORT}")
            debug_print("Browser open command sent")
        except Exception as e:
            debug_print(f"Failed to open browser: {e}")
            traceback.print_exc()
        
        debug_print("Starting server loop...")
        debug_print("Press Ctrl+C to stop the server")
        httpd.serve_forever()
        
except KeyboardInterrupt:
    debug_print("Server stopped by user")
except Exception as e:
    debug_print(f"Server error: {e}")
    traceback.print_exc()
    debug_print("Press Enter to exit...")
    input()