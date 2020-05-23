from setuptools import setup

setup(
    name='Virtual Drill Sergeant',
    version='1.0.0',
    author='Jeremy Greer',
    author_email='jex.grizzle@gmail.com',
    description='send sms',
    packages=[
        'send_message'
    ],
    url='https://github.com/reergymerej/virtual-drill-sergeant',
    install_requires=[
        'click',
        'boto3',
    ],
    entry_points='''
        [console_scripts]
        send_message=send_message.send_message:cli
    ''',
)
