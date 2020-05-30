import boto3
import os
import random
from connect import get_connection

def get_message():
    commands = [
        "30 second plank, go!",
        "Do 10 diamond pushups!",
        "Do 10 pushups!",
        "Do 20 4-count flutter kicks!",
        "Do 20 crunches!",
        "Do 40 4-count side-straddle hops!",
    ]
    return random.choice(commands)

def send_message(number, message):
    print('Send "{0}" to {1}.'.format(message, number))

    if os.getenv('DEV'):
        return

    sns = boto3.client("sns")
    return sns.publish(
        PhoneNumber=number,
        Message=message
    )

def get_number(connection):
    cursor = connection.cursor()
    cursor.execute("SELECT phone FROM numbers")
    top = cursor.fetchone()
    phone = top[0]
    return phone

def lambda_handler(event, context):
    connection = get_connection()
    number = get_number(connection)
    message = get_message()
    send_message(number, message)

if __name__ == '__main__':
    session = boto3.Session(profile_name="virtual-drill-sergeant")
    lambda_handler(None, None)
