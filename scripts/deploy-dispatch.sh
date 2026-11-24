#!/usr/bin/env bash
set -Eeuo pipefail

# Install as the deployment key forced command. Each handler validates the full
# command independently; never evaluate SSH_ORIGINAL_COMMAND as shell input.
case ${SSH_ORIGINAL_COMMAND:-} in
  check|deploy\ *)
    exec /srv/foldergram/bin/deploy-vps
    ;;
  check-website|deploy-website\ *)
    exec /srv/foldergram/bin/deploy-website
    ;;
  *)
    printf 'Unsupported deployment command.\n' >&2
    exit 1
    ;;
esac
