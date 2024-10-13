from abc import ABC, abstractmethod
from datetime import datetime
import random
import httpx
from django.conf import settings
from core.models.providers import Providers  # Adjust import based on your app structure
import logging
from asgiref.sync import sync_to_async

# Set up logging
logger = logging.getLogger(__name__)

class CurrencyProvider(ABC):
    @abstractmethod
    async def get_exchange_rate(self, source_currency: str, exchanged_currency: str, valuation_date: datetime, amount: str):
        """Retrieve the exchange rate."""
        pass

class CurrencyBeacon(CurrencyProvider):
    def __init__(self, provider_data):
        self.api_key = provider_data.credentials['api-key']  # Ensure this is correct
        self.base_url = provider_data.provider_url  # Ensure this is correct

    async def get_exchange_rate(self, source_currency: str, exchanged_currency: str, valuation_date: datetime, amount: str):
        logger.debug("Fetching exchange rate from CurrencyBeacon...")
        try:
            url = f"{self.base_url}convert?api_key={self.api_key}&from={source_currency}&to={exchanged_currency}&amount={amount}"
            logger.debug(f"URL: {url}")

            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                json_response = response.json()
                logger.debug(f"Response: {json_response}")

                if json_response.get('value'):
                    print("CurrencyBeacon API response", json_response)
                    return round(json_response.get('value'), 2)
                return 'N/A'
        except Exception as e:
            logger.error(f"Error loading currency data from CurrencyBeacon: {e}")
            return await MockCurrencyProvider().get_exchange_rate(source_currency, exchanged_currency, valuation_date, amount)

class MockCurrencyProvider(CurrencyProvider):
    def __init__(self, provider_data):
        # Optional: can use provider_data if needed
        pass
    
    async def get_exchange_rate(self, source_currency: str, exchanged_currency: str, valuation_date: datetime, amount: str):
        mock_rate = round(random.uniform(0.5, 1.5), 2)
        logger.debug(f"Mock rate generated: {mock_rate} for {source_currency} to {exchanged_currency}")
        return mock_rate


async def get_exchange_rate_data(source_currency: str, exchanged_currency: str, amount: str, valuation_date: str, provider_name: str):
    try:
        logger.info("Fetching exchange rate data...")
        logger.debug(f"Source: {source_currency}, Exchanged: {exchanged_currency}, Amount: {amount}, Valuation Date: {valuation_date}, Provider: {provider_name}")
        
        # Use sync_to_async to wrap the ORM call
        selected_provider = await sync_to_async(lambda: Providers.objects.get(provider_name=provider_name, is_active=True))()
        
        if selected_provider.provider_name == "CurrencyBeacon":
            provider_instance = CurrencyBeacon(selected_provider)
        else:
            provider_instance = MockCurrencyProvider(selected_provider)  # You may choose to use data if needed
        
        logger.debug(f"Selected Provider: {selected_provider.provider_name}")
        valuation_date_obj = datetime.strptime(valuation_date, '%Y-%m-%d')
        return await provider_instance.get_exchange_rate(source_currency, exchanged_currency, valuation_date_obj, amount)
    except Exception as e:
        logger.error(f"Error in getting exchange rate data: {e}")
        raise  # Optionally re-raise the exception for further handling
