#!/usr/bin/env bash
aws s3 sync build/ s3://vds.reergymerej.com
aws cloudfront create-invalidation \
  --distribution-id E3FIP03GLPOWQS \
  --paths "/*"
