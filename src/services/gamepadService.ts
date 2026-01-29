import { DIRT_GUID_SUFFIX } from '../constants';
import { DetectedDevice, InputType } from '../types';

/**
 * Extracts VID and PID from the Gamepad ID string and generates DiRT Rally GUID.
 * Format expected usually: "Name (Vendor: xxxx Product: xxxx)" or similar.
 */
export const parseGamepadId = (idString: string, index: number, gamepad: Gamepad): DetectedDevice => {
  // Regex to find Vendor and Product IDs (4 hex characters)
  // Covers: "Vendor: 046d Product: c24f" and "046d-c24f" variations
  // Added \s* to allow for spaces (e.g. "Vendor: 3670")
  const vendorMatch = idString.match(/(?:Vendor:|vid_)\s*([0-9a-fA-F]{4})/i);
  const productMatch = idString.match(/(?:Product:|pid_)\s*([0-9a-fA-F]{4})/i);

  let vid = '0000';
  let pid = '0000';
  let name = idString;

  if (vendorMatch && productMatch) {
    vid = vendorMatch[1].toUpperCase();
    pid = productMatch[1].toUpperCase();
    
    // Clean up name by removing the ID part if present
    name = idString.replace(/\(Vendor:.*?\)/, '').trim();
    if (!name) name = `Unknown Device ${index + 1}`;
  } 
  // Note: Removed console.warn fallback to prevent console spam during polling

  // Critical: DiRT Rally GUID format is {PID}{VID}-...
  // Note: Little Endian logic implies we might swap them, but DiRT XML usually expects PID then VID in the text string
  const guid = `{${pid}${vid}${DIRT_GUID_SUFFIX}}`;

  return {
    index,
    id: idString,
    name,
    vid,
    pid,
    guid,
    axesCount: gamepad.axes.length,
    buttonsCount: gamepad.buttons.length
  };
};

/**
 * Listens for user input on specific devices.
 * Returns a promise that resolves when an input is detected.
 */
export const detectInput = (
  allowedDeviceIndices: number[],
  signal: AbortSignal
): Promise<{ deviceIndex: number; type: InputType; index: number; direction?: 'positive' | 'negative' }> => {
  return new Promise((resolve, reject) => {
    const baseline = navigator.getGamepads();
    if (!baseline) {
      reject(new Error("Gamepad API not supported"));
      return;
    }

    // Capture initial state values to compare against
    const initialAxes: number[][] = [];
    const initialButtons: boolean[][] = [];

    // Initialize baseline
    for (const idx of allowedDeviceIndices) {
      const gp = baseline[idx];
      if (gp) {
        initialAxes[idx] = [...gp.axes];
        initialButtons[idx] = gp.buttons.map(b => b.pressed);
      }
    }

    const checkLoop = () => {
      if (signal.aborted) {
        reject(new Error("Aborted"));
        return;
      }

      const currentGamepads = navigator.getGamepads();

      for (const idx of allowedDeviceIndices) {
        const gp = currentGamepads[idx];
        if (!gp) continue;

        // 1. Check Buttons
        for (let b = 0; b < gp.buttons.length; b++) {
          // If button is pressed now, but wasn't initially (or is just pressed)
          // We use a simple threshold for analog buttons (triggers)
          const isPressed = gp.buttons[b].pressed;
          const wasPressed = initialButtons[idx] ? initialButtons[idx][b] : false;

          if (isPressed && !wasPressed) {
            resolve({
              deviceIndex: idx,
              type: InputType.BUTTON,
              index: b
            });
            return;
          }
        }

        // 2. Check Axes
        if (initialAxes[idx]) {
          for (let a = 0; a < gp.axes.length; a++) {
            const currentVal = gp.axes[a];
            const initialVal = initialAxes[idx][a];
            const diff = currentVal - initialVal;

            // Threshold: 0.5 to avoid noise and ensure deliberate movement
            if (Math.abs(diff) > 0.5) {
              const direction = diff > 0 ? 'positive' : 'negative';
              resolve({
                deviceIndex: idx,
                type: InputType.AXIS,
                index: a,
                direction
              });
              return;
            }
          }
        }
      }

      requestAnimationFrame(checkLoop);
    };

    requestAnimationFrame(checkLoop);
  });
};