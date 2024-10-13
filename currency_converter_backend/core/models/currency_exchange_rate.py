from django.db import models
from core.models.currency import Currency
from core.models.base_model import BaseModel

class CurrencyExchangeRate(BaseModel):  # Import Model as models.Model
    source_currency = models.ForeignKey(Currency, related_name='source_exchanges', on_delete=models.CASCADE)
    exchanged_currency = models.ForeignKey(Currency, related_name='target_exchanges', on_delete=models.CASCADE)
    valuation_date = models.DateField(db_index=True)
    rate_value = models.DecimalField(decimal_places=6, max_digits=18, db_index=True)

    class Meta:
        managed = True
        db_table = 'currency_exchange_rate'