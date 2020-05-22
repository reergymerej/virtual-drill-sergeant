import boto3

session = boto3.Session(profile_name="virtual-drill-sergeant")
sns = boto3.client("sns")

sns.publish(
    PhoneNumber="+12064220423",
    Message="Do 10 pushups!"
)
