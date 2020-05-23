# Next

## Added

* Variety to commands
* Better setup tools for Python


# Version 1.1.0

## Added

* Send messages via SMS.


Create a cron job to send the message every hour.

```sh
crontab -e
# Send message at the top of every hour
0 * * * * /usr/local/bin/python3 ~/Desktop/drillseargeant/src/send_message.py
 ```

## Desired Features

* Variety in commands to make it more interesting.
* Record of commands executed

# Version 1.0.0

Add reminders to the calendar.  That's not so bad really.

![1.0.0.png](./1.0.0.png)

Desired Feature: Send reminder as SMS instead of having it on the calendar.
