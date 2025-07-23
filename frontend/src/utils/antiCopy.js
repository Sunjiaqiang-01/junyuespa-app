/**
 * 防复制保护工具
 * 用于技师详情页等敏感页面
 */

/**
 * 禁用右键菜单
 */
export function disableContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
}

/**
 * 禁用文本选择
 */
export function disableTextSelection() {
  // CSS方式禁用选择
  const style = document.createElement('style');
  style.textContent = `
    .no-select {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);

  // JavaScript方式禁用选择
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });
}

/**
 * 禁用复制快捷键
 */
export function disableCopyShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 禁用 Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, F12 等
    if (e.ctrlKey && (
      e.keyCode === 67 || // Ctrl+C
      e.keyCode === 65 || // Ctrl+A
      e.keyCode === 83 || // Ctrl+S
      e.keyCode === 80 || // Ctrl+P
      e.keyCode === 85    // Ctrl+U
    )) {
      e.preventDefault();
      return false;
    }

    // 禁用 F12 开发者工具
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // 禁用 Ctrl+Shift+I 开发者工具
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      return false;
    }

    // 禁用 Ctrl+Shift+C 元素检查
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      e.preventDefault();
      return false;
    }
  });
}

/**
 * 禁用长按操作（移动端）
 */
export function disableLongPress() {
  let pressTimer;

  document.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => {
      e.preventDefault();
    }, 500);
  });

  document.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  });

  document.addEventListener('touchmove', () => {
    clearTimeout(pressTimer);
  });
}

/**
 * 防截图检测（基础版本）
 */
export function detectScreenshot() {
  // 检测页面失焦（可能在截图）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.warn('页面失焦，可能在进行截图操作');
      // 可以在这里添加警告提示或其他处理
    }
  });

  // 检测窗口大小变化（可能在截图工具调整）
  window.addEventListener('resize', () => {
    console.warn('窗口大小变化，请注意保护隐私');
  });
}

/**
 * 图片防复制保护
 */
export function protectImages() {
  // 禁用图片拖拽
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  // 禁用图片右键保存
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  // 为所有图片添加保护属性
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.setAttribute('draggable', 'false');
    img.style.pointerEvents = 'none';
    img.style.userSelect = 'none';
  });
}

/**
 * 启用完整的防复制保护
 * @param {Object} options - 配置选项
 */
export function enableAntiCopyProtection(options = {}) {
  const {
    disableRightClick = true,
    disableSelection = true,
    disableShortcuts = true,
    disableLongPress = true,
    protectImages = true,
    detectScreenshot = false
  } = options;

  if (disableRightClick) {
    disableContextMenu();
  }

  if (disableSelection) {
    disableTextSelection();
  }

  if (disableShortcuts) {
    disableCopyShortcuts();
  }

  if (disableLongPress) {
    disableLongPress();
  }

  if (protectImages) {
    protectImages();
  }

  if (detectScreenshot) {
    detectScreenshot();
  }

  // 添加全局CSS类
  document.body.classList.add('no-select');
  
  console.log('防复制保护已启用');
}

/**
 * 禁用防复制保护
 */
export function disableAntiCopyProtection() {
  // 移除事件监听器比较复杂，通常页面刷新时自动清除
  document.body.classList.remove('no-select');
  console.log('防复制保护已禁用');
}
