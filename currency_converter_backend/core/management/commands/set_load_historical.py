from django.core.management.base import BaseCommand
from core.models.currency import Currency

class Command(BaseCommand):
    help = 'Set load_historical_data flag to True for specified currencies'

    def handle(self, *args, **kwargs):
        currency_codes = ['EUR', 'CHF', 'USD', 'GBP']
        
        updated_count = 0
        for code in currency_codes:
            try:
                currency = Currency.objects.get(code=code)
                currency.load_historical_data = True
                currency.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f"Updated {currency.name} ({code}) to load historical data."))
            except Currency.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Currency with code {code} does not exist."))

        self.stdout.write(self.style.SUCCESS(f'Updated {updated_count} currencies to load historical data.'))
