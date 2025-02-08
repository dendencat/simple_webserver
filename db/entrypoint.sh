#!/bin/sh
set -e

# 外部ボリューム（例: /app/keys）から鍵が管理される前提
mkdir -p /app/keys

# もし /app/keys に証明書または鍵が存在しなければ生成する
if [ ! -f /app/keys/server.crt ] || [ ! -f /app/keys/server.key ]; then
  echo "証明書と鍵が見つからないため、初回生成します..."
  openssl req -new -x509 -days 365 -nodes \
    -out /app/keys/server.crt \
    -keyout /app/keys/server.key \
    -subj "/CN=localhost"
  chmod 600 /app/keys/server.key
  chown postgres:postgres /app/keys/server.key
fi

# 生成または既存の鍵を /etc/ssl/certs にコピー（PostgreSQL起動時に参照される場所）
cp /app/keys/server.crt /etc/ssl/certs/server.crt
cp /app/keys/server.key /etc/ssl/certs/server.key

# Ensure the PostgreSQL data directory has the correct permissions
chown -R postgres:postgres /var/lib/postgresql/data

# 最後に、CMD で指定された PostgreSQL のコマンドを実行
exec "$@"
