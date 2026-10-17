import re
import socket
import ipaddress
import html
from urllib.parse import urlparse
from typing import Tuple, Optional

def sanitize_text(text: Optional[str]) -> str:
    """
    Sanitizes untrusted text from external RSS feeds or APIs.
    Strips raw HTML tags and decodes HTML entities to prevent stored XSS.
    """
    if not text:
        return ""
    # Strip HTML tags
    cleaned = re.sub(r"<[^>]*>", " ", text)
    # Decode HTML entities
    cleaned = html.unescape(cleaned)
    # Clean up common encoding glitches like replacement character
    cleaned = cleaned.replace("\ufffd", "'")
    # Normalize whitespaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def is_safe_remote_url(url: str) -> Tuple[bool, Optional[str]]:
    """
    Validates a URL against Server-Side Request Forgery (SSRF) vulnerabilities.
    Blocks private IP addresses, localhost, link-local addresses, and cloud metadata services.
    """
    if not url or not isinstance(url, str):
        return False, "URL string cannot be empty."

    parsed = urlparse(url.strip())
    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Unsupported URL scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted."

    hostname = parsed.hostname
    if not hostname:
        return False, "Invalid URL: missing valid hostname."

    # Block common local hostnames
    lower_host = hostname.lower()
    if lower_host in ("localhost", "127.0.0.1", "0.0.0.0", "metadata.google.internal", "instance-data"):
        return False, "Access to localhost or internal network endpoints is restricted."

    try:
        # Resolve hostname to all associated IP addresses
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        return False, f"Could not resolve hostname '{hostname}'."
    except Exception as e:
        return False, f"DNS resolution error: {str(e)}"

    for entry in addr_info:
        ip_str = entry[4][0]
        try:
            ip = ipaddress.ip_address(ip_str)
            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_multicast
                or ip.is_reserved
                or ip.is_unspecified
                or str(ip).startswith("169.254.")
            ):
                return False, f"Access to private or non-routable IP address ({ip_str}) is blocked for security."
        except ValueError:
            return False, f"Invalid resolved IP address: {ip_str}"

    return True, None
