# Generated by Django 5.1.2 on 2024-10-12 11:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='currencyexchangerate',
            name='source_currency',
        ),
        migrations.RemoveField(
            model_name='currencyexchangerate',
            name='exchanged_currency',
        ),
        migrations.DeleteModel(
            name='Currency',
        ),
        migrations.DeleteModel(
            name='CurrencyExchangeRate',
        ),
    ]
