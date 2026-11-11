export function readAffiliateInvitation(search) {
  const params = new URLSearchParams(search);
  if (!params.has("invita")) return null;
  const value = params.get("invita").trim().toUpperCase();
  // Preserve invalid links through authentication without treating them as direct applications.
  return /^[A-Z0-9]{1,32}$/.test(value) ? value : "";
}

export function withAffiliateInvitation(path, invitation) {
  return invitation === null ? path : path + "?invita=" + encodeURIComponent(invitation);
}
