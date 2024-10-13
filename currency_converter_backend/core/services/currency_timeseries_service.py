# services.py

import requests
from django.conf import settings

from core.models import Currency, CurrencyExchangeRate


class CurrencyTimeseriesService:
    API_URL = f"https://api.currencybeacon.com/v1/timeseries?api_key={settings.CURRENCY_BEACON_API_KEY}"

    @staticmethod
    def fetch_currency_timeseries(base_currency_code, to_currencies, start_date, end_date):
        results = {}
        for to_currency_code in to_currencies:
            base_currency = Currency.objects.filter(code=base_currency_code).first()
            to_currency = Currency.objects.filter(code=to_currency_code).first()

            if not base_currency:
                return {"error": f"Base currency '{base_currency_code}' not found"}, 400
            if not to_currency:
                return {"error": f"Target currency '{to_currency_code}' not found"}, 400

            # Query the database for the exchange rates
            exchange_rates = CurrencyExchangeRate.objects.filter(source_currency=base_currency, exchanged_currency=to_currency, valuation_date__range=[start_date, end_date]).order_by("valuation_date")

            if exchange_rates.exists():
                first_rate = exchange_rates.first()
                last_rate = exchange_rates.last()

                # Check if the database records match the requested range
                if first_rate.valuation_date > start_date or last_rate.valuation_date < end_date:
                    print(f"Data not matching with the requested range. Fetching from API for: {to_currency_code}")
                    results[to_currency_code] = CurrencyTimeseriesService.fetch_from_api(base_currency_code, to_currency_code, start_date, end_date)
                else:
                    results[to_currency_code] = {"rates": [{"valuation_date": rate.valuation_date.isoformat(), "rate_value": str(rate.rate_value)} for rate in exchange_rates]}
            else:
                print(f"No data found in DB, fetching from API for: {to_currency_code}")
                results[to_currency_code] = CurrencyTimeseriesService.fetch_from_api(base_currency_code, to_currency_code, start_date, end_date)

        return results

    @staticmethod
    def fetch_from_api(base_currency_code, to_currency_code, start_date, end_date):
        url = f"{CurrencyTimeseriesService.API_URL}&base={base_currency_code}&start_date={start_date}&end_date={end_date}&symbols={to_currency_code}"
        response = requests.get(url)
        if response.status_code == 200:
            return parse_api_response(response.json(), base_currency_code, to_currency_code)
        else:
            return {"error": "Failed to fetch data from Currency Beacon API", "status": response.status_code}


def parse_api_response(api_data, base_currency_code, target_currency_code):
    """Parse the API response to a uniform format."""
    parsed_results = {"rates": []}
    if "response" in api_data:
        rates_data = api_data["response"]
        for date, rates in rates_data.items():
            if target_currency_code in rates:
                parsed_results["rates"].append({"valuation_date": date, "rate_value": str(rates[target_currency_code])})  # Ensure the rate is a string
    else:
        return {"error": "Unexpected API response format"}

    return parsed_results
