#!/bin/bash
# Vscode snippet for OSX

WORKSHOP_NAME="data-science"
WORKSHOP_USER="root"

code --install-extension ms-vscode-remote.remote-ssh
code --remote ssh-remote+$WORKSHOP_NAME-workshop /$WORKSHOP_USER/workshop