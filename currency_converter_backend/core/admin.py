from django.contrib import admin
from core.models.currency import Currency
from core.models.currency_exchange_rate import CurrencyExchangeRate
from core.models.providers import Providers  # Import the Providers model

class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'symbol', 'load_historical_data')  # Include the flag in list display
    search_fields = ('code', 'name')
    ordering = ('code',)
    
    fieldsets = (
        (None, {
            'fields': ('code', 'name', 'symbol', 'load_historical_data')  # Include the flag here
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:  # If we're editing an existing object
            return ['code']  # Make code field read-only on edit
        return super().get_readonly_fields(request, obj)

class CurrencyExchangeRateAdmin(admin.ModelAdmin):
    list_display = ('source_currency', 'exchanged_currency', 'valuation_date', 'rate_value')
    search_fields = ('source_currency__code', 'exchanged_currency__code')
    list_filter = ('valuation_date', 'source_currency', 'exchanged_currency')
    ordering = ('valuation_date', 'source_currency')
    
class ProvidersAdmin(admin.ModelAdmin):
    list_display = ('provider_name', 'provider_url', 'is_active', 'priority')  # Display fields in the list view
    search_fields = ('provider_name',)  # Add search functionality for provider_name
    list_filter = ('is_active',)  # Add a filter for is_active
    ordering = ('priority',)  # Order by priority

    # Customize the admin form with fieldsets
    fieldsets = (
        (None, {
            'fields': ('provider_name', 'provider_url', 'is_active', 'priority', 'credentials')
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:  # If we're editing an existing object
            return ['provider_url']  # Make provider_url field read-only on edit
        return super().get_readonly_fields(request, obj)

# Register the Providers model with the custom admin class
admin.site.register(Currency, CurrencyAdmin)
admin.site.register(CurrencyExchangeRate, CurrencyExchangeRateAdmin)
admin.site.register(Providers, ProvidersAdmin)



