import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DeviceList } from './components/DeviceList';
import { MappingTable } from './components/MappingTable';
import { parseGamepadId, detectInput } from './services/gamepadService';
import { generateXml } from './services/xmlGenerator';
import { parseXml } from './services/xmlParser';
import { DetectedDevice, MappingState, InputMapping } from './types';
import { translations, Language, SUPPORTED_LANGUAGES } from './translations';

const STORAGE_KEY = 'dirt_mapper_config_v1';

type ThemeMode = 'light' | 'dark' | 'system';

function App() {
  const [devices, setDevices] = useState<DetectedDevice[]>([]);
  const [deviceOrder, setDeviceOrder] = useState<string[]>([]);
  const [selectedGuids, setSelectedGuids] = useState<Set<string>>(new Set());
  const [mappings, setMappings] = useState<MappingState>({});
  const [listeningForAction, setListeningForAction] = useState<string | null>(null);

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('app_theme_mode') as ThemeMode) || 'system';
  });

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved && translations[saved]) return saved;

    const shortBrowserLang = navigator.language.split('-')[0].toLowerCase();
    const fullBrowserLang = navigator.language.toLowerCase();

    if (fullBrowserLang === 'pt-br') return 'pt-br';
    if (translations[shortBrowserLang as Language]) return shortBrowserLang as Language;

    return 'en';
  });

  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  // Theme & Lang Initialization
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (isDark: boolean) => {
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(themeMode === 'dark');
    }
  }, [themeMode]);

  // Handle clicks outside of language menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load Config from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mappings) setMappings(parsed.mappings);
        if (parsed.deviceOrder) setDeviceOrder(parsed.deviceOrder);
        if (parsed.selectedGuids) setSelectedGuids(new Set(parsed.selectedGuids));
        showNotification(t.notifications.configRestored, 'success');
      }
    } catch (e) {
      console.error("Failed to load saved config", e);
    }
  }, []);

  // Keyboard Listener for ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && listeningForAction) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listeningForAction]);

  // Auto-save to LocalStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const stateToSave = {
        version: 1,
        timestamp: Date.now(),
        mappings,
        deviceOrder,
        selectedGuids: Array.from(selectedGuids)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, 1000);
    return () => clearTimeout(timer);
  }, [mappings, deviceOrder, selectedGuids]);

  // Reconcile mappings with connected devices
  useEffect(() => {
    if (devices.length === 0) return;
    setMappings(prev => {
      let changed = false;
      const newMappings = { ...prev };
      Object.keys(newMappings).forEach(actionId => {
        newMappings[actionId] = newMappings[actionId].map(m => {
          const foundDevice = devices.find(d => d.guid === m.deviceGuid);
          if (foundDevice) {
            if (m.deviceName !== foundDevice.name || m.deviceIndex !== foundDevice.index) {
              changed = true;
              return { ...m, deviceName: foundDevice.name, deviceIndex: foundDevice.index };
            }
          }
          return m;
        });
      });
      return changed ? newMappings : prev;
    });
  }, [devices]);

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('app_theme_mode', mode);
    setIsThemeMenuOpen(false);
  };

  const handleSelectLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
    setIsLangMenuOpen(false);
  };

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const scanGamepads = () => {
      const gps = navigator.getGamepads();
      const detected: DetectedDevice[] = [];
      for (let i = 0; i < gps.length; i++) {
        const gp = gps[i];
        if (gp && gp.connected) {
          detected.push(parseGamepadId(gp.id, i, gp));
        }
      }
      setDevices(prev => {
        const hash = detected.map(d => d.id).join('|');
        const prevHash = prev.map(d => d.id).join('|');
        return hash !== prevHash ? detected : prev;
      });
    };
    scanGamepads();
    const intervalId = setInterval(scanGamepads, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (devices.length === 0) return;
    setDeviceOrder(prev => {
      const newOrder = [...prev];
      let changed = false;
      devices.forEach(d => {
        if (!newOrder.includes(d.guid)) {
          newOrder.push(d.guid);
          changed = true;
        }
      });
      return changed ? newOrder : prev;
    });
  }, [devices]);

  const sortedDevices = useMemo(() => {
    const deviceMap = new Map(devices.map(d => [d.guid, d]));
    const result = deviceOrder.map(guid => deviceMap.get(guid)).filter((d): d is DetectedDevice => !!d);
    devices.forEach(d => { if (!result.find(r => r.guid === d.guid)) result.push(d); });
    return result;
  }, [devices, deviceOrder]);

  const toggleDevice = (guid: string) => {
    setSelectedGuids(prev => {
      const next = new Set(prev);
      if (next.has(guid)) next.delete(guid);
      else next.add(guid);
      return next;
    });
  };

  const handleMoveDevice = (guid: string, direction: 'up' | 'down') => {
    setDeviceOrder(prev => {
        const index = prev.indexOf(guid);
        if (index === -1) return prev;
        const newOrder = [...prev];
        if (direction === 'up' && index > 0) [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        else if (direction === 'down' && index < newOrder.length - 1) [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        return newOrder;
    });
  };

  const handleBindClick = async (actionId: string) => {
    if (listeningForAction === actionId) {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const activeDeviceIndices = devices.filter(d => selectedGuids.has(d.guid)).map(d => d.index);
    if (activeDeviceIndices.length === 0) {
      showNotification(t.pleaseSelectDevice, 'error');
      return;
    }

    setListeningForAction(actionId);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const result = await detectInput(activeDeviceIndices, abortController.signal);
      const device = devices.find(d => d.index === result.deviceIndex);
      if (!device) throw new Error(t.deviceDisconnected);

      let defaultCalibration: any = 'uniDirPos';
      if (actionId === 'Steer Left') defaultCalibration = 'biDirLower';
      else if (actionId === 'Steer Right') defaultCalibration = 'biDirUpper';

      const newMapping: InputMapping = {
        deviceGuid: device.guid,
        deviceIndex: device.index,
        deviceName: device.name,
        type: result.type,
        index: result.index,
        direction: result.direction,
        calibration: defaultCalibration,
        deadzone: 0.0,
        saturation: 1.0
      };

      setMappings(prev => {
        const currentMappings = prev[actionId] || [];
        const isDuplicate = currentMappings.some(m =>
          m.deviceGuid === newMapping.deviceGuid && m.type === newMapping.type && m.index === newMapping.index && m.direction === newMapping.direction
        );
        if (isDuplicate) return prev;
        return { ...prev, [actionId]: [...currentMappings, newMapping] };
      });
    } catch (err: any) {
      if (err.message !== "Aborted") console.error("Binding error:", err);
    } finally {
      setListeningForAction(prev => prev === actionId ? null : prev);

      if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
      }
    }
  };

  const removeMapping = (actionId: string, mappingIndex: number) => {
    setMappings(prev => {
      const current = prev[actionId];
      if (!current) return prev;
      const updated = current.filter((_, i) => i !== mappingIndex);
      if (updated.length === 0) {
        const next = { ...prev };
        delete next[actionId];
        return next;
      }
      return { ...prev, [actionId]: updated };
    });
  };

  const updateMapping = (actionId: string, mappingIndex: number, updates: Partial<InputMapping>) => {
    setMappings(prev => {
      const current = prev[actionId];
      if (!current) return prev;
      const updated = current.map((m, i) => i === mappingIndex ? { ...m, ...updates } : m);
      return { ...prev, [actionId]: updated };
    });
  };

  const handleDownload = () => {
    const xmlContent = generateXml(sortedDevices, mappings);
    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_input.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const state = {
      version: 1,
      timestamp: new Date().toISOString(),
      mappings,
      deviceOrder,
      selectedGuids: Array.from(selectedGuids)
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dirt_mapper_project_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification(t.notifications.projectSaved, 'success');
  };

  const loadStateFromJson = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.mappings) setMappings(data.mappings);
      if (data.deviceOrder) setDeviceOrder(data.deviceOrder);
      if (data.selectedGuids) setSelectedGuids(new Set(data.selectedGuids));
      showNotification(t.notifications.projectLoaded, 'success');
    } catch (e) {
      console.error(e);
      showNotification(t.notifications.invalidJson, 'error');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      loadStateFromJson(content);
    };
    reader.readAsText(file);
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  const handleImportXml = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      try {
        const parsedMappings = parseXml(content);
        setMappings(parsedMappings);
        showNotification(t.notifications.xmlImported, 'success');
      } catch (err) {
        console.error(err);
        showNotification(t.notifications.xmlParseError, 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyJson = async () => {
    const state = {
      version: 1,
      mappings,
      deviceOrder,
      selectedGuids: Array.from(selectedGuids)
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
      showNotification(t.notifications.configCopied, 'success');
    } catch (e) {
      showNotification(t.notifications.copyError, 'error');
    }
  };

  const handlePasteJson = async () => {
    try {
      const text = await navigator.clipboard.readText();
      loadStateFromJson(text);
    } catch (e) {
      showNotification(t.notifications.clipboardError, 'error');
    }
  };

  const currentLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 p-4 md:p-8 transition-colors duration-200">

      {/* Global Listening Banner */}
      {listeningForAction && (
        <div className="fixed top-0 left-0 w-full z-[100] shadow-2xl animate-[slide-down_0.3s_ease-out]">
          <div className="bg-orange-600 dark:bg-orange-700 text-white backdrop-blur-md px-4 py-3 md:px-8 border-b border-orange-500/50 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-6 min-w-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                 </span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.listening}</span>
              </div>
              <div className="h-5 w-px bg-white/30 flex-shrink-0"></div>
              <span className="text-sm md:text-base font-black italic uppercase tracking-tight truncate pr-4">
                {t.actions[listeningForAction] || listeningForAction}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
               <button
                onClick={() => abortControllerRef.current?.abort()}
                className="bg-white/10 hover:bg-white text-white hover:text-orange-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all border border-white/30"
               >
                 {t.binding}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[110] px-6 py-3 rounded-lg shadow-xl backdrop-blur-md border animate-bounce-in flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-500/90 border-green-600 text-white' : 'bg-red-500/90 border-red-600 text-white'
        }`}>
           {notification.type === 'success' ? (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
           ) : (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
           )}
           <span className="font-bold text-sm">{notification.msg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-gray-200 dark:border-gray-800 pb-6 relative">

          <div className="relative pt-4 pl-2">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter transform -skew-x-6 flex flex-col md:flex-row md:items-baseline gap-2 leading-tight">
              <div className="flex flex-col">
                <span className="text-gray-800 dark:text-white drop-shadow-lg pr-2">
                  {t.title}
                </span>
                <div className="h-1 w-20 md:w-24 bg-orange-500 mt-1 transform -skew-x-6"></div>
              </div>
              <span className="text-orange-500 drop-shadow-md pr-2">
                INPUT MAPPER
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 max-w-xl font-medium opacity-80">
              {t.description}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 mt-6 lg:mt-0 w-full lg:w-auto">
             <div className="flex items-center gap-3 w-full justify-end">

                {/* --- Multi-Language Dropdown --- */}
                <div className="relative" ref={langMenuRef}>
                    <button
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className={`h-10 px-3 flex items-center gap-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur border transition-all duration-200 uppercase tracking-widest text-[10px] font-bold ${isLangMenuOpen ? 'border-orange-500 text-orange-500' : 'border-gray-200 dark:border-gray-700 hover:border-orange-500'}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      {currentLangInfo.code}
                      <svg className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    {isLangMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 shadow-2xl z-50 overflow-hidden">
                           <div className="p-1.5 grid gap-1">
                             {SUPPORTED_LANGUAGES.map((item) => (
                               <button
                                 key={item.code}
                                 onClick={() => handleSelectLanguage(item.code)}
                                 className={`
                                   flex items-center justify-between w-full px-3 py-2 text-left rounded-lg transition-colors
                                   ${lang === item.code
                                     ? 'bg-orange-500 text-white'
                                     : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                   }
                                 `}
                               >
                                 <span className="text-xs font-bold">{item.native}</span>
                                 <span className="text-[10px] opacity-60 font-mono uppercase">{item.code}</span>
                               </button>
                             ))}
                           </div>
                        </div>
                    )}
                </div>

                {/* --- Theme Dropdown (NEW) --- */}
                <div className="relative" ref={themeMenuRef}>
                    <button
                        onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                        className={`h-10 w-10 flex items-center justify-center rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur border transition-all duration-200 ${isThemeMenuOpen ? 'border-orange-500 text-orange-500' : 'border-gray-200 dark:border-gray-700 hover:border-orange-500'}`}
                    >
                      {/* Show current icon */}
                      {themeMode === 'light' && <span className="text-lg">☀️</span>}
                      {themeMode === 'dark' && <span className="text-lg">🌙</span>}
                      {themeMode === 'system' && (
                         <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      )}
                    </button>

                    {isThemeMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 shadow-2xl z-50 overflow-hidden">
                           <div className="p-1.5 grid gap-1">
                             <button
                                 onClick={() => handleSelectTheme('light')}
                                 className={`flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg transition-colors ${themeMode === 'light' ? 'bg-orange-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                             >
                                 <span>☀️</span> 
                                 <span className="text-xs font-bold">{t.theme.light}</span>
                             </button>
                             <button
                                 onClick={() => handleSelectTheme('dark')}
                                 className={`flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg transition-colors ${themeMode === 'dark' ? 'bg-orange-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                             >
                                 <span>🌙</span> 
                                 <span className="text-xs font-bold">{t.theme.dark}</span>
                             </button>
                             <button
                                 onClick={() => handleSelectTheme('system')}
                                 className={`flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg transition-colors ${themeMode === 'system' ? 'bg-orange-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                             >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                 <span className="text-xs font-bold">{t.theme.system}</span>
                             </button>
                           </div>
                        </div>
                    )}
                </div>

                <button
                  onClick={handleDownload}
                  disabled={Object.keys(mappings).length === 0}
                  className={`
                    flex-1 md:flex-none h-10 px-6 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 border
                    ${Object.keys(mappings).length > 0
                      ? 'bg-orange-600 border-orange-500 hover:bg-orange-500 text-white shadow-orange-500/20'
                      : 'bg-gray-200 dark:bg-gray-800 border-transparent text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  {t.downloadXml}
                </button>
             </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar - Device Selection */}
          <div className="lg:col-span-4 space-y-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-orange-500 text-white text-[10px] flex items-center justify-center not-italic font-bold">01</span>
                  {t.step1Title}
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed px-2">
                {t.step1Subtitle}
              </p>
              <DeviceList
                devices={sortedDevices}
                selectedGuids={selectedGuids}
                toggleDevice={toggleDevice}
                onMoveDevice={handleMoveDevice}
                lang={lang}
              />
            </section>

            {/* Config Utility Area */}
            <section className="bg-white/40 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">{t.ui.projectTools}</h4>
               <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleExportJson} className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b22] hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all group">
                     <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                     <span className="text-[10px] font-bold uppercase tracking-tight text-gray-600 dark:text-gray-400">{t.ui.saveProject}</span>
                  </button>
                  <button onClick={() => jsonInputRef.current?.click()} className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b22] hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all group">
                     <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                     <span className="text-[10px] font-bold uppercase tracking-tight text-gray-600 dark:text-gray-400">{t.ui.loadProject}</span>
                  </button>
                  <button onClick={handleCopyJson} className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b22] hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all group">
                     <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                     <span className="text-[10px] font-bold uppercase tracking-tight text-gray-600 dark:text-gray-400">{t.ui.copyClipboard}</span>
                  </button>
                  <button onClick={handlePasteJson} className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b22] hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all group">
                     <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                     <span className="text-[10px] font-bold uppercase tracking-tight text-gray-600 dark:text-gray-400">{t.ui.pasteClipboard}</span>
                  </button>
               </div>

               <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all text-gray-500 group"
               >
                 <svg className="w-4 h-4 text-gray-400 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                 <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{t.ui.importDirtXml}</span>
               </button>
            </section>
          </div>

          {/* Main Content - Action Mapping */}
          <div className="lg:col-span-8 space-y-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-orange-500 text-white text-[10px] flex items-center justify-center not-italic font-bold">02</span>
                  {t.step2Title}
                </h2>
              </div>
              <MappingTable
                mappings={mappings}
                listeningId={listeningForAction}
                onBindClick={handleBindClick}
                onRemoveClick={removeMapping}
                onUpdateMapping={updateMapping}
                lang={lang}
                hasSelectedDevices={selectedGuids.size > 0}
              />
            </section>
          </div>
        </main>

        {/* Hidden Inputs */}
        <input type="file" ref={fileInputRef} className="hidden" accept=".xml" onChange={handleImportXml} />
        <input type="file" ref={jsonInputRef} className="hidden" accept=".json" onChange={handleImportJson} />

        {/* Footer */}
        <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 dark:text-gray-500">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">DiRT Rally ActionMap Configurator</span>
           </div>
           <div className="text-[10px] font-mono opacity-50">
             VERSION 1.0.4-BETA // BROWSER_GAMEPAD_API_ACTIVE
           </div>

           <div className="text-[10px] leading-relaxed opacity-60 text-center md:text-left max-w-3xl">
              <p>
                {t.legal.unofficial}
              </p>
              <p className="mt-1">
                {t.legal.trademarks}
              </p>
           </div>
        </footer>
      </div>
    </div>
  );
}

export default App;