if [ "$(uname)" == "Darwin" ]; then
    open "http://localhost:{{ tunneledPort.8888 }}/?token={{ jupyter_token }}"
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    xdg-open "http://localhost:{{ tunneledPort.8888 }}/?token={{ jupyter_token }}"
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    python3 -m webbrower "http://localhost:{{ tunneledPort.8888 }}/?token={{ jupyter_token }}"
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    python3 -m webbrower "http://localhost:{{ tunneledPort.8888 }}/?token={{ jupyter_token }}"
fi