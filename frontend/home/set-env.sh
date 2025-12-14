#!/bin/sh
echo "Applying runtime environment variables..."
find /app/.next -type f -name "*.js" -exec sed -i "s|__COS_THETA_APP__|$NEXT_PUBLIC_COS_THETA_APP|g" {} +
echo "Environment variables applied successfully."
exec "$@"
