#!/usr/bin/env python3
"""Convert comments.json to Artalk Artrans format."""

import json
from datetime import datetime, timezone, timedelta

# Read source data
with open('D:/Project/astro-theme-retypeset/tempdata/comments.json', 'r', encoding='utf-8') as f:
    source = json.load(f)

SITE_NAME = "烙饼的碎碎念"
SITE_URLS = "https://blog.laobinghu.top"
DEFAULT_TZ = timezone(timedelta(hours=8))  # +0800

def format_datetime(dt_str):
    """Convert ISO datetime to Artalk format: 'YYYY-MM-DD HH:MM:SS +0800'."""
    if not dt_str:
        return None
    # Parse ISO format
    dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    # Convert to +0800
    dt = dt.astimezone(DEFAULT_TZ)
    return dt.strftime('%Y-%m-%d %H:%M:%S +0800')

artrans = []

for comment in source['data']:
    # Skip deleted comments
    if comment.get('is_deleted'):
        continue

    # Build page_key from slug
    slug = comment['ref']['slug'] if comment.get('ref') else ''
    page_key = f"/{slug}/" if slug else ''

    # Determine pending state
    # state: 1 = approved, 0 = pending
    is_pending = "false" if comment.get('state') == 1 else "true"

    artran = {
        "id": str(comment['id']),
        "rid": str(comment['parent_comment_id']) if comment.get('parent_comment_id') else "",
        "content": comment.get('text', ''),
        "ua": comment.get('agent', ''),
        "ip": comment.get('ip', ''),
        "created_at": format_datetime(comment.get('created_at')),
        "updated_at": format_datetime(comment.get('edited_at')) or format_datetime(comment.get('created_at')),
        "is_collapsed": "false",
        "is_pending": is_pending,
        "vote_up": "0",
        "vote_down": "0",
        "nick": comment.get('author', ''),
        "email": comment.get('mail', '') or '',
        "link": comment.get('url', '') or '',
        "password": "",
        "badge_name": "管理员" if (comment.get('reader') or {}).get('role') == 'owner' else "",
        "badge_color": "#FF716D" if (comment.get('reader') or {}).get('role') == 'owner' else "",
        "page_key": page_key,
        "page_title": comment['ref']['title'] if comment.get('ref') else '',
        "page_admin_only": "false",
        "site_name": SITE_NAME,
        "site_urls": SITE_URLS,
    }
    artrans.append(artran)

# Write output
output_path = 'D:/Project/astro-theme-retypeset/tempdata/comments.artrans.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(artrans, f, ensure_ascii=False, indent=2)

print(f"Converted {len(artrans)} comments to Artrans format")
print(f"Output: {output_path}")
