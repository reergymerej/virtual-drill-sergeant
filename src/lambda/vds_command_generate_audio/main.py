import boto3
from boto3 import Session
from botocore.exceptions import BotoCoreError, ClientError
from contextlib import closing
from tempfile import gettempdir
import db
import json
import os
import subprocess
import sys

def update_command_entry(id, audio):
    query = """
        update commands
        set audio = '{audio}'
        where id = {id}
        returning *
    """.format(
        audio = audio,
        id = id,
    )
    print(query)
    if os.getenv('DEV'):
        print("skipping db")
        return
    return db.insert(query)

def get_response(body):
    return {
        "isBase64Encoded": "false",
        "statusCode": 200, # 204 won't send body to api gateway for some reason
        "headers": {
            "Access-Control-Allow-Origin":"*",
            "Content-Type": "application/json"
        },
        "body": json.dumps(body),
    }

def get_audio_file(text):
    session = Session()
    polly = session.client("polly")

    try:
        # Request speech synthesis
        response = polly.synthesize_speech(
            Text=text,
            OutputFormat="mp3",
            VoiceId="Matthew"
        )
    except (BotoCoreError, ClientError) as error:
        # The service returned an error, exit gracefully
        print(error)
        sys.exit(-1)

    # Access the audio stream from the response
    if "AudioStream" in response:
        # Note: Closing the stream is important because the service throttles on the
        # number of parallel connections. Here we are using contextlib.closing to
        # ensure the close method of the stream object will be called automatically
        # at the end of the with statement's scope.
        with closing(response["AudioStream"]) as stream:
            output = os.path.join(gettempdir(), "speech.mp3")
            try:
                # Open a file for writing the output as a binary stream
                with open(output, "wb") as file:
                    file.write(stream.read())
            except IOError as error:
                # Could not write to file, exit gracefully
                print(error)
                sys.exit(-1)

    else:
        # The response didn't contain audio data, exit gracefully
        print("Could not stream audio")
        sys.exit(-1)

    return output

def save_to_s3(source_file, destination_file):
    print(source_file)
    print(destination_file)
    s3_client = boto3.client('s3')
    bucket = 'jex-vds-audio'
    s3_client.upload_file(
        Filename=source_file,
        Bucket=bucket,
        Key=destination_file
    )
    return "https://{bucket}.s3.amazonaws.com/{destination_file}".format(
        bucket=bucket,
        destination_file=destination_file,
    )

def lambda_handler(event, context):
    print(event)
    # {'text': 'bingo bango 123128', 'id': 135}
    text = event.get('text')
    id = event.get('id')
    print(id)
    print(text)
    audio_file = get_audio_file(text)
    new_file_name = "{id}-voice.mp3".format(id=id)
    url = save_to_s3(audio_file, new_file_name)
    result = update_command_entry(id, url)
    print(result)

    return get_response({
        'id': id,
        'text': text,
        'file': new_file_name,
    })

if __name__ == '__main__':
    add_these = [
        # (41, 'Hamstring stretch, standing, 60 seconds'),
    ]
    for pair in add_these:
        print(pair[0], pair[1])
        event = {
            'id': pair[0],
            'text': pair[1],
        }
        lambda_handler(event, None)

    # with open('./event.json') as f:
    #     event = json.load(f)
