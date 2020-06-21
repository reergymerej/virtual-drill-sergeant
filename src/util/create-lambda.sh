#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ -f $DIR/lambda-template/.env ]
then
  export $(cat $DIR/lambda-template/.env | sed 's/#.*//g' | xargs)
fi

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
  --environment Variables="{DB_HOST=$DB_HOST,DB_PASSWORD=$DB_PASSWORD}" \
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
echo "$DB_HOST"
echo "$DB_PASSWORD"

exit 1

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
  --environment Variables="{DB_HOST=$DB_HOST,DB_PASSWORD=$DB_PASSWORD}" \
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
