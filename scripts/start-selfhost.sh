#!/bin/sh
set -eu
mkdir -p /data/avatars
chown node:node /data/avatars
exec su -s /bin/sh node -c 'exec npm start'
