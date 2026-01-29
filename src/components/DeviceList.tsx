import React from 'react';
import { DetectedDevice } from '../types';
import { translations, Language } from '../translations';

interface DeviceListProps {
  devices: DetectedDevice[];
  selectedGuids: Set<string>;
  toggleDevice: (guid: string) => void;
  onMoveDevice: (guid: string, direction: 'up' | 'down') => void;
  lang: Language;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, selectedGuids, toggleDevice, onMoveDevice, lang }) => {
  const t = translations[lang];

  if (devices.length === 0) {
    return (
      <div className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 animate-pulse transition-all duration-300">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-1">{t.waitingInput}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">{t.waitingInputDesc}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-[#161b22]/80 backdrop-blur-md rounded-xl p-5 border border-gray-200 dark:border-gray-700/50 shadow-sm transition-colors duration-200">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
        {t.detectedDevices}
      </h2>
      <div className="grid gap-3 grid-cols-1">
        {devices.map((device, index) => {
          const isSelected = selectedGuids.has(device.guid);
          const isFirst = index === 0;
          const isLast = index === devices.length - 1;

          return (
            <div 
              key={`${device.id}-${device.index}`}
              onClick={() => toggleDevice(device.guid)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 group cursor-pointer overflow-hidden
                ${isSelected 
                  ? 'bg-orange-50/50 dark:bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                  : 'bg-white dark:bg-[#0d1117] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {/* Active Indicator Strip */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
              )}

              <div className="flex items-start justify-between pl-2">
                <div className="flex-1 min-w-0 mr-4">
                  {/* Priority Badge */}
                  <div className="flex items-center gap-2 mb-1">
                     <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${isSelected ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}>
                        {t.ui.id}: {index}
                     </span>
                     {isSelected && <span className="text-[10px] text-orange-600 dark:text-orange-500 font-bold tracking-wider animate-pulse">{t.ui.active}</span>}
                  </div>

                  <h3 className={`font-bold text-sm truncate transition-colors ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} title={device.name}>
                    {device.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] font-mono text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full"></span>
                        {t.axes}: {device.axesCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-purple-500/50 rounded-full"></span>
                        {t.btns}: {device.buttonsCount}
                    </span>
                    <span className="opacity-50">VID: {device.vid}</span>
                    <span className="opacity-50">PID: {device.pid}</span>
                  </div>
                </div>
                
                {/* Selection Checkbox Visual */}
                <div className={`
                  w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
                  ${isSelected 
                    ? 'bg-orange-500 border-orange-500' 
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }
                `}>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between pl-2">
                 <div className="text-[10px] text-gray-400 truncate max-w-[220px] font-mono opacity-60" title={device.guid}>
                    {device.guid}
                 </div>

                {/* Move Controls */}
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => onMoveDevice(device.guid, 'up')}
                    disabled={isFirst}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title={t.moveUp}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onMoveDevice(device.guid, 'down')}
                    disabled={isLast}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title={t.moveDown}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Browser Limit Warning */}
      {devices.length >= 4 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-lg flex items-start gap-3 animate-fade-in">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed font-medium">
                {t.browserLimitDesc}
            </p>
        </div>
      )}
    </div>
  );
};
