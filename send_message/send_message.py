import boto3

session = boto3.Session(profile_name="virtual-drill-sergeant")
sns = boto3.client("sns")

def get_message():
    return "Do 10 pushups!"

def send_message(message):
    print(message)

    # sns.publish(
    #     PhoneNumber="+12064220423",
    #     Message="Do 10 pushups!"
    # )


# To activate this project's virtualenv, run pipenv shell.
# Alternatively, run a command inside the virtualenv with pipenv run.


def cli():
    send_message(get_message())

if __name__ == '__main__':
    cli()
