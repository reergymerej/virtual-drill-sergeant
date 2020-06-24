import db
import json
import os

def do_query():
    query = """
        select f.id
            ,f.text
            ,f.votes
        from feedback f
        order by f.votes desc
            ,f.id desc
    """
    print(query)
    if os.getenv('DEV'):
        print("skipping db")
        return
    return db.all(query)

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
    result = do_query()
    print(result)
    return get_response(result)

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)