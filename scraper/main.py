import json
import asyncio
import os
from datetime import datetime
from playwright.async_api import async_playwright
import requests

# URL of the avalanche report page
URL = "https://lawiny.topr.pl/"

async def scrape_avalanche_data():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # Run browser in headless mode
        page = await browser.new_page()
        await page.goto(URL)

        # Extract the JavaScript variable containing the data
        oLawReport = await page.evaluate("oLawReport")

        # Extract key data
        date_issued = oLawReport["iat"]
        date_expires = oLawReport["exp"]
        risk_level = oLawReport["mst"]["lev"]
        risk_description = oLawReport["mst"]["desc0"]
        history = oLawReport["history"]

        # Extract PDF link (assumed to be available under "viewpdf" button)
        pdf_url = URL + "viewpdf"

        # Close browser
        await browser.close()

        return {
            "date_issued": date_issued,
            "date_expires": date_expires,
            "risk_level": risk_level,
            "risk_description": risk_description,
            "history": history,
            "pdf_url": pdf_url
        }

def download_pdf(pdf_url, save_dir="pdf_reports"):
    os.makedirs(save_dir, exist_ok=True)
    filename = f"{save_dir}/avalanche_report_{datetime.now().strftime('%Y-%m-%d')}.pdf"
    
    response = requests.get(pdf_url)
    response.raise_for_status()

    with open(filename, "wb") as file:
        file.write(response.content)

    return filename

# Run the scraper
async def main():
    data = await scrape_avalanche_data()
    print("Avalanche Risk Level:", data["risk_level"])
    print("Issued:", data["date_issued"], "Expires:", data["date_expires"])
    print("Description:", data["risk_description"])
    print("History:", data["history"])

    # Download the PDF report
    pdf_file = download_pdf(data["pdf_url"])
    print(f"PDF saved at: {pdf_file}")

# Run the script
asyncio.run(main())
