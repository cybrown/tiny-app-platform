#!/bin/sh

cat << EOF > /usr/share/mime/packages/tiny-app-script.xml
<?xml version="1.0" encoding="utf-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="application/x-tas">
     <glob pattern="*.tas"/>
  </mime-type>
</mime-info>
EOF

update-mime-database /usr/share/mime
