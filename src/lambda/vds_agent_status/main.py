import db
import json
import os

def do_query(user_id):
    query = """
        select a.active
        from agents a
        where a.user_id = {user_id}
    """.format(
        user_id = user_id,
    )
    print(query)
    if os.getenv('DEV'):
        print("skipping db")
        return [(True,)]
        return
    return db.all(query)

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
    result = do_query(get_path_param(event, "phone"))
    active = result[0][0]
    print(active)
    return get_response(result)

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
