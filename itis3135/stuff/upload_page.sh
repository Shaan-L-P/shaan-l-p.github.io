#!/bin/bash
# Uploads the bad page through the deeply nested "stuff" folder chain via FTP.
# Run this from the same folder as "My BAD pAgE ✨.htm".
# You'll be prompted for your webspace password after you press enter,
# it isn't stored anywhere in this file.
#
# If FileZilla's Site Manager has a different host saved for this
# connection, or if logging in already drops you inside public_html,
# adjust the URL below to match.

curl -T "My BAD pAgE ✨.htm" \
  --ftp-create-dirs \
  -u spate338 \
  "ftp://webpages.charlotte.edu/public_html/itis3135/stuff/new_stuff/final_version/final_version_v2/actually_final/copy%20of%20actually_final/old_backup/misc/dont_touch/z/My%20BAD%20pAgE%20%E2%9C%A8.htm"