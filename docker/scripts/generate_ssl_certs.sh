#!/bin/bash

# Script to generate self-signed SSL certificates for local development
# Author: ft_transcendence team
# Usage: ./generate_ssl_certs.sh [domain]

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Set default values
DOMAIN=${1:-localhost}
SSL_DIR="docker/nginx/ssl"
COUNTRY="FR"
STATE="Paris"
LOCALITY="Paris"
ORGANIZATION="42 School"
ORGANIZATIONAL_UNIT="ft_transcendence"
EMAIL="admin@example.com"
DAYS=365

# Create SSL directory if it doesn't exist
if [ ! -d "$SSL_DIR" ]; then
    echo -e "${YELLOW}Creating SSL directory at $SSL_DIR...${NC}"
    mkdir -p "$SSL_DIR"
fi

echo -e "${GREEN}Generating SSL certificates for domain: ${YELLOW}$DOMAIN${NC}"

# Generate private key and certificate
echo -e "${YELLOW}Generating private key and certificate...${NC}"
openssl req -x509 -nodes -days $DAYS -newkey rsa:2048 \
    -keyout "$SSL_DIR/nginx.key" \
    -out "$SSL_DIR/nginx.crt" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$LOCALITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=$DOMAIN/emailAddress=$EMAIL"

# Check if certificate generation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Certificate and private key generated successfully.${NC}"
else
    echo -e "${RED}Failed to generate certificate and private key.${NC}"
    exit 1
fi

# Generate Diffie-Hellman parameters
echo -e "${YELLOW}Generating Diffie-Hellman parameters (this may take a few minutes)...${NC}"
openssl dhparam -out "$SSL_DIR/dhparam.pem" 2048

# Check if DH param generation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Diffie-Hellman parameters generated successfully.${NC}"
else
    echo -e "${RED}Failed to generate Diffie-Hellman parameters.${NC}"
    exit 1
fi

# Display certificate information
echo -e "${YELLOW}Certificate Information:${NC}"
openssl x509 -text -noout -in "$SSL_DIR/nginx.crt" | grep -E "Subject:|Issuer:|Not Before:|Not After :" | sed "s/^[ \t]*//g"

echo -e "${GREEN}All SSL files have been generated in $SSL_DIR${NC}"
echo -e "${YELLOW}Files:${NC}"
ls -la "$SSL_DIR"

echo -e "${GREEN}Done! Your ft_transcendence project is now ready for HTTPS.${NC}"
echo -e "${YELLOW}Note: Since this is a self-signed certificate, browsers will show a security warning.${NC}"
echo -e "${YELLOW}To use the certificate, make sure Docker is configured properly with the SSL volumes.${NC}" 