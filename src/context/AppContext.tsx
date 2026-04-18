import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';

export type UserStatus =
  | 'normal'
  | 'pending'
  | 'grace'
  | 'pre-alert'
  | 'escalated'
  | 'paused'
  | 'sos-active'
  | 'resolved';

export type PrimaryStatus = 'notified' | 'acknowledged' | 'checking' | 'timeout';
export type SleepPattern = 'early' | 'late' | 'irregular';
export type AgeGroup = 'young-adult' | 'adult' | 'senior';

interface SafeWindow {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

interface Contact {
  name: string;
  phone: string;
  emergencyRef: string;
}

interface EmergencyMedicalCard {
  fullName: string;
  chronicConditions?: string;
  allergies?: string;
  medications?: string;
  bloodType?: string;
  notes?: string;
}

interface AppSettings {
  setupFor: AgeGroup | null;
  sleepPattern: SleepPattern | null;
  safeWindows: SafeWindow;
  checkInTime: string;
  gracePeriod: number;
  primaryContact: Contact | null;
  batteryAlert: number | null;
  hasCompletedOnboarding: boolean;
  emergencyCard: EmergencyMedicalCard | null;
}

interface AppState {
  userStatus: UserStatus;
  primaryStatus: PrimaryStatus | null;
  pausedUntil: Date | null;
  extendedUsed: boolean;
  sosActive: boolean;
  lastCheckInAt: string | null;
  settings: AppSettings;
}

interface AppContextType {
  state: AppState;
  isHydrated: boolean;

  isLoggedIn: boolean;
  currentUserId: number | null;
  login: (userId?: number) => Promise<void>;
  logout: () => Promise<void>;

  updateUserStatus: (status: UserStatus) => void;
  updatePrimaryStatus: (status: PrimaryStatus | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  completeOnboarding: () => void;
  pauseToday: () => void;
  extendedPause: (days: number) => void;
  resumeFromPause: () => void;
  activateSOS: () => void;
  deactivateSOS: () => void;
  useExtended: () => void;
  resetExtended: () => void;
  markCheckIn: () => void;
}

const STORAGE_KEY = 'sabaai-dii-mai-app-state';
const AUTH_STORAGE_KEY = 'sabaai-dii-mai-auth';
const CHAT_TOKEN_KEY = '@chat_token';

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
  setupFor: 'senior',
  sleepPattern: null,
  safeWindows: {
    morning: true,
    afternoon: false,
    evening: true,
    night: false,
  },
  checkInTime: '09:00',
  gracePeriod: 30,
  primaryContact: {
    name: 'ลูกหลาน / ผู้ดูแล',
    phone: '081-234-5678',
    emergencyRef: 'primary-caregiver',
  },
  batteryAlert: 20,
  hasCompletedOnboarding: false,
  emergencyCard: null,
};

const defaultState: AppState = {
  userStatus: 'normal',
  primaryStatus: null,
  pausedUntil: null,
  extendedUsed: false,
  sosActive: false,
  lastCheckInAt: null,
  settings: defaultSettings,
};

function parseTimeString(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

function isSameLocalDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function getDerivedStatus(state: AppState, now: Date): Partial<AppState> | null {
  if (!state.settings.hasCompletedOnboarding) {
    if (state.userStatus !== 'normal') {
      return { userStatus: 'normal' };
    }
    return null;
  }

  if (state.sosActive || state.userStatus === 'sos-active') {
    return state.userStatus === 'sos-active' && state.sosActive
      ? null
      : { userStatus: 'sos-active', sosActive: true };
  }

  if (state.pausedUntil) {
    const pausedUntil = new Date(state.pausedUntil);
    if (now >= pausedUntil) {
      return { userStatus: 'normal', pausedUntil: null, extendedUsed: false };
    }
    if (state.userStatus !== 'paused') {
      return { userStatus: 'paused' };
    }
    return null;
  }

  const parsed = parseTimeString(state.settings.checkInTime);
  if (!parsed) {
    return null;
  }

  const scheduled = new Date(now);
  scheduled.setHours(parsed.hours, parsed.minutes, 0, 0);

  if (now < scheduled) {
    if (state.userStatus !== 'normal' || state.extendedUsed) {
      return { userStatus: 'normal', extendedUsed: false };
    }
    return null;
  }

  const lastCheckInAt = state.lastCheckInAt ? new Date(state.lastCheckInAt) : null;
  if (lastCheckInAt && isSameLocalDay(lastCheckInAt, now) && lastCheckInAt >= scheduled) {
    if (state.userStatus !== 'normal' || state.extendedUsed) {
      return { userStatus: 'normal', extendedUsed: false };
    }
    return null;
  }

  const effectiveGraceMinutes = state.settings.gracePeriod + (state.extendedUsed ? 20 : 0);
  const graceEnd = new Date(scheduled.getTime() + effectiveGraceMinutes * 60_000);
  const preAlertEnd = new Date(graceEnd.getTime() + 15 * 60_000);

  let nextStatus: UserStatus = 'pending';
  if (now > preAlertEnd) {
    nextStatus = 'escalated';
  } else if (now > graceEnd) {
    nextStatus = 'pre-alert';
  } else if (state.extendedUsed) {
    nextStatus = 'grace';
  }

  if (state.userStatus !== nextStatus) {
    return { userStatus: nextStatus };
  }

  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadState = async () => {
      try {
        const [rawState, rawAuth] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(AUTH_STORAGE_KEY),
        ]);

        if (!isMounted) return;

        if (rawState) {
          const parsed = JSON.parse(rawState) as AppState;
          setState({
            ...defaultState,
            ...parsed,
            pausedUntil: parsed.pausedUntil ? new Date(parsed.pausedUntil) : null,
            settings: {
              ...defaultSettings,
              ...parsed.settings,
              safeWindows: {
                ...defaultSettings.safeWindows,
                ...parsed.settings?.safeWindows,
              },
            },
          });
        }

        if (rawAuth) {
          const parsedAuth = JSON.parse(rawAuth) as {
            isLoggedIn?: boolean;
            currentUserId?: number | null;
          };

          setIsLoggedIn(Boolean(parsedAuth?.isLoggedIn));
          setCurrentUserId(parsedAuth?.currentUserId ?? null);
        } else {
          // ค่าเริ่มต้นสำหรับ demo app
          setIsLoggedIn(true);
          setCurrentUserId(1);
        }
      } catch (error) {
        console.warn('Failed to restore saved state', error);
      } finally {
        if (isMounted) {
          hydratedRef.current = true;
          setIsHydrated(true);
        }
      }
    };

