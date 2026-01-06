/**
 * Role routing utility
 * Maps PositionID from backend to frontend dashboard routes
 */

export type PositionId = 1 | 2 | 3 | 4;
export type DashboardRoute = '/vet' | '/reception' | '/sales' | '/admin' | '/customer' | '/dashboard';

/**
 * Map PositionID to dashboard route
 * @param positionId - Position ID from employee account
 * @returns Dashboard route path
 */
export function getRouteByPositionId(positionId?: number | null): DashboardRoute {
  switch (positionId) {
    case 1:
      return '/vet'; // Bác sĩ thú y (Doctor)
    case 2:
      return '/reception'; // Nhân viên tiếp tân (Receptionist/Staff)
    case 3:
      return '/sales'; // Nhân viên bán hàng (Sales Staff)
    case 4:
      return '/admin'; // Quản lý chi nhánh (Branch Manager/Admin)
    default:
      return '/customer'; // Fallback to customer for non-employee accounts
  }
}

/**
 * Get position name from ID
 */
export function getPositionName(positionId?: number | null): string {
  switch (positionId) {
    case 1:
      return 'Bác sĩ thú y';
    case 2:
      return 'Nhân viên tiếp tân';
    case 3:
      return 'Nhân viên bán hàng';
    case 4:
      return 'Quản lý chi nhánh';
    default:
      return 'Khách hàng';
  }
}

/**
 * Check if account is employee (has PositionID)
 */
export function isEmployee(positionId?: number | null): boolean {
  return positionId !== null && positionId !== undefined;
}
