#!/bin/bash

CONFIG="$HOME/.ssh/config"

WORKSHOP_NAME="{{ host.name }}"
WORKSHOP_USER="root"

scp -r $USER@$WORKSHOP_NAME-workshop:/$WORKSHOP_USER/workshop .