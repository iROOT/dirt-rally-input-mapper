export const GameActions = [
  "Accelerate",
  "Activate Replay System",
  "Boost",
  "Brake",
  "Change View",
  "Clutch",
  "Cycle Forward On Board Cameras",
  "Fe View Tweak Down",
  "Fe View Tweak In",
  "Fe View Tweak Left",
  "Fe View Tweak Out",
  "Fe View Tweak Right",
  "Fe View Tweak Up",
  "Gear 1",
  "Gear 2",
  "Gear 3",
  "Gear 4",
  "Gear 5",
  "Gear 6",
  "Gear 7",
  "Gear Down",
  "Gear Reverse",
  "Gear Up",
  "Handbrake",
  "Headlights",
  "Horn",
  "Instant Replay",
  "Look Back",
  "Look Down",
  "Look Left",
  "Look Right",
  "Look Up",
  "Menu Back",
  "Menu Button3",
  "Menu Button4",
  "Menu Cursor Button",
  "Menu Down",
  "Menu Left",
  "Menu Left Shoulder",
  "Menu Right",
  "Menu Right Shoulder",
  "Menu Scroll Down",
  "Menu Scroll Up",
  "Menu Select",
  "Menu Select Button",
  "Menu Start Button",
  "Menu Up",
  "Pause",
  "Push To Speak",
  "Replay Audio Mute",
  "Replay Exit",
  "Replay Fast Forward",
  "Replay Jump In",
  "Replay Next Camera",
  "Replay Pause",
  "Replay Prev Camera",
  "Replay Rewind",
  "Replay UI On Off",
  "Replay Youtube",
  "Reset Vehicle",
  "SeatMoveBackward",
  "SeatMoveDown",
  "SeatMoveForward",
  "SeatMoveUp",
  "SeatReset",
  "SeatTiltDown",
  "SeatTiltUp",
  "SeparationDec",
  "SeparationInc",
  "Spectator List On Off",
  "Spectator Next Camera",
  "Spectator Previous Camera",
  "Spectator UI On Off",
  "Steer Left",
  "Steer Right",
  "VRSensorReset",
  "ViewPlaneDec",
  "ViewPlaneInc",
  "Wipers",
  "Youtube Drag Left",
  "Youtube Drag Right",
  "Youtube Exit",
  "Youtube Speed Down",
  "Youtube Speed Up",
  "Youtube Upload"
] as const;
export type GameActionId = typeof GameActions[number];

export const AxisCalibrationTypes = [
  "biDirLower",
  "biDirUpper",
  "uniDirNeg",
  "uniDirPos"
] as const;
export type AxisCalibrationType = typeof AxisCalibrationTypes[number];

export enum InputType {
  BUTTON = 'button',
  AXIS = 'axis'
}

export interface InputMapping {
  deviceGuid: string;
  deviceIndex: number;
  deviceName: string;
  type: InputType;
  index: number;
  direction?: 'positive' | 'negative';
  calibration?: AxisCalibrationType;
  deadzone?: number;
  saturation?: number;
}

export interface MappingState {
  [actionId: string]: InputMapping[];
}

export interface DetectedDevice {
  index: number;
  id: string;
  name: string;
  vid: string;
  pid: string;
  guid: string;
  axesCount: number;
  buttonsCount: number;
}

export interface ActionDefinition {
  id: GameActionId;
  label: string;
  category: string;
}
