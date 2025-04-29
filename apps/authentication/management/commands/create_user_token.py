from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from faker import Faker
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken

class Command(BaseCommand):
    help = 'Creates a user token'

    def add_arguments(self, parser):
        parser.add_argument('user_id', type=int, help='User ID')

    def handle(self, *args, **kwargs):
        user_id = kwargs['user_id']
        User = get_user_model()
        fake = Faker()

        with transaction.atomic():
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'User with ID {user_id} not found'))
                return

            refresh = RefreshToken.for_user(user)
            
            self.stdout.write(
            self.style.SUCCESS(
                f'id: {user.id}\n'
                f'username: {user.username}\n'
                f'email: {user.email}\n'
                f'nickname: {user.nickname}\n'
                f'access_token: {refresh.access_token}\n'
                f'refresh_token: {refresh}'
            )
        ) 