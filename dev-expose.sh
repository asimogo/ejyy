#!/usr/bin/env bash
# macOS Bash 3 兼容 + 纯 curl 版（不需要 consul CLI）
set -euo pipefail

CONSUL="http://100.70.156.72:8500"     # VPS 的 Consul
DEFAULT_SUFFIX="api.bmoceo.com"        # 默认后缀
ENABLE_BASICAUTH=0
BASIC_HASH=""
ENABLE_IPWL=0
IPWL_CIDRS="100.64.0.0/10"

cmd_exists(){ command -v "$1" >/dev/null 2>&1; }

detect_ts_ip() {
  if cmd_exists tailscale; then
    if tailscale ip -4 >/dev/null 2>&1; then ip="$(tailscale ip -4 | head -n1)"; [ -n "$ip" ] && { echo "$ip"; return; } fi
    if tailscale status --json >/dev/null 2>&1 && cmd_exists jq; then ip="$(tailscale status --json | jq -r '.Self.TailscaleIPs[] | select(test("^100\\."))' | head -n1)"; [ -n "$ip" ] && { echo "$ip"; return; } fi
    if tailscale status >/dev/null 2>&1; then ip="$(tailscale status 2>/dev/null | awk '/^[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+/ {print $1; exit}')"; [ -n "$ip" ] && { echo "$ip"; return; } fi
  fi
  if cmd_exists ifconfig; then ip="$(ifconfig 2>/dev/null | awk '$1 ~ /^utun[0-9]+:/ {iface=$1} iface && $1=="inet" {print $2; exit}')"; [ -n "$ip" ] && { echo "$ip"; return; } fi
  echo ""
}

ensure_consul() { curl -sS --connect-timeout 3 "$CONSUL/v1/status/leader" >/dev/null || { echo "❌ 无法连接 Consul: $CONSUL"; exit 1; }; }

build_mw_lines() {
  name="$1"; out=""
  if [ "$ENABLE_IPWL" -eq 1 ]; then out="${out}traefik.http.middlewares.${name}-allow.ipWhiteList.sourceRange=${IPWL_CIDRS}\n"; mids="${mids}${name}-allow,"; fi
  if [ "$ENABLE_BASICAUTH" -eq 1 ]; then [ -n "$BASIC_HASH" ] || { echo "❌ 开了 BasicAuth 但未配置 BASIC_HASH"; exit 1; }; out="${out}traefik.http.middlewares.${name}-auth.basicAuth.users=${BASIC_HASH}\n"; mids="${mids}${name}-auth,"; fi
  if [ -n "${mids:-}" ]; then mids="${mids%,}"; out="${out}traefik.http.routers.${name}.middlewares=${mids}\n"; fi
  printf "%b" "$out"
}

emit_tags_json() {
  name="$1"; port="$2"; domain="$3"; mid_lines="$4"
  echo '  "Tags": ['
  printf '    "%s",\n' "traefik.enable=true"
  printf '    "%s",\n' "traefik.http.routers.${name}.rule=Host(\`${domain}\`)"
  printf '    "%s",\n' "traefik.http.routers.${name}.entrypoints=websecure"
  printf '    "%s",\n' "traefik.http.routers.${name}.tls.certresolver=cf"
  base_service_tag="traefik.http.services.${name}.loadbalancer.server.port=${port}"
  if [ -n "$mid_lines" ]; then
    printf '    "%s",\n' "$base_service_tag"
    # 输出中间件，每行一条，最后一行不加逗号
    total=$(printf "%b" "$mid_lines" | grep -c . || true)
    c=0
    printf "%b" "$mid_lines" | while IFS= read -r line; do
      [ -z "$line" ] && continue
      c=$((c+1))
      if [ $c -lt $total ]; then printf '    "%s",\n' "$line"; else printf '    "%s"\n' "$line"; fi
    done
  else
    printf '    "%s"\n' "$base_service_tag"
  fi
  echo '  ]'
}

register_one() {
  port="$1"; domain="$2"; name="$3"; ts_ip="$4"; tmp="/tmp/${name}.json"
  mids="$(build_mw_lines "$name")"
  {
    echo "{"
    echo "  \"Name\": \"${name}\","
    echo "  \"ID\": \"${name}\","
    echo "  \"Address\": \"${ts_ip}\","
    echo "  \"Port\": ${port},"
    emit_tags_json "$name" "$port" "$domain" "$mids"
    echo "}"
  } > "$tmp"
  curl -sS -X PUT --data @"$tmp" "$CONSUL/v1/agent/service/register" >/dev/null
  echo "✅ 已暴露: https://${domain}  →  ${ts_ip}:${port}  (name=${name})"
}

expose_many() {
  ensure_consul
  [ $# -ge 1 ] || { echo "用法: $0 expose <port[=domain]> ..."; exit 1; }
  ts_ip="$(detect_ts_ip)"; [ -n "$ts_ip" ] || { echo "❌ 取不到 Tailscale IP，请确认 Tailscale 已连接"; exit 1; }
  echo "ℹ️  使用 Tailscale IP: $ts_ip"
  for item in "$@"; do
    if echo "$item" | grep -q '='; then port="${item%%=*}"; domain="${item#*=}"; else port="$item"; domain="dev-${port}.${DEFAULT_SUFFIX}"; fi
    echo "$port" | grep -Eq '^[0-9]+$' || { echo "⚠️ 跳过无效端口: $item"; continue; }
    name="dev${port}"
    register_one "$port" "$domain" "$name" "$ts_ip"
  done
  echo "提示：首次访问每个域名可能需要 5–20 秒签证书，可在 VPS 上 tail Traefik 日志观察 ACME。"
}

unexpose_many() {
  ensure_consul
  [ $# -ge 1 ] || { echo "用法: $0 unexpose <port> ..."; exit 1; }
  for port in "$@"; do name="dev${port}"; curl -sS -X PUT "$CONSUL/v1/agent/service/deregister/$name" >/dev/null && echo "❎ 已取消: ${name}"; done
}

list_services() {
  ensure_consul
  echo "当前 Consul 注册（dev*）："
  if cmd_exists jq; then curl -s "$CONSUL/v1/catalog/services" | jq -r 'keys[]' | grep -E '^dev[0-9]+' || true
  else curl -s "$CONSUL/v1/catalog/services" | tr -d '{}"' | tr ',' '\n' | cut -d: -f1 | grep -E '^dev[0-9]+' || true
  fi
}

case "${1:-}" in
  expose)   shift; expose_many "$@" ;;
  unexpose) shift; unexpose_many "$@" ;;
  list)     shift; list_services ;;
  *)        echo "用法: $0 expose <port[=domain]> ... | unexpose <port> ... | list" ;;
esac