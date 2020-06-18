import json
import db
import os

def create_group(user_id, name):
    query = """
        insert into user_command_groups (user_id, name)
        values ({user_id}, '{name}')
        returning id
    """.format(
        name = name,
        user_id = user_id,
    )
    print(query)
    if os.getenv('DEV'):
        return
    return db.insert(query)

def get_phone(event):
    return int(event.get("pathParameters", {}).get("phone", None))

def get_name(event):
    body = json.loads(event.get("body", "{}"))
    return body.get("name", "")

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
    phone = get_phone(event)
    name = get_name(event)
    result = create_group(phone, name)
    return get_response(result)

if __name__ == '__main__':
    with open('./group_create.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
