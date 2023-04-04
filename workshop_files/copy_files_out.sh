#!/bin/bash

CONFIG="$HOME/.ssh/config"

WORKSHOP_NAME="data-science"
WORKSHOP_USER="root"

scp -r $USER@$WORKSHOP_NAME-workshop:/$WORKSHOP_USER/workshop .