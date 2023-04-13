#!/bin/bash
# Vscode snippet for OSX

WORKSHOP_NAME="data-science"
WORKSHOP_DIR="{{ host.directory }}"

code --install-extension ms-vscode-remote.remote-ssh
code --remote ssh-remote+$WORKSHOP_NAME-workshop $WORKSHOP_DIR