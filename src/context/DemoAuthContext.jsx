import React, { createContext, useContext, useEffect } from 'react';
import { activateDemoPortal, deactivateDemoPortal, DEMO_PERSONAS } from '../utils/demoPortalMode';

export const DemoAuthContext = createContext(null);

export function DemoAuthProvider({ personaKey, children }) {
  const value = personaKey ? DEMO_PERSONAS[personaKey] : null;

  useEffect(() => {
    if (personaKey) activateDemoPortal(personaKey);
    return () => deactivateDemoPortal();
  }, [personaKey]);

  return (
    <DemoAuthContext.Provider value={value}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoPortal() {
  return useContext(DemoAuthContext);
}
