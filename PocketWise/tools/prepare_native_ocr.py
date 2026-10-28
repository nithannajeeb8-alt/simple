#!/usr/bin/env python3
"""Prepare the pinned official PaddleOCR Android SDK and its small ONNX models.

Run once before syncing/building android-widget in Android Studio. Source and weights are
fetched from official PaddlePaddle/Hugging Face HTTPS locations and then run offline.
"""
from __future__ import annotations
import argparse
import json
import hashlib
import shutil
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ANDROID_ROOT = ROOT / "android-widget"
MODULE_REL = Path("deploy/ppocr-android/ppocr-sdk")
PINNED_REV = "dab3fe35379033fdcb2d0e9572fac0b36c9a9ebf"
USER_AGENT = "PocketWise-Native-OCR-Setup/1.0 (source-build)"

MODELS = {
    "src/main/assets/models/det/inference.onnx": (
        "https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx/resolve/main/inference.onnx?download=true",
        7 * 1024 * 1024,
    ),
    "src/main/assets/models/rec/inference.onnx": (
        "https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx/resolve/main/inference.onnx?download=true",
        8 * 1024 * 1024,
    ),
    "src/main/assets/models/rec/inference.yml": (
        "https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx/resolve/main/inference.yml?download=true",
        512 * 1024,
    ),
}

SDK_BUILD_GRADLE = """plugins {
    id 'com.android.library'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.paddle.ocr'
    compileSdk 35
    defaultConfig { minSdk 26 }
    buildTypes { release { minifyEnabled false } }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = '17' }
}

dependencies {
    implementation 'com.microsoft.onnxruntime:onnxruntime-android:1.21.1'
    implementation 'com.quickbirdstudios:opencv:4.5.3'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0'
    implementation 'androidx.core:core-ktx:1.15.0'
}
"""

SDK_LICENSE_NOTE = f"""# PaddleOCR Android SDK and model notice

PocketWise integrates PaddlePaddle's official PP-OCRv6 Android SDK source from commit
`{PINNED_REV}` of `https://github.com/PaddlePaddle/PaddleOCR`.

The SDK and PP-OCRv6 tiny ONNX models are distributed under Apache License 2.0 by their
upstream project/model cards. See the upstream `LICENSE` file and model pages for terms:
- https://github.com/PaddlePaddle/PaddleOCR/blob/{PINNED_REV}/LICENSE
- https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx
- https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_onnx

Runtime/model download is build-time only. After the model files are packaged into the APK,
OCR recognition runs on-device and does not upload images to a PocketWise server.
"""


def request_bytes(url: str, max_bytes: int, accept: str = "application/octet-stream") -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": accept})
    parts: list[bytes] = []
    total = 0
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            declared = response.headers.get("Content-Length")
            if declared and int(declared) > max_bytes:
                raise RuntimeError(f"Download too large (Content-Length={declared}): {url}")
            while True:
                part = response.read(min(64 * 1024, max_bytes - total + 1))
                if not part:
                    break
                total += len(part)
                if total > max_bytes:
                    raise RuntimeError(f"Download exceeded the {max_bytes}-byte limit: {url}")
                parts.append(part)
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Could not download {url}: {exc}") from exc
    return b"".join(parts)


