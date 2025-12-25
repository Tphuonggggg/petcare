export function logout(redirect = '/login') {
  try {
    localStorage.removeItem('user')
  } catch {}
  try {
    localStorage.removeItem('selected_branch_id')
    localStorage.removeItem('selected_branch_name')
  } catch {}
  try {
    // keep useMocks flag if present; remove only session keys
    // localStorage.removeItem('useMocks')
  } catch {}
  // redirect to login (hard navigation to ensure state cleared)
  try {
    window.location.href = redirect
  } catch (e) {
    // fallback
    // @ts-ignore
    if (typeof location !== 'undefined') location.href = redirect
  }
}
