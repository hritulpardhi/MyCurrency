import json
import traceback
from asgiref.sync import sync_to_async
from datetime import datetime
from django.conf import settings
from django.http import JsonResponse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from core.models import CurrencyExchangeRate, Currency
from core.services.exchange_rate_service import get_exchange_rate_data

class ExchangeRateController:
    @csrf_exempt
    async def convert_multiple_currency(request):
        if request.method == "POST":
            json_data = json.loads(request.body.decode('utf-8'))
            try:
                source_currency_code = json_data.get('source_currency', 'USD')
                exchanged_currencies = json_data.get('exchanged_currencies', ['EUR'])
                valuation_date = json_data.get('valuation_date', '2024-01-01')
                provider = json_data.get('provider', settings.CURRENT_PROVIDER)
                amount = json_data.get('amount', '1')
                results = {}

                # Fetch the source currency instance
                source_currency = await sync_to_async(Currency.objects.get)(code=source_currency_code)

                for exchanged_currency_code in exchanged_currencies:
                    # Attempt to get the rate from the database first
                    rate_entry = await sync_to_async(list)(
                        CurrencyExchangeRate.objects.filter(
                            source_currency=source_currency,
                            exchanged_currency__code=exchanged_currency_code,
                            valuation_date=valuation_date
                        )
                    )  # Convert queryset to a list and await

                    if rate_entry:
                        rate = rate_entry[0].rate_value  # Access the first element if available
                        print("FETCHED FROM DB")
                        results[exchanged_currency_code] = {
                            "rate": rate,
                            "converted_amount": round(float(rate) * float(amount), 3),
                            "fetched_from": f"Database ({valuation_date})"
                        }
                    else:
                        try:
                            # Fetch the rate from the external API
                            rate = await get_exchange_rate_data(source_currency_code, exchanged_currency_code, amount, valuation_date, provider)
                            
                            # Fetch the exchanged currency instance
                            exchanged_currency = await sync_to_async(Currency.objects.get)(code=exchanged_currency_code)

                            # Save the rate data to the database
                            currency_exchange_rate = CurrencyExchangeRate(
                                source_currency=source_currency,
                                exchanged_currency=exchanged_currency,
                                valuation_date=valuation_date,
                                rate_value=rate
                            )
                            await sync_to_async(currency_exchange_rate.save)()  # Save the entry

                            results[exchanged_currency_code] = {
                                "rate": rate,
                                "converted_amount": float(rate) * float(amount),
                                "fetched_from": f'API ({datetime.now().strftime("%Y-%m-%d")})'
                            }
                        except ValueError as e:
                            results[exchanged_currency_code] = {"error": str(e)}
                        except IntegrityError:
                            results[exchanged_currency_code] = {"error": "Rate already exists for this currency pair on this date."}
                        except Exception as e:
                            results[exchanged_currency_code] = {"error": "An error occurred while fetching the rate."}

                return JsonResponse(results, status=200)

            except Exception as e:
                print("Error loading currency data:", e)
                traceback.print_exc()
                return JsonResponse({'error': 'Failed to load currency data'}, status=500)
        else:
            return JsonResponse({"error": "Invalid HTTP method"}, status=405)
