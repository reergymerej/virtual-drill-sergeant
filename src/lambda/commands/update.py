import json
import db
import os

def update_command(id, disabled):
    query = """
        UPDATE user_commands
        SET disabled = {disabled}
        WHERE id = {id}
        RETURNING id, disabled
    """.format(id = id, disabled = disabled)
    print(query)
    if os.getenv('DEV'):
        return
    return db.update(query)

def get_id(event):
    return int(event.get("pathParameters", {}).get("id", None))

def get_disabled(event):
    body = json.loads(event.get("body", "{}"))
    return body.get("disabled", False)

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
    disabled = get_disabled(event)
    result = update_command(id, disabled)
    print(result)
    return get_response(result)

if __name__ == '__main__':
    with open('./update-enable.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
