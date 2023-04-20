#!/bin/bash

WORKSHOP_NAME="{{ host.name }}"
WORKSHOP_DIR="{{ host.directory }}"

scp -r "$WORKSHOP_NAME-workshop:$WORKSHOP_DIR" .