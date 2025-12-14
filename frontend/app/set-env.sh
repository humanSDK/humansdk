#!/bin/sh
sed -i "s|APP_USER_SERVICE|$NEXT_PUBLIC_USER_SERVICE_API|g" /app/.next/**/*.js
sed -i "s|APP_CORE_SERVICE|$NEXT_PUBLIC_CORE_SERVICE_API|g" /app/.next/**/*.js
sed -i "s|APP_SOCKET_SERVICE|$NEXT_PUBLIC_SOCKET_SERVICE_API|g" /app/.next/**/*.js
sed -i "s|APP_NOTIFICATION_SERVICE|$NEXT_PUBLIC_NOTIFICATION_SERVICE_API|g" /app/.next/**/*.js