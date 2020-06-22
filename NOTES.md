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
