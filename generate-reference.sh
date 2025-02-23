#!/bin/bash
echo "Generating reference page information"
echo -n "Current directory: "
pwd

readarray -t fileinfo < <(yq -oj -I0 '. | map({.source: del(.source)}) | .[]' jsdoc-order.in.yaml)
(
  for f in "${fileinfo[@]}"; do
    file=$(yq -pj -ot -I0 'keys' <<<"$f")
    d=$(date -u --date=$(stat $file --format '@%Y') +'%F %T')
    yq -pj -oy ".[\"$file\"] | .date=\"$d\" | [.]" <<<"$f"
  done
) > docsite/data/jsdoc-order.yaml

deno doc --json json/mod.ts >docsite/assets/jsdoc/json-module.json
