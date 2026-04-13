export const FLOW_URL = 'https://labs.google/fx/es/tools/flow';
export const FLOW_BASE = 'https://labs.google';
export const LOGIN_URL = 'accounts.google.com';

export const SELECTORS = {
  // Model selector
  MODEL_SELECTOR_BUTTON: [
    'button[data-testid="model-selector"]',
    'button[aria-haspopup="dialog"][aria-expanded]',
    'button:has-text("Veo")',
    'button:has-text("Nano Banana")',
    'button:has-text("Imagen")',
  ],

  // Video tab in model selector panel
  VIDEO_TAB: [
    'button[role="tab"]:has-text("Video")',
    'button:has-text("videocam")',
    '[role="tab"]:has-text("Vídeo")',
    'button:has-text("Vídeo")',
  ],

  // Image tab (to detect wrong mode)
  IMAGE_TAB: [
    'button[role="tab"]:has-text("Imagen")',
    'button[role="tab"]:has-text("Image")',
  ],

  // Model options
  MODEL_VEO: [
    'text="Veo 3.1 - Fast"',
    'text="Veo 3.1"',
    '[data-testid="model-option-veo"]',
  ],

  // Prompt input
  PROMPT_INPUT: [
    'textarea[aria-label*="prompt"]',
    'textarea[aria-label*="Prompt"]',
    'textarea[placeholder*="Describe"]',
    'textarea[placeholder*="describe"]',
    'textarea',
  ],

  // Create/Generate button
  CREATE_BUTTON: [
    'button[aria-label*="Crear"]',
    'button[aria-label*="Create"]',
    'button:has-text("Crear")',
    'button:has-text("Create")',
    'button:has-text("arrow_forward")',
  ],

  // Progress indicators
  PROGRESS_BAR: [
    '[role="progressbar"]',
    '.progress-indicator',
    '[data-testid="generation-progress"]',
  ],
  PROGRESS_TEXT: [
    '.progress-text',
    '[aria-label*="progress"]',
    '[aria-label*="progreso"]',
  ],

  // Video result
  VIDEO_PLAYER: [
    'video',
    '[data-testid="video-result"]',
    'video[src]',
  ],

  // Download
  DOWNLOAD_BUTTON: [
    'button[aria-label*="Download"]',
    'button[aria-label*="Descargar"]',
    'button[aria-label*="download"]',
    'button:has-text("Download")',
    'button:has-text("Descargar")',
  ],
  MORE_OPTIONS_BUTTON: [
    'button[aria-label*="More"]',
    'button[aria-label*="Más"]',
    'button[aria-label*="more_vert"]',
    'button:has-text("more_vert")',
  ],
  DOWNLOAD_MENU_ITEM: [
    '[role="menuitem"]:has-text("Download")',
    '[role="menuitem"]:has-text("Descargar")',
    'li:has-text("Download")',
    'li:has-text("Descargar")',
  ],

  // Projects
  NEW_PROJECT_BUTTON: [
    'button:has-text("Nuevo proyecto")',
    'button:has-text("New project")',
    'button[aria-label*="New"]',
    'button[aria-label*="Nuevo"]',
  ],
  PROJECT_CARDS: [
    '[data-testid="project-card"]',
    '.project-item',
    'a[href*="/flow/project/"]',
  ],

  // Error states
  ERROR_BANNER: [
    '[role="alert"]',
    '.error-message',
    '[data-testid="error"]',
  ],

  // Aspect ratio selector
  ASPECT_RATIO: [
    'button[aria-label*="aspect"]',
    'button[aria-label*="relación"]',
    'button:has-text("16:9")',
    'button:has-text("9:16")',
    'button:has-text("1:1")',
  ],
} as const;

export type SelectorKey = keyof typeof SELECTORS;

/**
 * Try each selector in the array until one matches, return the first match.
 */
export function getSelectorCascade(key: SelectorKey): string[] {
  return [...SELECTORS[key]];
}
