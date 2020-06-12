import json
import db
import os

def list_command():
    query = "SELECT * FROM commands"
    print(query)
    if os.getenv('DEV'):
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
    result = list_command()
    print(result)
    return get_response(result)

if __name__ == '__main__':
    lambda_handler(None, None)
