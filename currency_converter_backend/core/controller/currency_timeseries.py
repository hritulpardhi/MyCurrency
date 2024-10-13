import json
import traceback
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from core.services.currency_timeseries_service import CurrencyTimeseriesService
from datetime import datetime

class CurrencyTimeseriesController:
    @csrf_exempt
    def multiple_currency_timeseries(request):
        if request.method == "POST":
            json_data = json.loads(request.body.decode('utf-8'))
            print("multiple_currency_timeseries Request Data", json_data)
            try:
                base_currency_code = json_data.get('base_currency')
                to_currencies = json_data.get('to_currencies')
                start_date_str = json_data.get('start_date')
                end_date_str = json_data.get('end_date')

                if not base_currency_code or not to_currencies or not start_date_str or not end_date_str:
                    return JsonResponse({"error": "Missing required parameters"}, status=400)

                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

                results = CurrencyTimeseriesService.fetch_currency_timeseries(base_currency_code, to_currencies, start_date, end_date)
                return JsonResponse(results)

            except Exception as e:
                print("multiple_currency_timeseries : Error loading currency data:", e)
                traceback.print_exc()
                return JsonResponse({'error': 'Failed to load currency data'}, status=500)
        else:
            return JsonResponse({"error": "Invalid HTTP method"}, status=405)