def collect_sources() -> list[dict]:
    base = f"{MODULE_REL.as_posix()}/src/main/java/com/paddle/ocr"
    collected: list[dict] = []

    def walk(api_path: str):
        url = f"https://api.github.com/repos/PaddlePaddle/PaddleOCR/contents/{api_path}?ref={PINNED_REV}"
        items = json.loads(request_bytes(url, 2 * 1024 * 1024, "application/vnd.github+json").decode("utf-8"))
        if not isinstance(items, list):
            items = [items]
        for item in items:
            if item.get("type") == "dir":
                walk(item["path"])
            elif item.get("type") == "file" and item.get("name", "").endswith(".kt"):
                collected.append(item)

    walk(base)
    manifest_path = f"{MODULE_REL.as_posix()}/src/main/AndroidManifest.xml"
    manifest_url = f"https://api.github.com/repos/PaddlePaddle/PaddleOCR/contents/{manifest_path}?ref={PINNED_REV}"
    manifest = json.loads(request_bytes(manifest_url, 256 * 1024, "application/vnd.github+json").decode("utf-8"))
    if manifest.get("type") == "file":
        collected.append(manifest)
    if not any(item.get("name") == "PaddleOCR.kt" for item in collected):
        raise RuntimeError("The pinned upstream SDK listing did not include PaddleOCR.kt; refusing to prepare a partial SDK.")
    return collected


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="Replace an existing ppocr-sdk folder (backs it up first).")
    args = parser.parse_args()
    destination = ANDROID_ROOT / "ppocr-sdk"
    required = [destination / "src/main/java/com/paddle/ocr/PaddleOCR.kt", *[destination / rel for rel in MODELS]]
    if all(path.exists() and path.stat().st_size > 0 for path in required):
        print("PaddleOCR SDK and model assets already appear prepared; nothing to do.")
        return 0
    if destination.exists() and not args.force:
        raise SystemExit(f"{destination} already exists but is incomplete. Use --force to replace it, after backing up any local edits.")

    print(f"Preparing official PaddleOCR Android SDK at pinned commit {PINNED_REV}…")
    sources = collect_sources()
    staging_parent = ANDROID_ROOT
    with tempfile.TemporaryDirectory(prefix="paddle-ocr-setup-", dir=staging_parent) as temp_name:
        staging = Path(temp_name) / "ppocr-sdk"
        (staging / "src/main/java/com/paddle/ocr").mkdir(parents=True, exist_ok=True)
        checksums: list[dict[str, object]] = []
        for item in sources:
            full_path = item["path"]
            rel = full_path.split(f"{MODULE_REL.as_posix()}/", 1)[1]
            target = staging / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            download_url = item.get("download_url")
            if not download_url:
                download_url = f"https://raw.githubusercontent.com/PaddlePaddle/PaddleOCR/{PINNED_REV}/{full_path}"
            content = request_bytes(download_url, 2 * 1024 * 1024)
            target.write_bytes(content)
            checksums.append({"path": target.relative_to(staging).as_posix(), "bytes": len(content), "sha256": hashlib.sha256(content).hexdigest()})
        (staging / "build.gradle").write_text(SDK_BUILD_GRADLE, encoding="utf-8")
        (staging / "THIRD-PARTY-NOTICES.md").write_text(SDK_LICENSE_NOTE, encoding="utf-8")
        for relative, (url, limit) in MODELS.items():
            target = staging / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            print(f"Downloading {relative}…")
            payload = request_bytes(url, limit)
            lowered = payload.lstrip().lower()
            if relative.endswith(".onnx") and (len(payload) < 100_000 or lowered.startswith(b"<html") or lowered.startswith(b"<!doctype html")):
                raise RuntimeError(f"Downloaded model doesn't look like an ONNX file: {relative}")
            if relative.endswith(".yml") and b"character_list" not in payload:
                raise RuntimeError("Recognition inference.yml lacks the expected character_list configuration.")
            target.write_bytes(payload)
            checksums.append({"path": target.relative_to(staging).as_posix(), "bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()})
        (staging / "NATIVE-OCR-ASSETS-MANIFEST.json").write_text(json.dumps({
            "paddleocr_commit": PINNED_REV,
            "models": "PP-OCRv6 tiny ONNX; fetched from official PaddlePaddle Hugging Face model repositories at preparation time",
            "files": checksums,
        }, indent=2) + "\n", encoding="utf-8")
        if destination.exists():
            backup = ANDROID_ROOT / "ppocr-sdk.backup"
            if backup.exists(): shutil.rmtree(backup)
            destination.rename(backup)
            print(f"Existing SDK moved to {backup}")
        shutil.copytree(staging, destination)
    print("PaddleOCR source and model assets are ready.")
    print("Next: open android-widget/ in Android Studio, sync Gradle, and build/install the app.")
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Native OCR preparation failed: {exc}", file=sys.stderr)
        print("No PocketWise UI or transaction files were modified by this script.", file=sys.stderr)
        raise SystemExit(2)
