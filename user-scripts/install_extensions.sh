#!/bin/bash
# Vscode snippet for OSX

WORKSHOP_NAME="{{ host.name }}"
WORKSHOP_DIR="{{ host.directory }}"

if [ "$(uname)" == "Darwin" ]; then
    export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"
fi

code --install-extension ms-vscode-remote.remote-ssh
code --remote ssh-remote+$WORKSHOP_NAME-workshop $WORKSHOP_DIR