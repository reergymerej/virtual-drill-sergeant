## Install

```sh
pipenv install
```

## Run

```sh
pipenv run python send_message/send_message.py
```

```sh
# run tests
pipenv run ptw

# coverage
pipenv run coverage run --source=send_message -m pytest
pipenv run coverate html
open htmlcov/index.html

```

# Send message at the top of every hour
0 * * * * /usr/local/bin/python3 ~/Desktop/drillseargeant/send_message/send_message.py

