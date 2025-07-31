import http.server
import socketserver
import webbrowser
import socket
import os
import sys
import subprocess

# Change to the directory where the executable is located
if getattr(sys, 'frozen', False):
    # If running as compiled executable
    application_path = os.path.dirname(sys.executable)
else:
    # If running as script
    application_path = os.path.dirname(os.path.abspath(__file__))

os.chdir(application_path)

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

# Print diagnostic information
print(f"Local IP (detected): {local_ip}")
print(f"Hostname: {socket.gethostname()}")
print(f"Working directory: {os.getcwd()}")

# Check if required files exist
required_files = ["index.html", "js", "css", "audio"]
missing_files = []
for file in required_files:
    if not os.path.exists(file):
        missing_files.append(file)

if missing_files:
    print(f"WARNING: Missing required files/directories: {missing_files}")
    print("Make sure you're running this script from the correct directory.")
    input("Press Enter to continue anyway or Ctrl+C to exit...")

# Function to open URL in Chrome/Chromium
def open_in_chrome(url):
    """Try to open URL in Chrome/Chromium browser"""
    browsers = [
        'chrome',  # Windows
        'google-chrome',  # Linux
        'chromium',  # Linux
        'chromium-browser',  # Linux
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'  # macOS
    ]
    
    # Try to register and open with Chrome first
    for browser in browsers:
        try:
            webbrowser.get(browser).open(url)
            print(f"Opened in {browser}")
            return True
        except Exception:
            pass
    
    # Try system default as fallback
    try:
        webbrowser.open(url)
        print("Opened in default browser")
        return True
    except Exception as e:
        print(f"Failed to open browser: {e}")
        return False

try:
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"Serveur démarré sur le port {PORT}")
        print(f"Serveur local : http://localhost:{PORT}")
        print(f"Depuis un autre appareil : http://{local_ip}:{PORT}")
        print("Le serveur écoute sur toutes les interfaces (0.0.0.0)")
        print("Appuyez sur Ctrl+C pour arrêter le serveur")
        
        # Try to open browser with Chrome/Chromium
        url = f"http://localhost:{PORT}"
        if open_in_chrome(url):
            print("Navigateur ouvert avec succès")
        else:
            print("Impossible d'ouvrir le navigateur automatiquement")
            print(f"Veuillez ouvrir votre navigateur et aller à {url}")
        
        # Keep the server running
        print("\nLe serveur est en cours d'exécution...")
        httpd.serve_forever()
        
except KeyboardInterrupt:
    print("\nServeur arrêté par l'utilisateur")
except Exception as e:
    print(f"Erreur du serveur: {e}")
    import traceback
    traceback.print_exc()
    input("Appuyez sur Entrée pour fermer...")
