import send_message

def test_answer():
    assert send_message.get_message() in [
        "Do 10 pushups!",
        "Do 20 crunches!",
        "Do 10 diamond pushups!",
        "Do 20 4-count flutter kicks!",
        "Do 40 4-count side-straddle hops!",
    ]
