# Fri Jun 12 19:46:58 PDT 2020
## Control over which commands are issued

select screen to decide on exercises I'd like to see that I can change at any
time

This will solve problems 1 and 2.  Add a simple list that shows all commands.
Enable/disable them individually.  This requires a service to update by
command id instead of log id.  That requires a new endpoint.  Create these,
update the UI, and revel in the glory.

curl -X PATCH https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/1/commands/9 \
  -i \
  --header 'Content-Type: application/json' \
  --data '{"disabled":false}'


# Sat Jun 13 07:28:06 PDT 2020

## Everyone is sharing the same commands list.

command list is used to decide what to send to user
Instead of a single list, add another dimension for users.  Keep track of which
commands state per user.

We'll either need

commands -> enabled state per user -> commands and enabled state

or

Use a single list of commands w/ user id

If there are unique lists, we'd have to create a new empty or seeded list for
new users.

MVP - What's the simplest way to solve our solution?

Add a user dimension to the "get commands" query.

    commands -> user_commands <- phone

I've got a lookup table so I can find commands per user and separate their
"disabled" state.

    -- Get commands for user 1.
    select user_commands.id,
            commands.text,
            user_commands.disabled
    from user_commands
    join commands on commands.id = user_commands.command_id
    where user_commands.user_id = 1
    ;

    -- Disable command for a user
    update user_commands
        SET disabled = true
        WHERE user_commands.id = 2
        RETURNING id, disabled
    ;

x TODO: Update query to alter disabled state (from commands table to
user_commands).
x TODO: Remove the "disabled" field from the command table.
X TODO: Remove the enable/disable by log endpoints and code.

How does this change the command log?


        INSERT INTO command_log(user_commands_id)
        VALUES (5)
        ;


    select command_log.id
            ,command_log.created_at
            ,command_log.executed
            ,commands.text
    --	,user_commands.user_id
    --	,numbers.phone
    from command_log
    join user_commands on user_commands.id = command_log.user_commands_id
    join commands on commands.id = user_commands.command_id
    join numbers on numbers.id = user_commands.user_id
    ;


I've created a new user #4 to use for dev and testing.  I really need separate
dev and prod.


Key (command_id)=(15) is not present in table "commands"
When adding to the command_log, if fails.  We're trying to use the
user_command.id instead of command.id.

x Add a user_commands.id field.
x Back fill it.
x Make command.id nullable.
x Update service to insert null command.id.
x Remove command.id after transition.

x Create query to get commands per user

        select user_commands.id
        ,commands.text
        ,user_commands.disabled
        from user_commands
        join commands on commands.id = user_commands.command_id
        where user_commands.user_id = 1
        ;


New endpoint to get commands by user.
https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/3/commands
https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/1/commands

x Trash old commands endpoints

# Sun Jun 14 07:18:14 PDT 2020


* When I add a new command, it does not show in the users' lists.

        select user_commands.id
        ,commands.text
        ,user_commands.disabled
        from user_commands
        join commands on commands.id = user_commands.command_id
        where user_commands.user_id = {user_id}

It's joining on the users' commands first.


How do you work with "dev" lambdas when you're not ready to replace prod?


When trying to enable a command that has not been assigned to the user yet, we
try and PATCH the user command.  It does not exist, though, so it fails.

https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/1/commands/null

Instead, we need to _create_ the new user command.

# Sun Jun 14 15:22:49 PDT 2020

Make it easier to create commands.
* create SQL
      insert into commands (text)
      values ('Hello')

* endpoint
  POST https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/1/commands
  This is already user-commands.
  POST https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/commands
  curl -X POST "https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/commands" -i

* lambda
  curl -X POST "https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/commands" -i \
    --data-raw '{"text":"from curl"}'

  curl -X POST

* client


# Tue Jun 16 21:17:37 PDT 2020

How will we group commands?

* Create groups
* Add commands to groups
* Turn commands on/off by group