    void loadState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;

    const saveState = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...state,
            pausedUntil: state.pausedUntil ? state.pausedUntil.toISOString() : null,
          }),
        );
      } catch (error) {
        console.warn('Failed to persist app state', error);
      }
    };

    void saveState();
  }, [state]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    const saveAuthState = async () => {
      try {
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            isLoggedIn,
            currentUserId,
          }),
        );
      } catch (error) {
        console.warn('Failed to persist auth state', error);
      }
    };

    void saveAuthState();
  }, [isLoggedIn, currentUserId]);

  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return;

    const syncStatus = () => {
      setState(prev => {
        const patch = getDerivedStatus(prev, new Date());
        return patch ? { ...prev, ...patch } : prev;
      });
    };

    syncStatus();
    const interval = setInterval(syncStatus, 30_000);
    return () => clearInterval(interval);
  }, [isHydrated, isLoggedIn]);

  const login = async (userId = 1) => {
    setCurrentUserId(userId);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(CHAT_TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to clear chat token', error);
    }

    setIsLoggedIn(false);
    setCurrentUserId(null);
  };

  const updateUserStatus = (status: UserStatus) => {
    setState(prev => ({ ...prev, userStatus: status }));
  };

  const updatePrimaryStatus = (status: PrimaryStatus | null) => {
    setState(prev => ({ ...prev, primaryStatus: status }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      userStatus: 'normal',
      settings: { ...prev.settings, hasCompletedOnboarding: true },
    }));
  };

  const pauseToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    setState(prev => ({
      ...prev,
      userStatus: 'paused',
      pausedUntil: tomorrow,
    }));
  };

  const extendedPause = (days: number) => {
    const resumeDate = new Date();
    resumeDate.setDate(resumeDate.getDate() + days);
    resumeDate.setHours(0, 0, 0, 0);
    setState(prev => ({
      ...prev,
      userStatus: 'paused',
      pausedUntil: resumeDate,
    }));
  };

  const resumeFromPause = () => {
    setState(prev => ({
      ...prev,
      userStatus: 'normal',
      pausedUntil: null,
    }));
  };

  const activateSOS = () => {
    setState(prev => ({
      ...prev,
      sosActive: true,
      userStatus: 'sos-active',
    }));
  };

  const deactivateSOS = () => {
    setState(prev => ({
      ...prev,
      sosActive: false,
      userStatus: 'resolved',
    }));
  };

  const useExtended = () => {
    setState(prev => {
      if (prev.extendedUsed) return prev;
      return { ...prev, extendedUsed: true, userStatus: 'grace' };
    });
  };

  const resetExtended = () => {
    setState(prev => ({ ...prev, extendedUsed: false }));
  };

  const markCheckIn = () => {
    setState(prev => ({
      ...prev,
      userStatus: 'resolved',
      extendedUsed: false,
      lastCheckInAt: new Date().toISOString(),
      primaryStatus: null,
    }));
  };

  const value = useMemo(
    () => ({
      state,
      isHydrated,

      isLoggedIn,
      currentUserId,
      login,
      logout,

      updateUserStatus,
      updatePrimaryStatus,
      updateSettings,
      completeOnboarding,
      pauseToday,
      extendedPause,
      resumeFromPause,
      activateSOS,
      deactivateSOS,
      useExtended,
      resetExtended,
      markCheckIn,
    }),
    [state, isHydrated, isLoggedIn, currentUserId],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}