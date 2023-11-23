#!/bin/bash

length=64

random_string=$(head -c "$length" /dev/urandom | base64)

random_string=$(echo "$random_string" | tr -d '+/=')

random_hex=$(hexdump -vn32 -e'4/4 "%08X" 1 "\n"' /dev/urandom)

echo "DATABASE_ENCRYPTION_KEY=$random_hex"
echo "SESSION_SIGNING_KEY=$random_string"