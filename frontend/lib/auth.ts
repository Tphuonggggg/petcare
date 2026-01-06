export function logout(redirect = '/login') {
  try {
    // Clear all session storage keys
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('employeeId')
    localStorage.removeItem('customerId')
    localStorage.removeItem('branchId')
    localStorage.removeItem('positionId')
    localStorage.removeItem('selected_branch_id')
    localStorage.removeItem('selected_branch_name')
    localStorage.removeItem('useMocks')
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
