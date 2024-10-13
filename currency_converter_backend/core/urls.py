from django.urls import path
from core.controller.currency_data_list import CurrencyDataController
from core.controller.exchange_rate import ExchangeRateController
from core.controller.currency_timeseries import CurrencyTimeseriesController


urlpatterns = [
    path('v1/currency_list/', CurrencyDataController.load_currency_data, name="currency_list"),
    # path('v1/exchange_currency/', ExchangeRateController.exchange_rate_view, name='exchange_rate_view'),
    path('v1/convert_multiple_currency/', ExchangeRateController.convert_multiple_currency, name="convert_multiple_currency"),
    # path('v1/currency_timeseries/', CurrencyTimeseriesController.currency_timeseries, name='currency_timeseries'),
    path('v1/multiple_currency_timeseries/', CurrencyTimeseriesController.multiple_currency_timeseries, name='multiple_currency_timeseries'),
]

