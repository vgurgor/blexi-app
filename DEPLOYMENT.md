# BLEXI App Deployment Guide for Ubuntu

This guide details how to deploy the BLEXI app to an Ubuntu server with HTTPS using Certbot.

## Prerequisites

- Ubuntu server with SSH access
- Domain (cemberci.blexi.co) pointed to your server's IP address
- Node.js and npm installed on the server
- Nginx installed on the server
- Git installed on the server

## Setup Steps

### 1. Clone the Repository

```bash
# Connect to your server via SSH
ssh user@your-server-ip

# Navigate to your preferred directory
cd /var/www

# Clone the repository
git clone https://github.com/your-username/blexi.git cemberci
cd cemberci
```

### 2. Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

### 3. Port Configuration

Since ports 3000 and 3001 are already in use, configure this app to use a different port:

Create an `.env.production` file:

```bash
# Create .env.production file
cat > .env.production << EOF
PORT=3002
EOF
```

Update the `package.json` start script to use the PORT environment variable:

```json
"scripts": {
  "start": "next start -p \${PORT:-3002}"
}
```

### 4. Setup Nginx

Create an Nginx configuration file for your domain:

```bash
sudo nano /etc/nginx/sites-available/cemberci.blexi.co
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name cemberci.blexi.co;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and test the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/cemberci.blexi.co /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Install Certbot and Configure HTTPS

```bash
# Install Certbot and the Nginx plugin
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain and configure SSL certificate
sudo certbot --nginx -d cemberci.blexi.co

# Follow the interactive prompts
# Select option to redirect HTTP to HTTPS
```

### 6. Setup Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application with PM2
cd /var/www/cemberci
pm2 start npm --name "cemberci" -- start

# Set PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $(whoami) --hp $(echo $HOME)
pm2 save
```

### 7. Verify Deployment

- Visit https://cemberci.blexi.co to confirm the application is running correctly
- Check for any errors in the application logs with `pm2 logs cemberci`

## Maintenance

### Updating the Application

```bash
cd /var/www/cemberci
git pull
npm install
npm run build
pm2 restart cemberci
```

### Renewing SSL Certificate

Certbot automatically adds a cron job for renewal. To manually renew:

```bash
sudo certbot renew
```

### Troubleshooting

- Check application logs: `pm2 logs cemberci`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check Nginx configuration: `sudo nginx -t`
- Restart Nginx: `sudo systemctl restart nginx`
- Restart application: `pm2 restart cemberci`