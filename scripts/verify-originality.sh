#!/usr/bin/env bash
# 博客原创验证：GPG 签名 + OpenTimestamps 时间戳
#
# 对 dist/ 目录下的所有 HTML 文件执行：
#   1. GPG 私钥签名 → 生成 .sig 文件
#   2. OTS 时间戳   → 生成 .sig.ots 文件
#
# 用法：bash scripts/verify-originality.sh

set -euo pipefail

DIST_DIR="dist"
SIGNER_EMAIL="${BLOG_SIGNER_EMAIL:-liuzihu@126.com}"
PUBLIC_KEY_URL="${BLOG_PUBLIC_KEY_URL:-https://eaverse.top/.well-known/signing-key.pub}"

# 检查依赖
check_deps() {
  local missing=0

  if ! command -v gpg &>/dev/null; then
    echo "错误：未找到 gpg，请安装 GnuPG"
    echo "  macOS: brew install gnupg"
    echo "  Ubuntu: sudo apt install gnupg"
    missing=1
  fi

  if ! command -v ots &>/dev/null; then
    echo "错误：未找到 ots，请运行：pip install opentimestamps-client"
    missing=1
  fi

  if ! gpg --list-secret-keys "$SIGNER_EMAIL" &>/dev/null; then
    echo "错误：未找到 GPG 密钥（$SIGNER_EMAIL）"
    echo "请先运行：bash scripts/generate-signing-key.sh"
    missing=1
  fi

  if [[ ! -d "$DIST_DIR" ]]; then
    echo "错误：构建目录 $DIST_DIR 不存在，请先运行构建"
    missing=1
  fi

  if [[ $missing -ne 0 ]]; then
    exit 1
  fi
}

# 对所有 HTML 文件签名
sign_files() {
  echo "=== 第一步：GPG 签名 ==="
  local count=0

  while IFS= read -r -d '' file; do
    gpg --batch --quiet --detach-sign --local-user "$SIGNER_EMAIL" "$file"
    echo "  已签名: $file → ${file}.sig"
    count=$((count + 1))
  done < <(find "$DIST_DIR" -name '*.html' -print0)

  echo "共签名 $count 个文件"
  echo ""
}

# 对所有签名文件打 OTS 时间戳
timestamp_files() {
  echo "=== 第二步：OTS 时间戳 ==="
  local count=0

  while IFS= read -r -d '' file; do
    ots stamp -q "$file"
    echo "  已时间戳: $file → ${file}.ots"
    count=$((count + 1))
  done < <(find "$DIST_DIR" -name '*.sig' -print0)

  echo "共处理 $count 个签名文件"
  echo "注意：OTS 时间戳可能需要等待比特币出块后才能完全确认"
  echo ""
}

# 打印验证指南
print_guide() {
  echo "=== 验证指南 ==="
  echo ""
  echo "读者验证步骤："
  echo "  1. 下载文章 HTML、.sig 文件、.sig.ots 文件"
  echo "  2. 下载公钥: ${PUBLIC_KEY_URL}"
  echo "  3. 导入公钥: gpg --import signing-key.pub"
  echo ""
  echo "  4. 验证时间戳："
  echo "     ots verify <file>.sig.ots"
  echo ""
  echo "  5. 验证签名："
  echo "     gpg --verify <file>.sig <file>"
  echo ""
  echo "  两步均通过则证明：在某个比特币区块时间之前，"
  echo "  作者身份已签署了该文章内容。"
}

# 主流程
main() {
  echo "博客原创验证系统（GPG + OTS）"
  echo "================================"
  echo ""

  check_deps
  sign_files
  timestamp_files
  print_guide

  echo "================================"
  echo "完成！所有签名和时间戳文件已生成在 $DIST_DIR/ 目录下"
}

main "$@"
