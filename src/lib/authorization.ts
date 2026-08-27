/**
 * authorization.ts
 * Object-Level Authorization (RBAC & Multi-Tenant Resource Ownership Enforcement).
 * Prevents IDOR, cross-tenant data leakage, and privilege escalation.
 */

import { OrgRole, ProtectedResourceType, ResourceAction, ResourceOwnershipContext } from '@/types/organization';

/**
 * Checks if a user / organization has permission to perform a specific action on a protected resource.
 */
export function checkResourceAccess(
  context: ResourceOwnershipContext,
  resourceType: ProtectedResourceType,
  action: ResourceAction,
  resourceOwner?: { orgId?: string; userId?: string; allowedSupplierIds?: string[]; allowedBuyerOrgIds?: string[] }
): boolean {
  const { role, orgId, userId } = context;

  // 1. Artha Operator & Admin have global operational access
  if (role === 'artha_admin' || role === 'artha_operator' || role === 'admin') {
    return true;
  }

  // 2. Audit logs are restricted strictly to platform admins/operators
  if (resourceType === 'audit_log') {
    return false;
  }

  // 3. Public read actions on supplier profiles
  if (resourceType === 'supplier_profile' && (action === 'read' || action === 'list')) {
    return true;
  }

  // 4. Resource creation permissions based on role
  if (action === 'create') {
    if (resourceType === 'rfq' || resourceType === 'buyer_profile') {
      return role === 'buyer_admin' || role === 'buyer_member' || role === 'buyer';
    }
    if (resourceType === 'quote' || resourceType === 'supplier_profile') {
      return role === 'supplier_admin' || role === 'supplier_member' || role === 'supplier';
    }
    if (resourceType === 'deal' || resourceType === 'order' || resourceType === 'dispute') {
      return true; // Any authenticated buyer or supplier can initiate
    }
  }

  // 5. Ownership verification for specific existing resources
  if (resourceOwner) {
    // If the resource belongs to the user's organization
    if (orgId && resourceOwner.orgId && orgId === resourceOwner.orgId) {
      return true;
    }

    // Direct user ID match
    if (userId && resourceOwner.userId && userId === resourceOwner.userId) {
      return true;
    }

    // For RFQ & Quotes & Deals & Orders: cross-tenant access between the matched buyer and supplier
    if (resourceOwner.allowedSupplierIds && (context.targetOwnerId || orgId)) {
      const target = context.targetOwnerId || orgId;
      if (target && resourceOwner.allowedSupplierIds.includes(target)) {
        return true;
      }
    }

    if (resourceOwner.allowedBuyerOrgIds && orgId) {
      if (resourceOwner.allowedBuyerOrgIds.includes(orgId)) {
        return true;
      }
    }

    // Default deny if ownership check fails
    return false;
  }

  // For general listing if no specific resourceOwner is provided
  if (action === 'list') {
    return true; // Filtering by orgId is done in the data query layer
  }

  return false;
}

/**
 * Validates whether an authenticated session matches the required role.
 */
export function requireRole(userRole: string, allowedRoles: OrgRole[] | string[]): boolean {
  if (userRole === 'artha_admin' || userRole === 'admin') return true;
  return allowedRoles.includes(userRole as any);
}
