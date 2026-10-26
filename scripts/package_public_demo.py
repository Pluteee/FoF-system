"""Create an allowlisted public source directory and ZIP, without private working files."""
from pathlib import Path
import shutil
import subprocess
import zipfile

root = Path(__file__).resolve().parent.parent
subprocess.run(["node", str(root / "scripts/check-public-data.cjs")], cwd=root, check=True)
output = root / "public-release"
destination = output / "public-demo"
output.mkdir(exist_ok=True)
if destination.exists():
    if destination.is_symlink():
        raise RuntimeError("Release output must not be a symlink")
    shutil.rmtree(destination)
destination.mkdir()
allowed = {".html", ".js", ".css", ".md", ".cjs", ".py", ".json", ".svg", ".wasm", ".txt"}
count = 0
for directory in [root / "demo", root / "scripts"]:
    for file in sorted(directory.rglob("*")):
        relative = file.relative_to(root)
        if file.is_symlink():
            raise RuntimeError(f"Symlink excluded from release: {relative}")
        if not file.is_file() or file.suffix not in allowed:
            continue
        if any(part in {"node_modules", "__pycache__", ".git"} for part in relative.parts):
            continue
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(file, target)
        count += 1
for name in ["README.md", ".gitignore"]:
    shutil.copyfile(root / name, destination / name)
archive = output / "public-demo.zip"
with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
    for file in sorted(destination.rglob("*")):
        if file.is_file():
            bundle.write(file, file.relative_to(destination).as_posix())
print(f"Created public-release/public-demo/ and public-release/public-demo.zip ({count + 2} files).")
