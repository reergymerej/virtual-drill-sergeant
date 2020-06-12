# Virtual Drill Sergeant

Wouldn't it be cool if a DS could text you throughout the day to help you stay
in shape?


## User Manual

To disable commands that may be issued, locate the "command_log_id" and use it
on the "disable command" form in the web client.

To find your "command_log_id,"

### From a Message

![command log id from message](./resources/command_log_id_message.png)

Look for the "log-id" part of the url.


### Self Service

If you're nasty, you can use curl instead.

```sh
curl -X PUT 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/commands/disable/command_log_id'
```


## Wishlist


* Control over which commands are issued
  select screen to decide on exercises I'd like to see that I can change at any
  time

* More flexibility over scheduling (ex: every 30 minutes after 6 pm)

* Hierarchy or categorization of commands
  exercise type and severity




* Use shortened urls in text messages.
* Make it easier to mark a command as completed.
  text back a word to mark complete
* segment log by days
* share db across lambda functions to run locally
* Use CloudFormation to create a stack for this.  This will help me learn AWS
    and possibly allow for whitelabeling this idea.
