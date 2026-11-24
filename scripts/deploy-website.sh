#!/usr/bin/env bash
set -Eeuo pipefail
umask 022

fail() { printf 'Website deployment failed: %s\n' "$*" >&2; exit 1; }

if [[ -n ${SSH_ORIGINAL_COMMAND+x} ]]; then
  if [[ $SSH_ORIGINAL_COMMAND == check-website ]]; then
    set -- --check
  elif [[ $SSH_ORIGINAL_COMMAND =~ ^deploy-website\ ([0-9a-f]{40})$ ]]; then
    set -- "${BASH_REMATCH[1]}"
  else
    fail 'only check-website or deploy-website <commit-sha> is allowed'
  fi
fi

[[ $# == 1 ]] || fail 'expected a commit SHA'
[[ $1 == --check || $1 =~ ^[0-9a-f]{40}$ ]] || fail 'invalid commit SHA'

website_root=${FOLDERGRAM_WEBSITE_ROOT:-/var/www/foldergram}
releases=$website_root/releases
[[ -d $releases && ! -L $releases && -L $website_root/current && -w $website_root ]] || fail 'website layout is incomplete'

valid_target() {
  [[ $1 =~ ^releases/(bootstrap|[0-9a-f]{40}\.[A-Za-z0-9]+)$ && -d $website_root/$1 && ! -L $website_root/$1 ]]
}

if [[ $1 == --check ]]; then
  valid_target "$(readlink "$website_root/current")" || fail 'invalid current release'
  printf 'Website deployment access ready for %s.\n' "$(id -un)"
  exit 0
fi

commit=$1
exec 9> "$website_root/.deploy.lock"
flock -n 9 || fail 'another website deployment is running'
old_target=$(readlink "$website_root/current")
valid_target "$old_target" || fail 'invalid current release'
old_previous=
if [[ -L $website_root/previous ]]; then
  old_previous=$(readlink "$website_root/previous")
  valid_target "$old_previous" || fail 'invalid previous release'
fi

release=
work=
switched=0
keep_release=0

cleanup() {
  [[ -z $work ]] || rm -rf -- "$work"
  if [[ -n $release && $keep_release == 0 ]]; then
    rm -rf -- "$release"
  fi
}

rollback() {
  local status=$1
  trap - ERR HUP INT TERM
  if [[ $switched == 1 ]]; then
    if ln -s "$old_target" "$work/rollback" && mv -Tf "$work/rollback" "$website_root/current"; then
      printf 'Website deployment failed; restored the previous release.\n' >&2
    else
      keep_release=1
      printf 'Website recovery failed; restore current to %s manually.\n' "$old_target" >&2
    fi
  fi
  exit "$status"
}

trap cleanup EXIT
trap 'rollback $?' ERR
trap 'rollback 130' INT
trap 'rollback 129' HUP
trap 'rollback 143' TERM

work=$(mktemp -d "$website_root/.publish.XXXXXX")
release=$(mktemp -d "$releases/$commit.XXXXXX")
chmod 755 "$release"

# Stream the built archive into an isolated release. Never accept links or paths
# outside that directory, and bound its expanded size and number of entries.
python3 -c '
import shutil
import sys
import tarfile
from pathlib import Path, PurePosixPath

root = Path(sys.argv[1])
total = 0
with tarfile.open(fileobj=sys.stdin.buffer, mode="r|gz") as archive:
    for count, member in enumerate(archive, 1):
        path = PurePosixPath(member.name)
        if count > 10000 or path.is_absolute() or ".." in path.parts:
            raise ValueError("Invalid archive path or too many entries")
        if not (member.isfile() or member.isdir()):
            raise ValueError("Archive entries must be regular files or directories")
        target = root.joinpath(*path.parts)
        if member.isdir():
            target.mkdir(parents=True, exist_ok=True, mode=0o755)
        else:
            total += member.size
            if total > 512 * 1024 * 1024:
                raise ValueError("Expanded website exceeds 512 MiB")
            target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
            with archive.extractfile(member) as source, target.open("xb") as output:
                shutil.copyfileobj(source, output)
            target.chmod(0o644)
' "$release"
[[ -s $release/index.html ]] || fail 'archive has no nonempty index.html'

ln -s "releases/${release##*/}" "$work/current"
switched=1
mv -Tf "$work/current" "$website_root/current"
curl --fail --silent --show-error --max-time 20 \
  --resolve "${FOLDERGRAM_WEBSITE_HEALTH_RESOLVE:-foldergram.app:443:127.0.0.1}" \
  "${FOLDERGRAM_WEBSITE_HEALTH_URL:-https://foldergram.app/}" > "$work/health.html"
cmp -s "$release/index.html" "$work/health.html"

ln -s "$old_target" "$work/previous"
mv -Tf "$work/previous" "$website_root/previous"
keep_release=1
switched=0

# Keep the live release and one rollback release.
if [[ -n $old_previous && $old_previous != "$old_target" && $old_previous != "releases/${release##*/}" ]]; then
  rm -rf -- "$website_root/$old_previous"
fi
printf 'Deployed website commit %s.\n' "$commit"
