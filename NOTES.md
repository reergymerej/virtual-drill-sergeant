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

https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/{phone}/commands/group
