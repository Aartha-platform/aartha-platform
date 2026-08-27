/**
 * organization.ts
 * Type definitions for Multi-Tenant Organization Model & Role-Based Access Control (RBAC).
 */

export type OrgType = 'buyer' | 'supplier' | 'operator';

export type OrgRole =
  | 'buyer_admin'
  | 'buyer_member'
  | 'supplier_admin'
  | 'supplier_member'
  | 'artha_operator'
  | 'artha_admin';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrgType;
  country: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  createdAt: string;
  updatedAt: string;
}

export type ProtectedResourceType =
  | 'rfq'
  | 'quote'
  | 'deal'
  | 'order'
  | 'dispute'
  | 'document'
  | 'supplier_profile'
  | 'buyer_profile'
  | 'audit_log';

export type ResourceAction =
  | 'read'
  | 'list'
  | 'create'
  | 'update'
  | 'delete'
  | 'manage'
  | 'admin';

export interface ResourceOwnershipContext {
  userId: string;
  orgId?: string;
  role: string;
  targetOrgId?: string;
  targetOwnerId?: string;
}
