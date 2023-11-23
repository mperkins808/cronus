#!/bin/bash 

## configuration 

if [ -z "$DEFAULT_CONFIG" ]; then 
echo auto setting DEFAULT_CONFIG
export DEFAULT_CONFIG=/app/defaults/defaults.ini
fi 

if [ -z "$OUTPUT_FILE" ]; then 
echo auto setting output file
export OUTPUT_FILE=/app/$NODE_ENV.env
fi 

if [ -z "$CONFIG_PATH" ]; then 
echo auto setting config path
export CONFIG_PATH=/app/defaults
fi 


if [ -z "$OUTPUT_FILE" ]; then 
echo environment variable OUTPUT_FILE not set
exit 1
fi 

if [ -z "$DEFAULT_CONFIG" ]; then 
echo environment variable DEFAULT_CONFIG not set
exit 1
fi 

config-loader 

exit_code=$?

if [ $exit_code != 0 ]; then 
    echo failed to load config 
    exit 1
fi 

if [ -f "$OUTPUT_FILE" ]; then
    # Read each line from the .env file and export as environment variables
    while IFS= read -r line; do
        export "$line"
    done < "$OUTPUT_FILE"

    echo "Environment variables set from $OUTPUT_FILE"
else
    echo "env file does not exist."
fi

cp $CONFIG_PATH/template.prisma ./temp.prisma


if [ "$DOCKER" == "true" ]; then 
    sed "s/DB_PROVIDER_PLACEHOLDER/$DATABASE_TYPE/g" ./temp.prisma > ./temp.prisma.tmp && mv ./temp.prisma.tmp ./temp.prisma
else 
    sed -i '' "s/DB_PROVIDER_PLACEHOLDER/$DATABASE_TYPE/g" ./temp.prisma
fi 

if [ "$DATABASE_TYPE" == "sqlite" ]; then 

    if [ "$DOCKER" == "true" ]; then 
        sed "s|DB_URL_PLACEHOLDER|file:$DATABASE_PATH|g" ./temp.prisma > ./temp.prisma.tmp && mv ./temp.prisma.tmp ./temp.prisma
    else 
        sed -i '' "s|DB_URL_PLACEHOLDER|file:$DATABASE_PATH|g" ./temp.prisma
    fi 
fi 

if [ "$DATABASE_TYPE" == "postgresql" ]; then 
    if [ "$DOCKER" == "true" ]; then 
        sed "s/DB_URL_PLACEHOLDER/env("DATABASE_URL")/g" ./temp.prisma > ./temp.prisma.tmp && mv ./temp.prisma.tmp ./temp.prisma
    else 
        sed -i '' "s/DB_URL_PLACEHOLDER/env("DATABASE_URL")/g" ./temp.prisma
    fi 
fi 

cp ./temp.prisma ./prisma/schema.prisma
rm ./temp.prisma

npx prisma db push 

if [ "$DOCKER" == "true" ]; then 
    npm run start
fi 


