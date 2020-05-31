import boto3
import db
import os

def get_message():
    return db.random("SELECT id, text FROM commands")

def get_number():
    return db.one("SELECT phone FROM numbers")[0]

def send_message(number, message):
    print('Send "{0}" to {1}.'.format(message, number))

    if os.getenv('DEV'):
        return

    sns = boto3.client("sns")
    return sns.publish(
        PhoneNumber=number,
        Message=message
    )

def lambda_handler(event, context):
    number = get_number()
    message_row = get_message()
    message_id = message_row[0]
    message_text = message_row[1]
    send_message(number, message_text)
    return {
        "message": message_id,
    }

if __name__ == '__main__':
    lambda_handler(None, None)
