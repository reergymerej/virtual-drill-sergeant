import json
import db
import os

def create_command(text):
    query = """
          insert into commands (text)
          values ('{text}')
          returning id, text
    """.format(
        text = text,
    )
    print(query)
    if os.getenv('DEV'):
        return
    return db.insert(query)

def get_phone(event):
    return int(event.get("pathParameters", {}).get("phone", None))

def get_command_text(event):
    body = json.loads(event.get("body", "{}"))
    return body.get("text", "")

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
    text = get_command_text(event)
    result = create_command(text)
    return get_response(result)

if __name__ == '__main__':
    with open('./command_create.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
