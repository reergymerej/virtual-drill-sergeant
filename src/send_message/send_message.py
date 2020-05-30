import boto3
import random

# session = boto3.Session(profile_name="virtual-drill-sergeant")
sns = boto3.client("sns")

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

def send_message(message):
    return sns.publish(
        PhoneNumber="+12064220423",
        Message=message
    )


def lambda_handler(event, context):
    send_message(get_message())
