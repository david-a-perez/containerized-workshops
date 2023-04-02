#!/bin/bash

WORKSHOP_NAME="data-science"
USER="root"

code --install-extension ms-vscode-remote.remote-ssh
code --remote ssh-remote+$WORKSHOP_NAME-workshop /$USER/workshop