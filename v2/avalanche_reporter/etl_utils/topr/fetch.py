import requests
import base64

# URL_HTML = "https://web.archive.org/web/20250402164329/https://lawiny.topr.pl/"
URL_HTML = "https://lawiny.topr.pl/"

# URL_PDF = "https://web.archive.org/web/20250402164329/https://lawiny.topr.pl/viewpdf"
URL_PDF = "https://lawiny.topr.pl/viewpdf"


def fetch_topr_html() -> str:
    """
    Fetch the HTML content from the TOPR avalanche website.
    Returns:
        str: Raw HTML of the main avalanche page.
    """
    resp = requests.get(URL_HTML)
    resp.raise_for_status()
    return resp.text


def fetch_topr_pdf() -> bytes:
    """
    Fetch the PDF avalanche bulletin if available.
    Returns:
        bytes: The raw PDF file content, or raises if not found.
    """
    resp = requests.get(URL_PDF)
    resp.raise_for_status()
    binary_data = resp.content
    return base64.b64encode(binary_data).decode("utf-8")
