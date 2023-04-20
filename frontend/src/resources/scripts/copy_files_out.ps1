#!/bin/bash

$HostName = "{{ host.name }}"
$WorkshopDir="{{ host.directory }}"

scp -r "$HostName-workshop:$WorkshopDir" .