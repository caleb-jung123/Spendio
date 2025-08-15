from django.core.management.base import BaseCommand
import os
import re

class Command(BaseCommand):
    help = 'Check if required environment variables are set without exposing their values'

    def add_arguments(self, parser):
        parser.add_argument(
            '--check',
            type=str,
            help='Check a specific environment variable (will be masked)'
        )

    def handle(self, *args, **options):
        if options['check']:
            var_name = options['check'].upper()
            value = os.getenv(var_name)
            if value:
                masked_value = self.mask_value(value)
                self.stdout.write(
                    self.style.SUCCESS(f'{var_name}: SET ({masked_value})')
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f'{var_name}: NOT SET')
                )
        else:

            required_vars = ['OPEN_AI_API_KEY', 'SECRET_KEY']
            
            for var in required_vars:
                value = os.getenv(var)
                if value:
                    masked_value = self.mask_value(value)
                    self.stdout.write(
                        self.style.SUCCESS(f'{var}: SET ({masked_value})')
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(f'{var}: NOT SET')
                    )

    def mask_value(self, value):
        """Safely mask sensitive values"""
        if len(value) <= 8:
            return '***'
        return value[:4] + '*' * (len(value) - 8) + value[-4:]
