/**
 * Public demo portals (/demo/seraphina, /demo/sarah, /demo/partner) — no Cognito required.
 */

export const DEMO_PERSONAS = {
  seraphina: {
    id: 'seraphina',
    label: 'Seraphina Luna · Model',
    role: 'model',
    basePath: '/demo/seraphina',
    user: { userId: 'mock-user-1', username: 'mock-user-1', userSub: 'mock-user-1' },
    modelId: 'mock-model-1',
    display: {
      firstName: 'Seraphina',
      lastName: 'Luna',
      levelTier: 'Gold Model',
      xp: 2450,
      xpToNext: 3000,
    },
  },
  sarah: {
    id: 'sarah',
    label: 'Sarah Mitchell · Professional',
    role: 'professional',
    basePath: '/demo/sarah',
    user: { userId: 'mock-pro-user-1', username: 'mock-pro-user-1', userSub: 'mock-pro-user-1' },
    professionalId: 'mock-pro-1',
    display: {
      firstName: 'Sarah',
      lastName: 'Mitchell',
      salonName: 'Luxe Studio',
      levelTier: 'Senior Colorist',
    },
  },
  partner: {
    id: 'partner',
    label: 'Luxe Studio · Partner',
    role: 'partner',
    basePath: '/demo/partner',
    user: { userId: 'mock-partner-user-1', username: 'mock-partner-user-1', userSub: 'mock-partner-user-1' },
    display: {
      salonName: 'Luxe Studio',
      businessName: 'Luxe Studio',
      tagline: 'Partner dashboard',
    },
  },
};

let activeDemo = null;

export function activateDemoPortal(personaKey) {
  activeDemo = DEMO_PERSONAS[personaKey] || null;
}

export function deactivateDemoPortal() {
  activeDemo = null;
}

export function getActiveDemoPortal() {
  return activeDemo;
}

export function isDemoPortalActive() {
  return !!activeDemo;
}

export function getPortalBasePath(defaultPath) {
  return activeDemo?.basePath || defaultPath;
}
