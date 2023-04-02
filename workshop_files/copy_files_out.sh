#!/bin/bash

CONFIG="$HOME/.ssh/config"

WORKSHOP_NAME="data-science"
USER="root"

scp -r $USER@$WORKSHOP_NAME-workshop:/$USER/workshop .