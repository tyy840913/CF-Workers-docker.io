ACCOUNTS=(
  "507619d89dda3b5e23306274a9001883"
  "9441762a8d7dee0ebd83f3fcee3efc05"
  "3d1abe250882efaf6ae33011be0c5f98"
  "364ef7d598a1019d6d4465c875b06e71"
  "08c9e11a0ec458e5bf1d87f97a762ee7"
  "dd9765debfa040c6dce9ef0940068a9e"
  "58ad14493c8670512a375e3ea2022198"
  "f8d9c5b5e78cf383fdbf14d96e9e246b"
)

mkdir -p /root/public

for aid in "${ACCOUNTS[@]}"; do
  echo "=== Deploying to $aid ==="
  DIR="/tmp/docker-batch-deploy/$aid"
  rm -rf "$DIR"
  mkdir -p "$DIR"
  cp /root/CF-Workers-docker.io/_worker.js "$DIR/_worker.js"
  cat > "$DIR/wrangler.toml" <<EOF
name = "docker-proxy"
main = "_worker.js"
compatibility_date = "2025-04-01"
account_id = "$aid"
EOF
  export https_proxy=http://127.0.0.1:7891 http_proxy=http://127.0.0.1:7891
  (cd "$DIR" && wrangler deploy --no-bundle 2>&1) | grep -E "Uploaded|Deployed|Error|error"
  echo ""
done

echo "=== All deployments complete ==="
