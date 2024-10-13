from django.db import models
from core.models.base_model import BaseModel

class Currency(BaseModel):
    code = models.CharField(max_length=3, unique=True)
    name = models.CharField(max_length=20, db_index=True)
    symbol = models.CharField(max_length=10)
    load_historical_data = models.BooleanField(default=False)

    class Meta:
        managed = True
        db_table = 'currency'

    def __str__(self):
        return f"{self.code} - {self.name}"  # Customize the string representation