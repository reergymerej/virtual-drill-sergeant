import db
import json
import os

def do_query(text):
    query = """
        select '{text}'
    """.format(
        text = text,
    )
    print(query)
    if os.getenv('DEV'):
        print("skipping db")
        return
    return db.all(query)

def get_path_param(event, param):
    return int(event.get("pathParameters", {}).get(param, None))

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
    result = do_query(get_path_param(event, "phone"))
    return get_response(result)

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
