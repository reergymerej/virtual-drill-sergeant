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
