/**
 * Yêu cầu bật toàn màn hình (ẩn thanh địa chỉ URL) và khóa xoay ngang màn hình (landscape).
 * Trình duyệt yêu cầu hàm này phải được kích hoạt từ thao tác của người dùng (click, tap).
 */
export async function enterFullscreenAndLockLandscape(): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // 1. Kích hoạt toàn màn hình (Fullscreen) để ẩn thanh địa chỉ trình duyệt
  try {
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      mozFullScreenElement?: Element;
      msFullscreenElement?: Element;
    };
    const isFullscreen = Boolean(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isFullscreen) {
      const docEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };

      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
    }
  } catch (err) {
    // Không chặn luồng nếu fullscreen không được cấp phép hoặc thiết bị không hỗ trợ
    console.warn("[Fullscreen] Failed to request fullscreen:", err);
  }

  // 2. Khóa xoay ngang màn hình (Landscape orientation)
  try {
    const screenOrientation = window.screen?.orientation as
      | (ScreenOrientation & {
          lock?: (orientation: "landscape" | "landscape-primary" | "landscape-secondary" | "portrait" | "portrait-primary" | "portrait-secondary" | "natural" | "any") => Promise<void>;
        })
      | undefined;

    if (screenOrientation && typeof screenOrientation.lock === "function") {
      await screenOrientation.lock("landscape");
    }
  } catch (err) {
    // Thiết bị (như iOS Safari) có thể không hỗ trợ Orientation Lock API
    console.warn("[Orientation] Failed to lock landscape orientation:", err);
  }
}

/**
 * Kiểm tra xem trình duyệt có đang ở chế độ toàn màn hình hay không.
 */
export function isFullscreenActive(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  const doc = document as Document & {
    webkitFullscreenElement?: Element;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
  };
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

/**
 * Thoát chế độ toàn màn hình (như bấm ESC) và mở khóa xoay màn hình.
 */
export async function exitFullscreenAndUnlock(): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  try {
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
      mozCancelFullScreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
    };

    if (isFullscreenActive()) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    }
  } catch (err) {
    console.warn("[Fullscreen] Failed to exit fullscreen:", err);
  }

  try {
    const screenOrientation = window.screen?.orientation as
      | (ScreenOrientation & {
          unlock?: () => void;
        })
      | undefined;

    if (screenOrientation && typeof screenOrientation.unlock === "function") {
      screenOrientation.unlock();
    }
  } catch (err) {
    console.warn("[Orientation] Failed to unlock orientation:", err);
  }
}

