For dev, install psycopg2 as normal, `pipenv install psycopg2`.  When creating a
deployment package, replace the dependency with one that works on Lambda.

Use Python 3.7.
`pipenv --python 3.7`

Install boto3 as a dev dep.
`pipenv install boto3 -d`


## Build Steps

```sh
# if needed
rm -rf build
mkdir build

# install deps into build/
pipenv lock -r > requirements.txt
pip install -r requirements.txt --no-deps -t build

# replace the AWS version
cp -r ../../lib/psycopg2 ./build/

# add source
cp *.py ./build/

# create package
cd build
rm ../package.zip
zip -r ../package.zip .
