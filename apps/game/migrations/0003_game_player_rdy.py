# Generated by Django 5.1.3 on 2025-03-28 07:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='player_rdy',
            field=models.IntegerField(default=0),
        ),
    ]