```sql
  ----------------------
  -- user command groups

  select *
  from numbers
  ;

  -- Create new command group
  --insert into user_command_groups (user_id, name)
  --values (1, 'arms')
  --;

  select *
  from user_command_groups ucg
  ;

  select *
  from commands
  ;

  -- Add values to user command group
  --insert into ucg_values (user_command_group_id, user_command_id)
  --values (2, 10)
  --,(2, 5)
  --,(2, 6)
  --;

  -- Get command groups for a user
  select *
  from user_command_groups ucg
  where ucg.user_id = 1
  ;

  -- Get group list
  select ucg.id
  ,ucg.name
  ,c.text
  from user_command_groups ucg
  join ucg_values v on v.user_command_group_id = ucg.id
  join commands c on c.id = v.user_command_id
  where ucg.user_id = 1
  --and ucg.id = 2
  ;

  select *
  from user_commands uc
  where uc.user_id = 1
  ;


  -- Enable/disable based on group.
  update user_commands
  set enabled = (
          command_id in (
                  -- Get commands in group
                  select v.user_command_id
                  from user_command_groups ucg
                  join ucg_values v on v.user_command_group_id = ucg.id
                  where ucg.id = 2
          )
  )
  where user_id = 1
  ;

# Wed Jun 17 13:18:08 PDT 2020

I'm not getting messages anymore.  In
https://console.aws.amazon.com/sns/v3/home?region=us-east-1#/mobile/text-messaging
I can see 9 failed attempts for "promotional."  How do I make them
transactional?

Well, they are still failing, but now as transactional.

The providerResponse should shed some light.


Guess I have to wait 24 hours to see what the result is.


# Wed Jun 17 18:58:03 PDT 2020


curl -X POST https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/{phone}/commands/group \
  -i \
  --header 'Content-Type: application/json' \
  --data '{"name":"some cool group"}'

# Fri Jun 19 10:59:34 PDT 2020

https://docs.aws.amazon.com/cli/latest/reference/lambda/update-function-configuration.html#synopsis

update-function-configuration
  --function-name foo
  --environment Variables="{DB_HOST=XXXXX,DB_PASSWORD=OOOOO}"


# Fri Jun 19 16:06:51 PDT 2020
How do we create separate environments for dev/prod?

stacks
CloudFormation is a beast.  Let's look at pinning versions of Lambdas to the
API Gateway for now.

# Fri Jun 19 19:38:40 PDT 2020
I just changed all my .env files to symlinks.
ln -s -f (pwd)/.env ./src/lambda/commands/.env

# Sat Jun 20 18:15:44 PDT 2020
I'm going to try running a single cron job every minute that will find active
users and send their messages.  There's a limit of 50-100 cron jobs, so we can't
scale that way.

{'version': '1.0', 'timestamp': '2020-06-21T06:10:54.761Z', 'requestContext': {'requestId': '9b15be11-4490-4613-b4f1-8e05578b3541', 'functionArn': 'arn:aws:lambda:us-east-1:463986597363:function:vds_wake:$LATEST', 'condition': 'Success', 'approximateInvokeCount': 1}, 'requestPayload': {'version': '0', 'id': '853f5359-b500-b392-7cc2-0bb526f8a1e4', 'detail-type': 'Scheduled Event', 'source': 'aws.events', 'account': '463986597363', 'time': '2020-06-21T06:10:50Z', 'region': 'us-east-1', 'resources': ['arn:aws:events:us-east-1:463986597363:rule/vds_wake'], 'detail': {}}, 'responseContext': {'statusCode': 200, 'executedVersion': '$LATEST'}, 'responsePayload': {'statusCode': 200, 'body': '[[1], [4]]'}}

To get the destination lambda to run, I had to hook up an actual real input to
the vds_wake.  Triggering through the console or cli does not work.


# Sun Jun 21 09:29:31 PDT 2020

Find list of user_ids who have active agents and have not received a command
within a range.

```sql
    -- active agents
    select a.user_id
    ,n.phone
    from agents a
    join numbers n on n.id = a.user_id
    where a.active
    and a.user_id not in (
      -- users who go messages recently
            select distinct(uc.user_id)
            from command_log cl
            join user_commands uc on uc.id = cl.user_commands_id
            where cl.created_at > now() - interval '1 hour'
    )
