#!/bin/bash

CONFIG="$HOME/.ssh/config"

WORKSHOP_NAME="{{ host.name }}"
WORKSHOP_DIR="{{ host.directory }}"

scp -r $USER@$WORKSHOP_NAME-workshop:$WORKSHOP_DIR .