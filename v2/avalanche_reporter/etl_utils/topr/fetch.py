import requests
import base64

def fetch_topr_html() -> str:
    """
    Fetch the HTML content from the TOPR avalanche website.
    Returns:
        str: Raw HTML of the main avalanche page.
    """
    url_html = "https://lawiny.topr.pl/"
    resp = requests.get(url_html)
    resp.raise_for_status()
    return resp.text


def fetch_topr_pdf() -> bytes:
    """
    Fetch the PDF avalanche bulletin if available.
    Returns:
        bytes: The raw PDF file content, or raises if not found.
    """
    url_pdf = "https://lawiny.topr.pl/viewpdf"
    resp = requests.get(url_pdf)
    resp.raise_for_status()
    binary_data = resp.content
    return base64.b64encode(binary_data).decode("utf-8")

