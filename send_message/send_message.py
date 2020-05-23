import boto3
import click

session = boto3.Session(profile_name="virtual-drill-sergeant")
sns = boto3.client("sns")

def get_message():
    return "Do 10 pushups!"

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
