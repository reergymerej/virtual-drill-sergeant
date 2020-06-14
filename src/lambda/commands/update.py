import json
import db
import os

def update_command(id, enabled):
    query = """
        UPDATE user_commands
        SET enabled = {enabled}
        WHERE id = {id}
        RETURNING id, enabled
    """.format(id = id, enabled = enabled)
    print(query)
    if os.getenv('DEV'):
        return
    return db.update(query)[0]

def get_id(event):
    return int(event.get("pathParameters", {}).get("id", None))

def get_enabled(event):
    body = json.loads(event.get("body", "{}"))
    return body.get("enabled", False)

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
    enabled = get_enabled(event)
    result = update_command(id, enabled)
    print(result)
    return get_response(result)

if __name__ == '__main__':
    with open('./update-enable.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
