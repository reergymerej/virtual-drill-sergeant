import db
import json
import os

def do_query(text):
    # TODO: properly pass (and escape) params
    # cursor.execute("query with params %s %s", ("param1", "pa'ram2"))
    if "'" in text:
        raise Exception("Oh, no! SQL injection")
    query = """
        insert into feedback (text)
        values ('{text}')
        returning id
    """.format(
        text = text,
    )
    print(query)
    if os.getenv('DEV'):
        print("skipping db")
        return
    return db.insert(query)

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
    text = get_from_body(event, "text")
    result = do_query(text)
    print(result)
    return get_response(result)

if __name__ == '__main__':
    with open('./event.json') as f:
        event = json.load(f)
        lambda_handler(event, None)
