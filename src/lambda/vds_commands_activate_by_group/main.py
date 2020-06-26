import db
import json
import os

def upsert_user_commands(user_id, group_id):
    """This adds any user commands this user may not have yet that are part of the
    group.
    """
    query = """insert into user_commands (user_id, command_id)
    select {user_id}, c.id
    from ucg_values v
    join user_commands uc on uc.id = v.user_command_id
    join commands c on c.id = uc.command_id
    where v.user_command_group_id = {group_id}
    on conflict
    do nothing
    returning *
    """.format(
        group_id = group_id,
        user_id = user_id,
    )
    print(query)
    if os.getenv('DEV'):
        print("skipping db")
        return
    return db.insert(query)

def enable_by_group(user_id, group_id):
    """Enables user commands based on inclusion in group."""
    query = """update user_commands
        set enabled = (
            command_id in (
                select c.id
                from ucg_values v
                join user_commands uc on uc.id = v.user_command_id
                join commands c on c.id = uc.command_id
                where v.user_command_group_id = {group_id}
            )
        )
        where user_id = {user_id}
        returning id, enabled
    """.format(
        group_id = group_id,
        user_id = user_id,
    )
    print(query)
    if os.getenv('DEV'):
        print("skipping db")
        return
    return db.insert(query)

def do_query(user_id, group_id):
    upsert_result = upsert_user_commands(user_id, group_id)
    print(upsert_result)
    enable_result = enable_by_group(user_id, group_id)
    print(upsert_result)
    return enable_result

def get_path_param(event, param):
    return int(event.get("pathParameters", {}).get(param, None))

def get_response(body):
    return {
        "isBase64Encoded": "false",
        "statusCode": 200, # 204 won't send body to api gateway for some reason
        "headers": {
            "Access-Control-Allow-Origin":"*",
            "Content-Type": "application/json"
        },
        "body": json.dumps(body),
    }

def lambda_handler(event, context):
    print(event)
    user_id = get_path_param(event, "phone")
    group_id = get_path_param(event, "group_id")
    result = do_query(user_id, group_id)
    print(result)
    return get_response(result)

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
