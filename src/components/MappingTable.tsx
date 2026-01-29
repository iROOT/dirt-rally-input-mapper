import React, { useMemo, useState } from 'react';
import { ACTIONS } from '../constants';
import { MappingState, ActionDefinition, AxisCalibrationType, AxisCalibrationTypes } from '../types';
import { translations, Language } from '../translations';
import { InputVisualizer } from './InputVisualizer';

interface MappingTableProps {
  mappings: MappingState;
  listeningId: string | null;
  onBindClick: (actionId: string) => void;
  onRemoveClick: (actionId: string, index: number) => void;
  onUpdateMapping: (actionId: string, index: number, updates: any) => void;
  lang: Language;
  hasSelectedDevices: boolean;
}

export const MappingTable: React.FC<MappingTableProps> = ({ 
  mappings, 
  listeningId, 
  onBindClick, 
  onRemoveClick,
  onUpdateMapping,
  lang,
  hasSelectedDevices
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const filteredActions = useMemo(() => {
    if (!search) return ACTIONS;
    const s = search.toLowerCase();
    return ACTIONS.filter(a => 
      a.label.toLowerCase().includes(s) || 
      a.id.toLowerCase().includes(s) ||
      (t.actions[a.id] && t.actions[a.id].toLowerCase().includes(s))
    );
  }, [search, lang]);

  const groupedActions = useMemo(() => {
    const groups: Record<string, ActionDefinition[]> = {};
    filteredActions.forEach(action => {
      if (!groups[action.category]) groups[action.category] = [];
      groups[action.category].push(action);
    });
    return groups;
  }, [filteredActions]);

  return (
    <div className="space-y-8 pb-10">
      {/* Search Bar & Notice */}
      <div className="sticky top-4 lg:top-8 z-40 flex flex-col items-center gap-4 pointer-events-none">
        <div 
            className={`
                pointer-events-auto relative group rounded-2xl 
                shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]
                transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                ${(isFocused || search) ? 'w-full' : 'w-[90%] md:w-[94%]'}
            `}
        >
          {/* Glass Background Layer */}
          <div className="absolute inset-0 bg-white/75 dark:bg-[#161b22]/75 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 group-focus-within:border-orange-500/50 group-focus-within:bg-white/90 dark:group-focus-within:bg-[#161b22]/90 transition-all duration-300"></div>

          {/* Input Content Layer */}
          <div className="relative flex items-center px-5 py-3.5">
             <div className={`flex-shrink-0 mr-3 transition-colors duration-300 ${isFocused ? 'text-orange-500' : 'text-gray-400'}`}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
             </div>
             <input 
                type="text"
                placeholder={t.ui.searchPlaceholder}
                className="flex-1 bg-transparent border-none text-gray-900 dark:text-gray-100 placeholder-gray-500/70 focus:outline-none text-base font-medium h-full w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
          </div>
        </div>

        {/* Missing Device Selection Banner */}
        {!hasSelectedDevices && (
          <div className="pointer-events-auto w-[90%] md:w-[94%] bg-red-500/10 dark:bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-xl p-3 flex items-center gap-3 animate-pulse shadow-lg">
             <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             </div>
             <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">
               {t.pleaseSelectDevice}
             </p>
          </div>
        )}
      </div>

      {(Object.entries(groupedActions) as [string, ActionDefinition[]][]).map(([category, actions]) => (
        <div key={category} className="bg-white dark:bg-[#161b22] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Category Header */}
          <div className="bg-gray-50/80 dark:bg-[#0d1117]/80 backdrop-blur px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 z-10">
            <h3 className="font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-sm"></span>
              {t.categories[category] || category}
            </h3>
            <span className="text-[10px] font-mono text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">{actions.length}</span>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {actions.map(action => {
              const actionMappings = mappings[action.id] || [];
              const isListening = listeningId === action.id;

              return (
                <div 
                  key={action.id} 
                  className={`
                    flex flex-col md:flex-row md:items-start justify-between p-4 md:p-5 transition-all duration-300
                    ${isListening 
                      ? 'bg-orange-50 dark:bg-orange-900/10 shadow-[inset_3px_0_0_0_#f97316]' 
                      : 'hover:bg-gray-50 dark:hover:bg-[#1c2128]'
                    }
                  `}
                >
                  {/* Action Name Column */}
                  <div className="md:w-1/3 mb-3 md:mb-0 pr-4">
                    <div className={`font-bold text-sm ${isListening ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {t.actions[action.id] || action.label}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{action.id}</div>
                  </div>
                  
                  {/* Mappings Column */}
                  <div className="flex-1 px-0 md:px-2 flex flex-wrap gap-2 items-center min-h-[32px]">
                    {actionMappings.length > 0 ? (
                      actionMappings.map((mapping, idx) => (
                        <div key={idx} className="group relative flex items-center bg-gray-100 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded overflow-hidden shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                          
                          {/* Device Name Section */}
                          <div className="px-2 py-1.5 flex flex-col justify-center border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#161b22]">
                             <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 truncate max-w-[80px] md:max-w-[100px]" title={mapping.deviceName}>
                               {mapping.deviceName}
                             </span>
                          </div>

                          {/* Input Info Section (The "Screen") */}
                          <div className="px-3 py-1.5 bg-white dark:bg-black/20 flex items-center gap-3">
                              {/* Live Visualizer */}
                              <InputVisualizer 
                                deviceIndex={mapping.deviceIndex} 
                                type={mapping.type} 
                                index={mapping.index} 
                              />

                              <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                                {mapping.type === 'axis' ? `AXIS ${mapping.index}` : `BTN ${mapping.index}`}
                              </span>
                              
                              {mapping.type === 'axis' && (
                                <select 
                                    className="bg-transparent text-[10px] font-medium text-gray-500 dark:text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer uppercase tracking-wider text-right appearance-none"
                                    value={mapping.calibration || 'uniDirPos'}
                                    onChange={(e) => onUpdateMapping(action.id, idx, { calibration: e.target.value })}
                                    title="Calibration Type"
                                >
                                    {AxisCalibrationTypes.map(type => (
                                        <option key={type} value={type} className="text-gray-900 bg-white">{type}</option>
                                    ))}
                                </select>
                              )}
                          </div>

                          {/* Delete Button */}
                          <button 
                            onClick={() => onRemoveClick(action.id, idx)}
                            className="px-2 py-1.5 hover:bg-red-500 hover:text-white text-gray-400 transition-colors border-l border-gray-200 dark:border-gray-700 flex items-center h-full"
                            title={t.removeBinding}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400/50 italic flex items-center h-full select-none px-2">
                         —
                      </span>
                    )}
                  </div>

                  {/* Action Button Column */}
                  <div className="md:w-28 flex justify-end mt-3 md:mt-0 pl-2">
                    <button
                      onClick={() => onBindClick(action.id)}
                      className={`
                        w-full md:w-auto px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border
                        ${!hasSelectedDevices 
                          ? 'bg-gray-100 dark:bg-[#1c2128] text-gray-300 dark:text-gray-700 border-gray-200 dark:border-gray-800 cursor-not-allowed grayscale' 
                          : isListening 
                            ? 'bg-orange-500 text-white border-orange-600 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.4)] hover:bg-orange-600' 
                            : actionMappings.length > 0 
                              ? 'bg-white dark:bg-[#21262d] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-500 hover:text-orange-500 dark:hover:text-orange-400 dark:hover:border-orange-500'
                              : 'bg-gray-100 dark:bg-[#21262d] text-gray-500 dark:text-gray-400 border-transparent hover:bg-white dark:hover:bg-[#30363d] hover:text-orange-600 dark:hover:text-white shadow-sm'
                        }
                      `}
                      title={!hasSelectedDevices ? t.pleaseSelectDevice : ''}
                    >
                      {!hasSelectedDevices ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {t.bind}
                        </div>
                      ) : (
                        isListening ? t.binding : (actionMappings.length > 0 ? t.add : t.bind)
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {filteredActions.length === 0 && (
        <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
           <p className="text-gray-500 font-medium">
             {t.ui.noActionsFound}
           </p>
        </div>
      )}
    </div>
  );
};
