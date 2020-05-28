# Next


Turn on/off with my phone.



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
