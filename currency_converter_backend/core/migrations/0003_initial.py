# Generated by Django 5.1.2 on 2024-10-12 11:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0002_remove_currencyexchangerate_source_currency_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Currency',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('code', models.CharField(max_length=3, unique=True)),
                ('name', models.CharField(db_index=True, max_length=20)),
                ('symbol', models.CharField(max_length=10)),
            ],
            options={
                'db_table': 'currency',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='CurrencyExchangeRate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('valuation_date', models.DateField(db_index=True)),
                ('rate_value', models.DecimalField(db_index=True, decimal_places=6, max_digits=18)),
                ('exchanged_currency', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='target_exchanges', to='core.currency')),
                ('source_currency', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='source_exchanges', to='core.currency')),
            ],
            options={
                'db_table': 'currency_exchange_rate',
                'managed': True,
            },
        ),
    ]
