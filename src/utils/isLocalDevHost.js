/** True only for local machine dev — never production domains. */
export function isLocalDevHost(hostname = typeof window !== 'undefined' ? window.location.hostname : '') {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}
