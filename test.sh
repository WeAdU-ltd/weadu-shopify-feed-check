#!/bin/sh
# Local checks. Shared logic tests come from WeAdU-ltd/weadu-com-webflow tools/wea-323.
set -eu
cd "$(dirname "$0")"
cmp feed.js test/feed.js
grep -q "src=\"feed.js\"" index.html
node --test --test-name-pattern="feed|title|rss" test/logic.test.js
[ -d node_modules ] || npm ci --no-audit --no-fund
node --test test/page.test.js
echo "weadu-shopify-feed-check ok"
