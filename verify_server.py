import urllib.request
import urllib.error

try:
    with urllib.request.urlopen("http://127.0.0.1:8000", timeout=5) as response:
        print(f"Status: {response.getcode()}")
        print(response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print(f"Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
