#!/usr/bin/env bash
set -Eeuo pipefail

script=$(cd "$(dirname "$0")" && pwd)/deploy-website.sh
fixture=$(mktemp -d)
trap 'rm -rf -- "$fixture"' EXIT
export FOLDERGRAM_WEBSITE_ROOT=$fixture/website
mkdir -p "$fixture/bin" "$FOLDERGRAM_WEBSITE_ROOT/releases/bootstrap"
printf 'original\n' > "$FOLDERGRAM_WEBSITE_ROOT/releases/bootstrap/index.html"
ln -s releases/bootstrap "$FOLDERGRAM_WEBSITE_ROOT/current"

cat > "$fixture/bin/curl" <<'MOCK'
#!/usr/bin/env bash
set -eu
[[ ${TEST_HEALTH_FAIL:-0} == 0 ]] || exit 22
if [[ ${TEST_HEALTH_STALE:-0} == 1 ]]; then
  printf 'stale response\n'
else
  cat "$FOLDERGRAM_WEBSITE_ROOT/current/index.html"
fi
MOCK
chmod +x "$fixture/bin/curl"
export PATH="$fixture/bin:$PATH"

python3 - "$fixture" <<'PY'
import gzip
import io
import sys
import tarfile
from pathlib import Path

root = Path(sys.argv[1])
for name, path, content, kind in [
    ("first", "./index.html", b"first\n", "file"),
    ("second", "index.html", b"second\n", "file"),
    ("traversal", "../escaped", b"unsafe", "file"),
    ("absolute", "/tmp/unsafe", b"unsafe", "file"),
    ("symlink", "index.html", b"", "symlink"),
    ("hardlink", "index.html", b"", "hardlink"),
    ("oversized", "index.html", b"", "oversized"),
    ("missing-index", "asset.txt", b"asset", "file"),
]:
    if kind == "oversized":
        member = tarfile.TarInfo(path)
        member.size = 512 * 1024 * 1024 + 1
        with gzip.open(root / (name + ".tar.gz"), "wb") as archive:
            archive.write(member.tobuf() + b"\0" * 1024)
        continue
    with tarfile.open(root / (name + ".tar.gz"), "w:gz") as archive:
        member = tarfile.TarInfo(path)
        if kind in ["symlink", "hardlink"]:
            member.type = tarfile.SYMTYPE if kind == "symlink" else tarfile.LNKTYPE
            member.linkname = "../../escaped"
            archive.addfile(member)
        else:
            member.size = len(content)
            archive.addfile(member, io.BytesIO(content))
PY

first_commit=1111111111111111111111111111111111111111
second_commit=2222222222222222222222222222222222222222

assert_original() {
  [[ $(readlink "$FOLDERGRAM_WEBSITE_ROOT/current") == releases/bootstrap ]]
  [[ $(cat "$FOLDERGRAM_WEBSITE_ROOT/current/index.html") == original ]]
  [[ ! -L $FOLDERGRAM_WEBSITE_ROOT/previous ]]
  [[ $(find "$FOLDERGRAM_WEBSITE_ROOT/releases" -mindepth 1 -maxdepth 1 -type d | wc -l) == 1 ]]
}

SSH_ORIGINAL_COMMAND=check-website bash "$script" > /dev/null
if SSH_ORIGINAL_COMMAND='deploy-website invalid; echo unsafe' bash "$script" > /dev/null 2>&1; then exit 1; fi
if bash "$script" invalid > /dev/null 2>&1; then exit 1; fi
for archive in traversal absolute symlink hardlink oversized missing-index; do
  if bash "$script" "$first_commit" < "$fixture/$archive.tar.gz" > "$fixture/rejected.log" 2>&1; then
    printf 'Unexpectedly accepted %s archive.\n' "$archive" >&2
    exit 1
  fi
  assert_original
done
[[ ! -e $fixture/escaped ]]
if printf 'invalid archive' | bash "$script" "$first_commit" > "$fixture/invalid.log" 2>&1; then exit 1; fi
assert_original

if flock "$FOLDERGRAM_WEBSITE_ROOT/.deploy.lock" bash "$script" "$first_commit" < "$fixture/first.tar.gz" > "$fixture/locked.log" 2>&1; then exit 1; fi
assert_original
if TEST_HEALTH_FAIL=1 bash "$script" "$first_commit" < "$fixture/first.tar.gz" > "$fixture/health.log" 2>&1; then exit 1; fi
assert_original
if TEST_HEALTH_STALE=1 bash "$script" "$first_commit" < "$fixture/first.tar.gz" > "$fixture/stale.log" 2>&1; then exit 1; fi
assert_original

SSH_ORIGINAL_COMMAND="deploy-website $first_commit" bash "$script" < "$fixture/first.tar.gz" > /dev/null
[[ $(cat "$FOLDERGRAM_WEBSITE_ROOT/current/index.html") == first ]]
first_target=$(readlink "$FOLDERGRAM_WEBSITE_ROOT/current")
[[ $(readlink "$FOLDERGRAM_WEBSITE_ROOT/previous") == releases/bootstrap ]]
[[ $(stat -c '%a' "$FOLDERGRAM_WEBSITE_ROOT/current/index.html") == 644 ]]
[[ $(stat -c '%a' "$FOLDERGRAM_WEBSITE_ROOT/$first_target") == 755 ]]

if TEST_HEALTH_FAIL=1 bash "$script" "$second_commit" < "$fixture/second.tar.gz" > "$fixture/rollback.log" 2>&1; then exit 1; fi
[[ $(readlink "$FOLDERGRAM_WEBSITE_ROOT/current") == "$first_target" ]]
[[ $(readlink "$FOLDERGRAM_WEBSITE_ROOT/previous") == releases/bootstrap ]]

bash "$script" "$second_commit" < "$fixture/second.tar.gz" > /dev/null
[[ $(cat "$FOLDERGRAM_WEBSITE_ROOT/current/index.html") == second ]]
[[ $(readlink "$FOLDERGRAM_WEBSITE_ROOT/previous") == "$first_target" ]]
[[ ! -e $FOLDERGRAM_WEBSITE_ROOT/releases/bootstrap ]]
[[ $(find "$FOLDERGRAM_WEBSITE_ROOT/releases" -mindepth 1 -maxdepth 1 -type d | wc -l) == 2 ]]
[[ -z $(find "$FOLDERGRAM_WEBSITE_ROOT" -maxdepth 1 -name '.publish.*' -print) ]]
printf 'Website deployment checks passed: command and archive validation, locking, atomic publication, HTTP verification, rollback, and release retention.\n'
