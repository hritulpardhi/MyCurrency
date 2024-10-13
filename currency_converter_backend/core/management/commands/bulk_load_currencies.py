import asyncio
import logging

import aiohttp
from channels.db import database_sync_to_async
from django.conf import settings
from django.core.management.base import BaseCommand

from core.models import Currency

# Set up logging
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Fetches currencies from the API and loads them into the Currency model"

    async def fetch_currencies(self):
        url = f"https://api.currencybeacon.com/v1/currencies?api_key={settings.CURRENCY_BEACON_API_KEY}&type=fiat"
        try:
            logger.info("Sending request to the API to fetch currencies...")
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    response.raise_for_status()  # Check for HTTP errors
                    json_response = await response.json()
                    logger.info("API response received successfully.")

                    currency_data = json_response.get("response", [])
                    if not isinstance(currency_data, list):
                        logger.error("Unexpected data format from API")
                        return

                    currencies = []
                    for currency in currency_data:
                        currencies.append(Currency(code=currency.get("short_code", ""), name=currency.get("name", ""), symbol=currency.get("symbol", "")))

                    # Bulk create Currency objects in the database
                    await database_sync_to_async(Currency.objects.bulk_create)(currencies, ignore_conflicts=True)
                    logger.info("Currencies loaded successfully into the database.")

        except aiohttp.ClientError as e:
            logger.error(f"Error fetching data from API: {e}")
        except Exception as e:
            logger.error(f"An error occurred: {e}")

    def handle(self, *args, **kwargs):
        logger.info("Starting the command to load currencies...")
        asyncio.run(self.fetch_currencies())
        logger.info("Command execution finished.")
