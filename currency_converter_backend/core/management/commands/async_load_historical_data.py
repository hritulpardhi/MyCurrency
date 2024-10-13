import time

from django.core.management.base import BaseCommand
from core.models.currency import Currency
from core.models.currency_exchange_rate import CurrencyExchangeRate
from channels.db import database_sync_to_async
from datetime import datetime, timedelta
from core.models.providers import Providers
import asyncio
import aiohttp
import logging
from asgiref.sync import sync_to_async

# Set up logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Load historical currency exchange rate data'

    async def fetch_exchange_rate(self, session, url, base_currency, symbols, date):
        logger.debug(f"Fetching exchange rates from {url} for {base_currency} to {symbols} on {date}...")
        try:
            async with session.get(url) as response:
                data = await response.json()
                logger.debug(f"Raw response for {base_currency} to {symbols} on {date}: {data}")

                # Extract the rates from the correct part of the response
                response_data = data.get('response', {})
                rates = response_data.get('rates', {})

                # Check if rates exist for the requested symbols
                if not rates:
                    logger.warning(f"No rates found for {base_currency} on {date}.")
                    return []

                # Construct the exchange rate dictionary
                exchange_rate = []
                for symbol in symbols.split(','):
                    if symbol in rates:
                        exchange_rate.append({
                            "source_currency": base_currency,
                            "exchanged_currency": symbol,
                            "valuation_date": date,
                            "rate_value": rates[symbol]
                        })
                        logger.info(f"Rate found: {base_currency} to {symbol} on {date}: {rates[symbol]}")

                return exchange_rate

        except Exception as e:
            logger.error(f"An error occurred while fetching exchange rates for {base_currency}: {e}")
            return []

    async def save_data(self, exchange_data):
        if not exchange_data:
            logger.info("No exchange data to save.")
            return

        logger.info(f"Preparing to save {len(exchange_data)} exchange rates...")

        @database_sync_to_async
        def create_or_update_exchange_rates(data):
            for item in data:
                source_currency = Currency.objects.get(code=item["source_currency"])
                exchanged_currency = Currency.objects.get(code=item["exchanged_currency"])

                # Use get_or_create to handle the case of both creation and updating
                exchange_rate, created = CurrencyExchangeRate.objects.update_or_create(
                    source_currency=source_currency,
                    exchanged_currency=exchanged_currency,
                    valuation_date=item["valuation_date"],
                    defaults={'rate_value': item["rate_value"]}
                )

                if created:
                    logger.info(f"Created new exchange rate: {exchange_rate}")
                else:
                    logger.info(f"Updated exchange rate: {exchange_rate}")

        await create_or_update_exchange_rates(exchange_data)
        logger.info(f'Saved {len(exchange_data)} exchange rates.')

    async def load_exchange_rates(self):
        logger.info("Loading exchange rates...")

        # Fetch active providers asynchronously
        active_providers = await sync_to_async(lambda: list(Providers.objects.filter(is_active=True).order_by('priority')))()
        logger.info(f"Active providers fetched: {len(active_providers)}")

        # Fetch currencies with load_historical_data=True
        currencies = await sync_to_async(lambda: list(Currency.objects.filter(load_historical_data=True)))()
        
        # Extract currency codes
        currencies = [currency.code for currency in currencies]
        logger.info(f"Currencies selected for loading historical data: {currencies}")

        start_date = datetime(2024, 9, 1)  # CHANGE DATE TO LOAD THE DATA
        end_date = datetime.now()
        delta = timedelta(days=1)

        dates = []
        while start_date <= end_date:
            dates.append(start_date.strftime('%Y-%m-%d'))
            start_date += delta
        logger.info(f"Date range for exchange rates: {len(dates)} days from {dates[0]} to {dates[-1]}.")

        async with aiohttp.ClientSession() as session:
            exchange_data = []

            # Try fetching from each provider
            for provider in active_providers:
                logger.info(f'Trying provider: {provider.provider_name}')
                if provider.provider_name == "CurrencyBeacon":
                    url_template = f'{provider.provider_url}historical?api_key={provider.credentials["api-key"]}&base={{}}&symbols={{}}&date={{}}'
                else:
                    url_template = f'{provider.provider_url}historical?access_key={provider.credentials["api-key"]}&base={{}}&symbols={{}}&date={{}}'

                for base_currency in currencies:
                    exchanged_currencies = [currency for currency in currencies if currency != base_currency]
                    symbols = ','.join(exchanged_currencies)

                    for date in dates:
                        url = url_template.format(base_currency, symbols, date)
                        logger.debug(f"Generated URL for {base_currency} to {symbols} on {date}: {url}")
                        exchange_rate = await self.fetch_exchange_rate(session, url, base_currency, symbols, date)
                        if exchange_rate:
                            exchange_data.extend(exchange_rate)

                if exchange_data:  # If we successfully fetched data, break out of the loop
                    logger.info(f"Data fetched for {len(exchange_data)} exchange rates from {provider.provider_name}.")
                    break

            await self.save_data(exchange_data)
            logger.info('Data saving process completed.')

    def handle(self, *args, **kwargs):
        logger.info('Starting the command to load exchange rates...')
        
        # Capture start time
        start_time = time.time()
        
        asyncio.run(self.load_exchange_rates())
        
        # Capture end time
        end_time = time.time()
        
        # Calculate and log duration
        duration = end_time - start_time
        logger.info(f'Command execution finished in {duration:.2f} seconds.')
