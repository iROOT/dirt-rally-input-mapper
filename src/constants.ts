import { ActionDefinition } from './types';

export const DIRT_GUID_SUFFIX = '-0000-0000-0000-504944564944';

export const AXIS_NAMES = [
  'di_x_axis',
  'di_y_axis',
  'di_z_axis',
  'di_x_axis_rotation',
  'di_y_axis_rotation',
  'di_z_axis_rotation',
  'di_slider_0',
  'di_slider_1'
];

export const ACTIONS: ActionDefinition[] = [
  // Driving
  { id: 'Steer Left', label: 'Steer Left', category: 'Driving' },
  { id: 'Steer Right', label: 'Steer Right', category: 'Driving' },
  { id: 'Accelerate', label: 'Accelerate (Throttle)', category: 'Driving' },
  { id: 'Brake', label: 'Brake / Reverse', category: 'Driving' },
  { id: 'Clutch', label: 'Clutch', category: 'Driving' },
  { id: 'Handbrake', label: 'Handbrake', category: 'Driving' },
  { id: 'Boost', label: 'Boost', category: 'Driving' },
  
  // Gears
  { id: 'Gear Up', label: 'Gear Up', category: 'Gears' },
  { id: 'Gear Down', label: 'Gear Down', category: 'Gears' },
  { id: 'Gear 1', label: 'Gear 1', category: 'Gears' },
  { id: 'Gear 2', label: 'Gear 2', category: 'Gears' },
  { id: 'Gear 3', label: 'Gear 3', category: 'Gears' },
  { id: 'Gear 4', label: 'Gear 4', category: 'Gears' },
  { id: 'Gear 5', label: 'Gear 5', category: 'Gears' },
  { id: 'Gear 6', label: 'Gear 6', category: 'Gears' },
  { id: 'Gear 7', label: 'Gear 7', category: 'Gears' },
  { id: 'Gear Reverse', label: 'Gear Reverse', category: 'Gears' },

  // Camera & View
  { id: 'Change View', label: 'Change View', category: 'Camera' },
  { id: 'Look Left', label: 'Look Left', category: 'Camera' },
  { id: 'Look Right', label: 'Look Right', category: 'Camera' },
  { id: 'Look Up', label: 'Look Up', category: 'Camera' },
  { id: 'Look Down', label: 'Look Down', category: 'Camera' },
  { id: 'Look Back', label: 'Look Back', category: 'Camera' },
  { id: 'Cycle Forward On Board Cameras', label: 'Cycle On-Board Cameras', category: 'Camera' },
  { id: 'Headlights', label: 'Headlights', category: 'Camera' },
  { id: 'Wipers', label: 'Wipers', category: 'Camera' },

  // Replay System
  { id: 'Instant Replay', label: 'Instant Replay', category: 'Replay' },
  { id: 'Activate Replay System', label: 'Activate Replay', category: 'Replay' },
  { id: 'Replay Rewind', label: 'Rewind', category: 'Replay' },
  { id: 'Replay Fast Forward', label: 'Fast Forward', category: 'Replay' },
  { id: 'Replay Pause', label: 'Pause/Play', category: 'Replay' },
  { id: 'Replay Next Camera', label: 'Next Camera', category: 'Replay' },
  { id: 'Replay Prev Camera', label: 'Previous Camera', category: 'Replay' },
  { id: 'Replay Exit', label: 'Exit Replay', category: 'Replay' },
  { id: 'Replay UI On Off', label: 'Toggle Replay UI', category: 'Replay' },
  { id: 'Replay Jump In', label: 'Take Control (Jump In)', category: 'Replay' },
  { id: 'Replay Audio Mute', label: 'Mute Audio', category: 'Replay' },
  { id: 'Replay Youtube', label: 'Open YouTube Menu', category: 'Replay' },
  
  // YouTube Legacy
  { id: 'Youtube Drag Left', label: 'YouTube Drag Left', category: 'Replay' },
  { id: 'Youtube Drag Right', label: 'YouTube Drag Right', category: 'Replay' },
  { id: 'Youtube Speed Up', label: 'YouTube Speed Up', category: 'Replay' },
  { id: 'Youtube Speed Down', label: 'YouTube Speed Down', category: 'Replay' },
  { id: 'Youtube Upload', label: 'YouTube Upload', category: 'Replay' },
  { id: 'Youtube Exit', label: 'YouTube Exit', category: 'Replay' },

  // Seat Adjustment
  { id: 'SeatMoveForward', label: 'Seat Forward', category: 'Seat' },
  { id: 'SeatMoveBackward', label: 'Seat Backward', category: 'Seat' },
  { id: 'SeatMoveUp', label: 'Seat Up', category: 'Seat' },
  { id: 'SeatMoveDown', label: 'Seat Down', category: 'Seat' },
  { id: 'SeatTiltUp', label: 'Seat Tilt Up', category: 'Seat' },
  { id: 'SeatTiltDown', label: 'Seat Tilt Down', category: 'Seat' },
  { id: 'SeatReset', label: 'Reset Seat', category: 'Seat' },

  // Menu
  { id: 'Pause', label: 'Pause / Menu', category: 'Menu' },
  { id: 'Menu Up', label: 'Menu Up', category: 'Menu' },
  { id: 'Menu Down', label: 'Menu Down', category: 'Menu' },
  { id: 'Menu Left', label: 'Menu Left', category: 'Menu' },
  { id: 'Menu Right', label: 'Menu Right', category: 'Menu' },
  { id: 'Menu Select', label: 'Menu Select (Ok)', category: 'Menu' },
  { id: 'Menu Back', label: 'Menu Back (Cancel)', category: 'Menu' },
  { id: 'Menu Start Button', label: 'Menu Start', category: 'Menu' },
  { id: 'Menu Left Shoulder', label: 'Menu Tab Left (LB)', category: 'Menu' },
  { id: 'Menu Right Shoulder', label: 'Menu Tab Right (RB)', category: 'Menu' },
  { id: 'Menu Button3', label: 'Menu Button 3 (Y/Tri)', category: 'Menu' },
  { id: 'Menu Button4', label: 'Menu Button 4 (X/Sqr)', category: 'Menu' },
  { id: 'Menu Scroll Up', label: 'Menu Scroll Up', category: 'Menu' },
  { id: 'Menu Scroll Down', label: 'Menu Scroll Down', category: 'Menu' },

  // Showroom (FE View Tweak)
  { id: 'Fe View Tweak Left', label: 'Showroom Rotate Left', category: 'Showroom' },
  { id: 'Fe View Tweak Right', label: 'Showroom Rotate Right', category: 'Showroom' },
  { id: 'Fe View Tweak Up', label: 'Showroom Rotate Up', category: 'Showroom' },
  { id: 'Fe View Tweak Down', label: 'Showroom Rotate Down', category: 'Showroom' },
  { id: 'Fe View Tweak In', label: 'Showroom Zoom In', category: 'Showroom' },
  { id: 'Fe View Tweak Out', label: 'Showroom Zoom Out', category: 'Showroom' },

  // Misc & Spectator
  { id: 'Reset Vehicle', label: 'Recover Vehicle', category: 'Driving' },
  { id: 'Horn', label: 'Horn', category: 'Driving' },
  { id: 'Push To Speak', label: 'Push To Speak', category: 'Misc' },
  { id: 'VRSensorReset', label: 'Reset VR Sensor', category: 'Misc' },
  { id: 'SeparationInc', label: '3D Separation Inc', category: 'Misc' },
  { id: 'SeparationDec', label: '3D Separation Dec', category: 'Misc' },
  { id: 'ViewPlaneInc', label: '3D View Plane Inc', category: 'Misc' },
  { id: 'ViewPlaneDec', label: '3D View Plane Dec', category: 'Misc' },
  { id: 'Spectator Next Camera', label: 'Spectator Next Camera', category: 'Spectator' },
  { id: 'Spectator Previous Camera', label: 'Spectator Prev Camera', category: 'Spectator' },
  { id: 'Spectator UI On Off', label: 'Toggle Spectator UI', category: 'Spectator' },
  { id: 'Spectator List On Off', label: 'Toggle Spectator List', category: 'Spectator' },
];