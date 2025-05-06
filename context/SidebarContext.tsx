"use client";

import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from "react";

type SidebarSettings = { disabled: boolean; isHoverOpen: boolean };

type SidebarContextState = {
  isOpen: boolean;
  isHover: boolean;
  settings: SidebarSettings;
};

type SidebarContextActions = {
  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsHover: (isHover: boolean) => void;
  setSettings: (settings: Partial<SidebarSettings>) => void;
  getOpenState: () => boolean;
};

type SidebarContextValue = SidebarContextState & SidebarContextActions;

const SIDEBAR_STORAGE_KEY = "sidebar";

const defaultSettings: SidebarSettings = {
  disabled: false,
  isHoverOpen: false,
};

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);

const getInitialState = (): SidebarContextState => {
  if (typeof window === "undefined") {
    // Default state on the server
    return {
      isOpen: true,
      isHover: false,
      settings: defaultSettings,
    };
  }
  try {
    const item = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (item) {
      const persistedState = JSON.parse(item);
      // Ensure settings object exists and has defaults
      return {
        ...persistedState.state,
        settings: { ...defaultSettings, ...persistedState.state.settings },
      };
    }
  } catch (error) {
    console.error("Error reading sidebar state from localStorage:", error);
  }
  // Default state if nothing in localStorage or error occurs
  return {
    isOpen: true,
    isHover: false,
    settings: defaultSettings,
  };
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isHover, setIsHover] = useState(false);
  const [settings, setSettingsState] =
    useState<SidebarSettings>(defaultSettings);

  // Load initial state from localStorage on mount (client-side only)
  useEffect(() => {
    const initialState = getInitialState();
    setIsOpen(initialState.isOpen);
    setIsHover(initialState.isHover);
    setSettingsState(initialState.settings);
    setIsLoaded(true); // Mark as loaded after initial state setup
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    // Only run persist logic after initial load and on the client
    if (isLoaded && typeof window !== "undefined") {
      try {
        const stateToPersist = {
          state: {
            isOpen,
            isHover, // isHover is generally transient, consider if it *needs* persistence
            settings,
          },
        };
        window.localStorage.setItem(
          SIDEBAR_STORAGE_KEY,
          JSON.stringify(stateToPersist)
        );
      } catch (error) {
        console.error("Error writing sidebar state to localStorage:", error);
      }
    }
  }, [isOpen, isHover, settings, isLoaded]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSetIsOpen = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const handleSetIsHover = useCallback((hover: boolean) => {
    setIsHover(hover);
  }, []);

  const setSettings = useCallback((newSettings: Partial<SidebarSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const getOpenState = useCallback(() => {
    // Use the current state values directly
    return isOpen || (settings.isHoverOpen && isHover);
  }, [isOpen, settings.isHoverOpen, isHover]);

  const value = useMemo(
    () => ({
      isOpen,
      isHover,
      settings,
      toggleOpen,
      setIsOpen: handleSetIsOpen,
      setIsHover: handleSetIsHover,
      setSettings,
      getOpenState,
    }),
    [
      isOpen,
      isHover,
      settings,
      toggleOpen,
      handleSetIsOpen,
      handleSetIsHover,
      setSettings,
      getOpenState,
    ]
  );

  // Render children only after state is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return null; // Or a loading indicator
  }

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
};
