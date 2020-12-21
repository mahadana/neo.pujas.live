#!/bin/bash

set -eu

cd /app
uid=$(stat -c %u .)
gid=$(stat -c %g .)

if [ $uid = 0 ]; then
  # Host is Mac/Windows, run as root...
  user=root
else
  user=node
  userdel node 2> /dev/null || true
  groupdel node 2> /dev/null || true
  groupadd -g $gid node
  useradd -u $uid -g $gid -d /home/node -s /bin/bash node
  chown -R node:node /home/node
  chown node:node .cache build node_modules
fi

if [ $(ls node_modules | wc -l) = 0 ]; then
  echo "Installing node modules..."
  su -c "npm install --silent" $user
fi

if [ $(ls build | wc -l) = 0 ]; then
  su -c "npm run build" $user
fi

su -c "node scripts/seed.js" $user

su -c "npm run develop" $user
