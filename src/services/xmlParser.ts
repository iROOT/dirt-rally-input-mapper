import { AXIS_NAMES } from '../constants';
import { MappingState, InputMapping, InputType, AxisCalibrationType } from '../types';

export const parseXml = (xmlString: string): MappingState => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  const actionMap = doc.querySelector("ActionMap");

  if (!actionMap) throw new Error("Invalid XML: No ActionMap found");

  const mappings: MappingState = {};

  const actions = doc.querySelectorAll("Action");
  
  actions.forEach(action => {
    const actionId = action.getAttribute("id");
    if (!actionId) return;

    const actionMappings: InputMapping[] = [];
    // In DiRT Rally XML, both buttons and axes are usually defined as <Axis> tags
    const inputs = action.querySelectorAll("Axis"); 

    inputs.forEach(input => {
       const inputId = input.getAttribute("id");
       if (!inputId) return;

       let type: InputType;
       let index: number;

       if (inputId.startsWith("di_button_")) {
         type = InputType.BUTTON;
         index = parseInt(inputId.replace("di_button_", ""), 10);
       } else {
         type = InputType.AXIS;
         // Try to find in named axes (di_x_axis, etc.)
         index = AXIS_NAMES.indexOf(inputId);
         if (index === -1) {
            // Try generic di_axis_X format if used
            const match = inputId.match(/di_axis_(\d+)/);
            if (match) {
                index = parseInt(match[1], 10);
            } else {
                return; // Unknown axis type, skip
            }
         }
       }

       // We rely on restricted_device to map back to specific controllers
       const guid = input.getAttribute("restricted_device");
       
       // If restricted_device is missing, we might try to map via device_type_x attributes on ActionMap
       // But for robustness, we primarily look for the explicit GUID. 
       // If no GUID is found, we skip because we can't be sure which device it belongs to in a web context.
       if (!guid) return; 

       const calibration = input.getAttribute("type") as AxisCalibrationType | null;
       const deadzone = parseFloat(input.getAttribute("deadzone") || "0.0");
       const saturation = parseFloat(input.getAttribute("saturation") || "1.0");

       // We set placeholder values for deviceName and deviceIndex. 
       // The App logic must reconcile these with currently connected devices.
       actionMappings.push({
         deviceGuid: guid,
         deviceIndex: -1, 
         deviceName: "Unknown/Imported", 
         type,
         index,
         calibration: calibration || undefined,
         deadzone,
         saturation
       });
    });

    if (actionMappings.length > 0) {
        mappings[actionId] = actionMappings;
    }
  });

  return mappings;
};