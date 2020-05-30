import boto3
import os
import random

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
    if os.getenv('DEV'):
        print('Send "{0}" to {1}.'.format(message, number))
        return

    session = boto3.Session(profile_name="virtual-drill-sergeant")
    sns = boto3.client("sns")
    return sns.publish(
        PhoneNumber=number,
        Message=message
    )


def lambda_handler(event, context):
    number = "+12064220423"
    message = get_message()
    send_message(number, message)

if __name__ == '__main__':

    lambda_handler(None, None)
