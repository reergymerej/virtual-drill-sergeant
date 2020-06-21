import db
import json
import os

def do_query(user_id, active):
    query = """
        update agents
        set active = {active}
        where user_id = {user_id}
        returning user_id, active
    """.format(
        user_id=user_id,
        active=active
    )
    print(query)
    if os.getenv('DEV'):
        print("skipping db")
        return
    return db.all(query)

def get_path_param(event, param):
    return event.get("pathParameters", {}).get(param, None)

def get_from_body(event, value):
    body = json.loads(event.get("body", "{}"))
    return body.get(value, "")

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
    active = get_from_body(event, "active")
    result = do_query(user_id, active)
    print(result)
    return get_response(result)

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
