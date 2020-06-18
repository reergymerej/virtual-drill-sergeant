import json
import db
import os

def update_command(user_id, id):
    query = """
        update user_commands
        set enabled = (
                command_id in (
                        -- Get commands in group
                        select v.user_command_id
                        from user_command_groups ucg
                        join ucg_values v on v.user_command_group_id = ucg.id
                        where ucg.id = {id}
                )
        )
        where user_id = {user_id}
        returning id, enabled
    """.format(
        id = id,
        user_id = user_id
    )
    print(query)
    if os.getenv('DEV'):
        return
    return db.update(query)[0]

def get_id(event):
    return int(event.get("pathParameters", {}).get("id", None))

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
    id = get_id(event)
    result = update_command(id)
    print(result)
    return get_response(result)

if __name__ == '__main__':
    with open('./update-enable.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
