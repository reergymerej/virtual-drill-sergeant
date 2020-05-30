import pytest
import send_message
from moto import mock_sns

def test_get_message():
    assert send_message.get_message() in [
        "30 second plank, go!",
        "Do 10 diamond pushups!",
        "Do 10 pushups!",
        "Do 20 4-count flutter kicks!",
        "Do 20 crunches!",
        "Do 40 4-count side-straddle hops!",
    ]


# @mock_sns
# def test_send_message(capsys):
#     out, _err = capsys.readouterr()
#     # no output
#     assert out == ""
#     sns_publish_called = True
#     assert sns_publish_called == True
#     result = send_message.send_message("foo", False)
#     print(result)
#
#     return
#     send_message.send_message("foo", True)
#     out, _err = capsys.readouterr()
#     assert out == "foo\n"

