import json
import db
import os

def create_command(user_id, command_id, disabled):
    query = """
        insert into user_commands (user_id, command_id, disabled)
        values ({user_id}, {command_id}, {disabled})
        RETURNING id, disabled
    """.format(
        command_id = command_id,
        disabled = disabled,
        user_id = user_id,
    )
    print(query)
    if os.getenv('DEV'):
        return
    return db.insert(query)

def get_phone(event):
    return int(event.get("pathParameters", {}).get("phone", None))

def get_disabled(event):
    body = json.loads(event.get("body", "{}"))
    return body.get("disabled", False)

def get_command_id(event):
    body = json.loads(event.get("body", "{}"))
    return body.get("commandId")

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
    user_id = get_phone(event)
    disabled = get_disabled(event)
    command_id = get_command_id(event)
    result = create_command(user_id, command_id, disabled)
    return get_response(result)

if __name__ == '__main__':
    with open('./command_user_create.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
