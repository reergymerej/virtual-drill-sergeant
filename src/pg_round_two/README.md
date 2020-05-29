
## Build Steps

```sh
# if needed
rm -rf build
mkdir build

# install deps into build/
pipenv lock -r > requirements.txt
pip install -r requirements.txt --no-deps -t build

# replace the AWS version
cp ../../psycopg2 ./build/

# add source
cp *.py .

# create package
cd build
rm package.zip
zip -r ../package.zip .
```


## Lambda Cheatsheet

aws lambda create-function \
  --function-name pg_round_two \
  --runtime python3.7 \
  --role arn:aws:iam::463986597363:role/lambdavpc \
  --handler lambda_function.main \
  --zip-file fileb://package.zip


aws lambda invoke \
  --function-name pg_round_two \
   out

aws lambda update-function-code \
  --function-name pg_round_two \
  --zip-file fileb://package.zip
