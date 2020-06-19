# Create Lambda

## Local

    cp -r ../util/lambda-template ./foo
    cd ./foo
    pipenv install --dev


## Run

    pipenv run python main.py


## Create

    zip package.zip main.py


## Remote

    aws lambda create-function \
    --function-name foo \
    --runtime python3.7 \
    --environment Variables="{DB_HOST=virtual-drill-sergeant.cl2pih0c6gge.us-east-1.rds.amazonaws.com,DB_PASSWORD=XuNjz2RhNzzvW3bvcIRa}" \
    --layers arn:aws:lambda:us-east-1:463986597363:layer:Postgres:7 \
    --role arn:aws:iam::463986597363:role/lambdavpc \
    --handler main.lambda_handler \
    --tags project=vds \
    --zip-file fileb://package.zip


## Invoke

aws lambda invoke \
  --function-name foo \
  --cli-binary-format raw-in-base64-out \
  --payload file://event.json \
  out \
  --log-type Tail \
  --query 'LogResult' \
  --output text | base64 --decode
