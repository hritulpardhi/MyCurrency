from django.db import models
from core.models.base_model import BaseModel

class Providers(BaseModel):
    provider_name = models.CharField(max_length=255, unique=True, db_index=True)
    provider_url = models.URLField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    credentials = models.JSONField(null=True, blank=True)
    priority = models.IntegerField(default=1)    
    
    class Meta:
        managed = True
        db_table = 'providers'