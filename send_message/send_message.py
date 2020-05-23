import boto3
import click
import random

session = boto3.Session(profile_name="virtual-drill-sergeant")
sns = boto3.client("sns")

def get_message():
    commands = [
        "Do 10 pushups!",
        "Do 20 crunches!",
        "Do 10 diamond pushups!",
        "Do 20 4-count flutter kicks!",
        "Do 40 4-count side-straddle hops!",
    ]
    return random.choice(commands)

def send_message(message, print_only):
    if print_only:
        print(message)
    else:
        sns.publish(
            PhoneNumber="+12064220423",
            Message=message
        )

@click.command()
@click.option('--dev', is_flag=True, default=False,
              help="Don't actually send messages, print them.")
def cli(dev):
    if dev:
        print("Dev mode, printing messages instead of sending.")
    send_message(get_message(), dev)

if __name__ == '__main__':
    cli()
