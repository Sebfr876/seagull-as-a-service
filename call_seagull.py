"""Call the Seagull-as-a-Service API and print the noise.

Usage:
    python call_seagull.py [count]

Set SEAGULL_URL to point at a deployed instance (default: http://localhost:3000).
"""

import json
import os
import sys
import urllib.error
import urllib.request

BASE_URL = os.environ.get("SEAGULL_URL", "http://localhost:3000")


def get_noise():
    with urllib.request.urlopen(f"{BASE_URL}/seagull", timeout=5) as response:
        return json.load(response)["noise"]


def main():
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    try:
        for _ in range(count):
            print(get_noise())
    except urllib.error.HTTPError as err:
        body = json.load(err)
        print(f"HTTP {err.code}: {body.get('error', err.reason)}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as err:
        print(f"Could not reach {BASE_URL} — is the server running? ({err.reason})", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
