import cv2
import numpy as np
from pathlib import Path

# =========================
# SETTINGS
# =========================

INPUT_DIR = Path("input")
OUTPUT_DIR = Path("output")

# محدوده تقریبی لوگوی تکنولایف
# x1, y1, x2, y2
LOGO_BOX = (25, 25, 180, 105)

# شدت inpainting
INPAINT_RADIUS = 5

# =========================
# CREATE LOGO MASK
# =========================

def create_logo_mask(reference_path):
    """
    یک عکس نمونه که لوگوی تکنولایف در آن وجود دارد
    برای ساخت ماسک استفاده می‌شود.
    """

    image = cv2.imread(str(reference_path))

    if image is None:
        raise ValueError(f"Cannot read reference image: {reference_path}")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    mask = np.zeros(gray.shape, dtype=np.uint8)

    x1, y1, x2, y2 = LOGO_BOX

    # داخل محدوده لوگو، پیکسل‌های غیر سفید را پیدا می‌کنیم
    roi = gray[y1:y2, x1:x2]

    local_mask = np.where(roi < 245, 255, 0).astype(np.uint8)

    # کمی تمیز کردن ماسک
    kernel = np.ones((3, 3), np.uint8)

    local_mask = cv2.morphologyEx(
        local_mask,
        cv2.MORPH_CLOSE,
        kernel,
        iterations=1
    )

    local_mask = cv2.morphologyEx(
        local_mask,
        cv2.MORPH_OPEN,
        kernel,
        iterations=1
    )

    mask[y1:y2, x1:x2] = local_mask

    return mask


# =========================
# PROCESS IMAGE
# =========================

def remove_logo(image, mask):

    # اگر ناحیه لوگو تقریباً سفید باشد،
    # مستقیماً سفیدش می‌کنیم.
    masked_pixels = image[mask > 0]

    if len(masked_pixels) > 0:
        average = np.mean(masked_pixels)

        # عکس‌هایی که لوگو روی زمینه سفید است
        if average > 215:
            result = image.copy()
            result[mask > 0] = (255, 255, 255)
            return result

    # اگر لوگو روی محصول قرار گرفته باشد،
    # از Inpainting استفاده می‌کنیم.
    result = cv2.inpaint(
        image,
        mask,
        INPAINT_RADIUS,
        cv2.INPAINT_TELEA
    )

    return result


# =========================
# MAIN
# =========================

def main():

    OUTPUT_DIR.mkdir(exist_ok=True)

    files = []

    for extension in ["*.jpg", "*.jpeg", "*.png", "*.webp"]:
        files.extend(INPUT_DIR.glob(extension))

    if not files:
        print("No images found in input folder.")
        return

    # اولین عکس به عنوان reference استفاده می‌شود
    reference = files[0]

    print(f"Reference: {reference.name}")

    mask = create_logo_mask(reference)

    # ذخیره ماسک برای بررسی
    cv2.imwrite(
        str(OUTPUT_DIR / "logo_mask.png"),
        mask
    )

    for index, file in enumerate(files, 1):

        print(f"[{index}/{len(files)}] Processing: {file.name}")

        image = cv2.imread(str(file))

        if image is None:
            print(f"  Could not read {file.name}")
            continue

        result = remove_logo(image, mask)

        output_file = OUTPUT_DIR / file.name

        cv2.imwrite(
            str(output_file),
            result
        )

    print()
    print("Finished!")
    print(f"Output folder: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()