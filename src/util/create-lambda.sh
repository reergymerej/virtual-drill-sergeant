#!/usr/bin/env bash

FN_NAME=$1

echo "Creating Lambda: $FN_NAME"

cp -r ../util/lambda-template ./$FN_NAME
cd ./$FN_NAME

echo "Installing dependencies"
pipenv install --dev

echo "Trial run"
pipenv run python main.py

echo "Packaging"
zip package.zip main.py

echo "Deploying"
aws lambda create-function \
  --function-name $FN_NAME \
  --runtime python3.7 \
  --environment Variables="{DB_HOST=virtual-drill-sergeant.cl2pih0c6gge.us-east-1.rds.amazonaws.com,DB_PASSWORD=XuNjz2RhNzzvW3bvcIRa}" \
  --layers arn:aws:lambda:us-east-1:463986597363:layer:Postgres:7 \
  --role arn:aws:iam::463986597363:role/lambdavpc \
  --handler main.lambda_handler \
  --tags project=vds \
  --zip-file fileb://package.zip

echo "Invoking in AWS"
aws lambda invoke \
  --function-name $FN_NAME \
  --cli-binary-format raw-in-base64-out \
  --payload file://event.json \
  out \
  --log-type Tail \
  --query 'LogResult' \
  --output text | base64 --decode
