from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from faker import Faker
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken

class Command(BaseCommand):
    help = 'Creates fake users for testing with tokens'

    def add_arguments(self, parser):
        parser.add_argument('total', type=int, help='Number of users to create')

    def handle(self, *args, **kwargs):
        total = kwargs['total']
        User = get_user_model()
        fake = Faker()

        with transaction.atomic():
            for i in range(total):
                username = fake.user_name()
                email = fake.email()
                nickname = fake.name()

                user = User.objects.create(
                    username=username,
                    email=email,
                    nickname=nickname,
                )
                
                refresh = RefreshToken.for_user(user)
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'id: {user.id}\n'
                        f'username: {username}\n'
                        f'email: {email}\n'
                        f'nickname: {nickname}\n'
                        f'access_token: {refresh.access_token}\n'
                        f'refresh_token: {refresh}\n'
                    )
                ) 