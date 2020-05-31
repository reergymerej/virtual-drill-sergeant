import boto3
import db
import os

def get_message():
    return db.random("SELECT text FROM commands")[0]

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
    message = get_message()
    send_message(number, message)

if __name__ == '__main__':
    lambda_handler(None, None)
