#!/bin/bash

echo "Deploying Spendio..."

source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Restarting services..."
sudo systemctl restart spendio

echo "Deployment complete!"
if [ -f .env ]; then
    DOMAIN=$(grep DOMAIN_NAME .env | cut -d '=' -f2)
    if [ ! -z "$DOMAIN" ]; then
        echo "Your app should be available at: https://$DOMAIN"
    fi
fi
