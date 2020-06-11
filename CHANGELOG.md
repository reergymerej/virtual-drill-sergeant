# Next

* Include links in message to open web app and mark complete

## Use Case
I hurt my leg, so I want to disable the jumping jacks command for a little
while.

## MVP
Provide SQL to turn it on/off.
* Requires adding an on/off flag.
* This doesn't actually do anything yet, just makes you feel like you're in
    control.

    ```sql
    UPDATE commands
    SET disabled = true
    WHERE id = 9
    ;
    ```


Update the service that gets commands to ignore diabled commands.

  ```sql
    SELECT id, text
    FROM commands
    WHERE NOT disabled
    ;
    ```

We need to handle the situation where everything is disabled.





![4.0.0.png](./4.0.0.png)


# 4.0.0

* Provide log of commands
* Indicate in client which commands were completed
* Segment into two different groups


# 3.2.0

## Changed

* Check status in web client automatically before/after changes


## Added

* Record issued commands



# 3.1.0

## Added

* Status check on web client to see if the drill sergeant is on or off
* A couple new commands

## Changed

* Reorganized src
* Changed to send_message lambda
* Pulling number and commands from DB



# Version 3.0.0


Turn on/off with my phone.
For this, we need Lambda functions to toggle the enabled rule.
We need API Gateway to hit the toggle functions.



## Enable
curl -i -X PUT 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/enable'

## Disable
curl -i -X PUT 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/disable'


# Version 2.0.0

The Python code has been added to a Lambda function.  This function can be
triggered by a Cloud Watch event on a schedule (once an hour).  This means we
can turn it on/off and not worry about keeping my computer on.

```sh
# enable
aws events enable-rule --name CW_rule_cron_job
# disable
aws events enable-rule --name CW_rule_cron_job
```


# Version 1.2.0

## Added

* Variety to commands
* Better setup tools for Python


![1.2.0.png](./1.2.0.png)

# Version 1.1.0

## Added

* Send messages via SMS.


Create a cron job to send the message every hour.

```sh
crontab -e
# Send message at the top of every hour
0 * * * * /usr/local/bin/python3 ~/Desktop/drillseargeant/src/send_message/send_message.py
 ```

## Desired Features

* Variety in commands to make it more interesting.
* Record of commands executed

# Version 1.0.0

Add reminders to the calendar.  That's not so bad really.

![1.0.0.png](./1.0.0.png)

Desired Feature: Send reminder as SMS instead of having it on the calendar.