```

Our job is running every couple minutes and sending only to those it should.  If
there are no commands, it does not send.  Seems to be pretty solid.  I don't
know what the cost of running this cron every 2 minutes will be.

Now I need to update the enable/disable to make it update the db instead of
turning old cron jobs on/off.

```sql
update agents
set active = true
where user_id = 4
```
curl -X PATCH https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/1/agent \
  -i \
  --header 'Content-Type: application/json' \
  --data '{"active":false}'

Now we need to update the status check to check the agent table.

```sql
select a.active
from agents a
where a.user_id = 1
```

# Sun Jun 21 16:56:31 PDT 2020

What does it take to add a new user?
* phone/user_id
* add a row for agent

```sql
with inserted as (
	insert into numbers (phone)
	values ('+12223334444')
	returning id
)
insert into agents (user_id)
select id
from inserted
returning user_id
```

# Mon Jun 22 15:57:54 PDT 2020

My missing sms logs were found.
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/sns$252Fus-east-1$252F463986597363$252FDirectPublishToPhoneNumber$252FFailure

After submitting a ticket to get my rate increased, I'm getting messages again.
My new user is not, however.  The log reads:
    "smsType": "Promotional",
    "mcc": 310,
    "providerResponse": "Phone is currently unreachable/unavailable",

A one-off test with a transactional message went through.  How do we solve this?

* use transactional
* implement retries

There's nothing on the interwebs.  Is retry an option?

The simplest option seems to be setting it to transactional.  That will be more
expensive.  See if that works.


last failure: 2020-06-22T16:04:32.676-07:00

  "smsType": "Transactional",
        "mcc": 310,
        "providerResponse": "Phone is currently unreachable/unavailable",
        "dwellTimeMs": 210,
        "dwellTimeMsUntilDeviceAck": 683
    },
    "status": "FAILURE"

Well, that didn't work.

Let's try retries next.
https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html


# Tue Jun 23 09:34:50 PDT 2020

curl -X POST "https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/feedback" -i \
  --data-raw '{"text":"from curl"}'

# Tue Jun 23 15:45:23 PDT 2020
  select *
  from feedback f
  order by f.id desc

  curl "https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/{phone}/feedback" -i

# Tue Jun 23 18:19:09 PDT 2020

Allow me to upvote feedback to help separate the good from the bad.

Simplest possible approach:
* add count to feedback table
* create query
* create lambda vds_feedback_vote
* api POST feedback/id/vote
* client

This will not track voter identity, so it can be abused.  Handle that once abuse
it an issue.

    update feedback
    set votes = votes + 1
    where id = 25

curl "https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/feedback/25/vote" \
  -i \
  -X POST

# Show the number of votes in feedback.
First, sort results by votes.
Next, include in UI.

# Tue Jun 23 21:02:30 PDT 2020

We need to clear out old feedback.  There are two types that need to be cleaned.

1. junk
2. irrelevant (already fixed)

I don't want to lose good feedback.  I want to be able to show later that it was
part of making a new feature.  Junk is junk.  It's possible good stuff could be
deleted accidentally.  We should do a soft delete in that case.

There are different labels we should apply:
* junk
* fixed
* ?

To normalize this, we need a new table.  We could also use an ENUM.
> Remember that enum are to be used against a very static type definition: a
> list of values that you expect never to change in the life time of your
> application!
https://tapoueh.org/blog/2018/05/postgresql-data-types-enum/


* new table: feedback_labels
* new column for feedback
* sql for select:
  update feedback
  set label_id = 1
  where id = 12
* lambda vds_feedback_label
* api /phone/feedback/id/label

curl -X PUT \
  -i \
  https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/1/feedback/12/label \
  --header 'Content-Type: application/json' \
  --data '{"labelId":2}'

# Wed Jun 24 19:32:57 PDT 2020

## Show what is currently under development so we see how feedback is addressed.

PROBLEM: I want the program to improve, but I don't know if it will.
SOLUTION: Show what is being developed next.
SIMPLEST: Update the html to show what's next.


## Can you make an audio option so I can hear someone yell the commands at me?

PROBLEM: It's not as fun as I want it to be.

## Log tab should open first.

PROBLEM: The wrong feedback tab opens by default.
SOLUTION:


# Fri Jun 26 13:46:59 PDT 2020

From now on, user 1 is the system user.

select ucg.id
,ucg.name
from user_command_groups ucg
where user_id = 1

curl https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/1/commands/group

# Fri Jun 26 15:05:33 PDT 2020
need endpoint to select by group



---------------
-- Update user 4's user_commands based on user 1's group # 9
select *
from ucg_values v
where v.user_command_group_id = 9
;


-- What commands are these?
select c.id
,c.text
from ucg_values v
join user_commands uc on uc.id = v.user_command_id
join commands c on c.id = uc.command_id
where v.user_command_group_id = 9
;


-- Upsert these commands into the destination user's commands.
insert into user_commands (user_id, command_id)
select 4, c.id -- specify user id
from ucg_values v
join user_commands uc on uc.id = v.user_command_id
join commands c on c.id = uc.command_id
where v.user_command_group_id = 9
on conflict
do nothing
;


-- enable/disable commands commands
update user_commands
set enabled = (
	command_id in (
		-- user commands for this user
		select c.id
		from ucg_values v
		join user_commands uc on uc.id = v.user_command_id
		join commands c on c.id = uc.command_id
		where v.user_command_group_id = 9

	)
)
where user_id = 4
returning id, enabled
;

# Tue Jun 30 21:17:56 PDT 2020
https://docs.aws.amazon.com/polly/latest/dg/get-started-what-next.html

See about reading the commands.
* Figure out flow for creating mp3s for new text.
* Change audio when text changes.
* How can we play them to the client?


      <audio autoPlay>
        <source src="speech_20200701042052201.mp3" type="audio/mpeg"/>
      </audio>

We can auto-play on the web.  Can we send an audio message?

## First Solution
Create a page that autoplays the audio.
Add that as a link to the command.
If a user wants to hear the command, they can click that link.

To generate audio, we can start by doing it manually.
Then create a lambda to do it.
When a command is created, generate the new file.  Put it in S3.
Load the file from there.

# Wed Jul  1 10:12:21 PDT 2020

API Gateway will pin to a lambda version.  :)

How do we load a media file from S3?
Just make a public bucket, plop it in, update the url in the db.


An error occurred (AccessDeniedException) when calling the SynthesizeSpeech operation: User: arn:aws:sts::463986597363:assumed-role/lambdavpc/vds_command_generate_audio is not authorized to perform: polly:SynthesizeSpeech

Failed to upload /tmp/speech.mp3 to jex-vds-audio/new-audio.mp3: An error occurred (AccessDenied) when calling the PutObject operation: Access Denied",
  "errorType": "S3UploadFailedError",

# Wed Jul  1 14:30:46 PDT 2020

Looks like the lambda destinations work, but the trigger is limited.
Inputs from API Gateway don't trigger their destinations.

What could we do?

## 1

create command
* sns - new record id and/or text
* on sns - lambda to generate and spit out file, update db with filename


spitting this out of a lambda...


return {
        'statusCode': 200,
        'body': json.dumps({
            'text': 'Make audio out of this, please.',
            'commandId': 12345,

        })
    }


... hooking the lambda to sns

... hooking the sns to another lambda...

{'Records': [{'EventSource': 'aws:sns', 'EventVersion': '1.0', 'EventSubscriptionArn': 'arn:aws:sns:us-east-1:463986597363:vds_new_command:d3d41f2f-e006-4762-8ef6-c5417678878d', 'Sns': {'Type': 'Notification', 'MessageId': '193bf680-3719-5f0b-8a71-a1f73df9eae7', 'TopicArn': 'arn:aws:sns:us-east-1:463986597363:vds_new_command', 'Subject': None, 'Message': '{"version":"1.0","timestamp":"2020-07-01T22:05:20.639Z","requestContext":{"requestId":"246da90e-9449-4e84-bebb-882514a3ce70","functionArn":"arn:aws:lambda:us-east-1:463986597363:function:aaa:$LATEST","condition":"Success","approximateInvokeCount":1},"requestPayload":{"version":"0","id":"0c73f5cc-544e-fd33-7c2f-a60e9a05b0ee","detail-type":"Scheduled Event","source":"aws.events","account":"463986597363","time":"2020-07-01T22:04:39Z","region":"us-east-1","resources":["arn:aws:events:us-east-1:463986597363:rule/trigger-sns-lambda"],"detail":{}},"responseContext":{"statusCode":200,"executedVersion":"$LATEST"},"responsePayload":{"statusCode": 200, "body": "{\\"text\\": \\"Make audio out of this, please.\\", \\"commandId\\": 12345}"}}', 'Timestamp': '2020-07-01T22:05:20.709Z', 'SignatureVersion': '1', 'Signature': 'EkxnuKhb9jDeuW7m6rtJpkGI5bFvt3RsITYTeMVfs/D8xkS1RdxOaJ8DjpooiAcQy6QEu5vKFaxiZUN3IzKaJAOh8o0ACglj5S2sBUHUF988CRbU0bTZSw/GNZ/vseGSydCCWHtAj5eP60FNnrgHhUtpyhPIp6F67RljyJq9y0D7Ei2QQ84TlunP2LOQkS8s0rikbM05Tdy5JJKDrrokE53woe5V21128tadZ9/vojyXnwpji9zB7hboOVmJyjn0XueN/EkyFuNpbf9nXBKSl4eGn6AxjuBaASCn9c/VH3vjLCJezvvHPrPOggpBin0dNSKoSsr0Ku6XqAjzbONKdQ==', 'SigningCertUrl': 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-a86cb10b4e1f29c941702d737128f7b6.pem', 'UnsubscribeUrl': 'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:463986597363:vds_new_command:d3d41f2f-e006-4762-8ef6-c5417678878d', 'MessageAttributes': {}}}]}


Instead of all this, can we just call one Lambda from another?
