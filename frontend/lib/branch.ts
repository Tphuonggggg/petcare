export function getSelectedBranchId(): string | null {
  try {
    return localStorage.getItem('selected_branch_id')
  } catch (e) {
    return null
  }
}

export function getSelectedBranchName(): string | null {
  try {
    return localStorage.getItem('selected_branch_name')
  } catch (e) {
    return null
  }
}

export function isBranchSelected(): boolean {
  return !!getSelectedBranchId()
}
