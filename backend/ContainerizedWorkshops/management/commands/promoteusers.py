from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Make users into admin users"

    def add_arguments(self, parser):
        parser.add_argument("user_emails", nargs="+", type=str)

    def handle(self, *args, **options):
        for user_email in options["user_emails"]:
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                raise CommandError('User "%s" does not exist' % user_email)
            user.is_staff = True
            user.is_superuser = True
            user.save()

            self.stdout.write(
                self.style.SUCCESS(
                    'Successfully promoted user "%s"' % user_email)
            )
