#!/usr/bin/env bash
# 博客文章签名密钥设置脚本
#
# 此脚本会检查本地是否已有 GPG 密钥，有则复用，无则新建
# 用法：bash scripts/generate-signing-key.sh

set -euo pipefail

SIGNER_EMAIL="${BLOG_SIGNER_EMAIL:-liuzihu@126.com}"

echo "检查 GPG 密钥（$SIGNER_EMAIL）..."

# 检查是否已存在密钥
if gpg --list-secret-keys "$SIGNER_EMAIL" &>/dev/null; then
  echo "密钥已存在，无需新建"
  echo ""
  echo "密钥信息："
  gpg --list-keys --keyid-format long "$SIGNER_EMAIL"
  echo ""
  echo "下一步："
  echo "  1. 导出公钥到 public/.well-known/signing-key.pub"
  echo "     gpg --armor --export $SIGNER_EMAIL > public/.well-known/signing-key.pub"
  echo "  2. 导出私钥（base64 编码后）添加到 GitHub Secret: BLOG_GPG_PRIVATE_KEY"
  echo "     gpg --armor --export-secret-keys $SIGNER_EMAIL | base64 -w 0"
  exit 0
fi

echo "未找到密钥，正在生成..."
echo "（可能会提示输入密码，可直接回车留空——CI 中不需要密码）"

# 使用批处理模式生成密钥
cat <<EOF | gpg --batch --gen-key
%no-protection
Key-Type: ed25519
Key-Length: 256
Subkey-Type: ed25519
Subkey-Length: 256
Name-Real: laobinghu
Name-Email: ${SIGNER_EMAIL}
Expire-Date: 0
%commit
EOF

echo ""
echo "=== 生成完成 ==="
echo ""
echo "下一步："
echo "  1. 导出公钥到 public/.well-known/signing-key.pub"
echo "     gpg --armor --export $SIGNER_EMAIL > public/.well-known/signing-key.pub"
echo "  2. 导出私钥（base64 编码后）添加到 GitHub Secret: BLOG_GPG_PRIVATE_KEY"
echo "     gpg --armor --export-secret-keys $SIGNER_EMAIL | base64 -w 0"
