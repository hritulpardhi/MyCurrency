import traceback
from django.http import JsonResponse
from core.models import Currency
from core.serializers.currency_serializer import CurrencySerializer


class CurrencyDataController:
    def load_currency_data(request):
        if request.method == "GET":
            try:
                queryset = Currency.objects.all()
                serializer_class = CurrencySerializer(queryset, many=True)
                return JsonResponse(serializer_class.data, safe=False, status=200)
            except Exception as e:
                print("Error loading currency data:", e)
                traceback.print_exc()
                return JsonResponse({'error': 'Failed to load currency data'}, status=500)