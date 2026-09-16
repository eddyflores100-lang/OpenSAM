/**
 * sam-gov-types — TypeScript definitions for the SAM.gov Public API
 * https://open.gsa.gov/api/get-opportunities-public-api/
 *
 * Open source by AliceLabs LLC (https://alicelabs.site)
 */

// ── Notice types ───────────────────────────────────────────────
export type SamNoticeType =
  | 'Solicitation'
  | 'Award'
  | 'Presolicitation'
  | 'Sources Sought'
  | 'Special Notice'
  | 'Intent to Bundle'
  | 'Sale of Surplus Property'
  | 'Combined Synopsis/Solicitation'
  | 'Fair Opportunity / Limited Sources Justification'

// ── Set-aside types ────────────────────────────────────────────
export type SamSetAside =
  | 'Total Small Business'
  | 'Small Business'
  | 'SBA Certified 8(a)'
  | '8(a) Competitive'
  | '8(a) Sole Source'
  | 'HUBZone'
  | 'Service-Disabled Veteran-Owned Small Business'
  | 'Women-Owned Small Business'
  | 'Economically Disadvantaged Women-Owned Small Business'
  | 'Partial Small Business'
  | 'Emerging Small Business'
  | ''

// ── Organization hierarchy ─────────────────────────────────────
/** Federal agency hierarchy (up to 4 levels) */
export interface OrganizationHierarchy {
  /** Top-level department (e.g., "Department of Defense") */
  l1Name: string
  /** Sub-agency (e.g., "Army") */
  l2Name?: string
  /** Bureau / command */
  l3Name?: string
  /** Office */
  l4Name?: string
}

// ── Point of contact ───────────────────────────────────────────
export interface PointOfContact {
  type: 'primary' | 'secondary' | string
  title?: string
  fullName: string
  email: string
  phone?: string
  fax?: string
}

// ── Place of performance ───────────────────────────────────────
export interface PlaceOfPerformance {
  city?: { code: string; name: string }
  state?: { code: string; name: string }
  country?: { code: string; name: string }
  zip?: string
  streetAddress?: string
}

// ── Award ──────────────────────────────────────────────────────
export interface Award {
  date: string
  number?: string
  amount: string
  awardee: {
    name: string
    duns?: string
    ueiSAM?: string
    location?: PlaceOfPerformance
  }
}

// ── Link ───────────────────────────────────────────────────────
export interface SamLink {
  rel: string
  href: string
}

// ── Opportunity (main entity) ──────────────────────────────────
/** A single opportunity from SAM.gov */
export interface SamOpportunity {
  /** Unique notice identifier */
  noticeId: string
  /** Human-readable title */
  title: string
  /** Solicitation number (agency-assigned) */
  solicitationNumber: string
  /** Full parent path (dot-separated agency hierarchy) */
  fullParentPathName: string
  /** ISO 8601 posted date */
  postedDate: string
  /** Notice type */
  type: SamNoticeType
  /** Base notice type */
  baseType: string
  /** Archive type */
  archiveType: string
  /** Archive date */
  archiveDate: string
  /** Set-aside description */
  typeOfSetAsideDescription: SamSetAside | string
  /** ISO 8601 response deadline (note: capital L in "Line") */
  responseDeadLine: string
  /** Primary NAICS code */
  naicsCode: string
  /** All applicable NAICS codes */
  naicsCodes: string[]
  /** Product/service classification code */
  classificationCode: string
  /** Whether the opportunity is currently active */
  active: 'Yes' | 'No'
  /** Award details (present only for award notices) */
  award?: Award
  /** Points of contact */
  pointOfContact: PointOfContact[]
  /** Full HTML or plain text description */
  description: string
  /** Agency organization hierarchy */
  organizationHierarchy: OrganizationHierarchy
  /** Place of performance */
  placeOfPerformance?: PlaceOfPerformance
  /** Related links */
  links: SamLink[]
  /** Link to the opportunity on SAM.gov */
  uiLink: string
  /** Office address */
  officeAddress?: {
    city?: string
    state?: string
    zipcode?: string
  }
  /** Additional info link */
  additionalInfoLink?: string
}

// ── Search parameters ──────────────────────────────────────────
/** Parameters for GET /opportunities/v2/search */
export interface SamSearchParams {
  /** SAM.gov API key */
  api_key: string
  /** Keyword search query */
  q?: string
  /** Filter by NAICS code */
  naicsCode?: string
  /** Filter by notice type */
  noticeType?: SamNoticeType
  /** Filter by organization name */
  organizationName?: string
  /** Filter by set-aside type */
  typeOfSetAside?: string
  /** Response deadline from (YYYY-MM-DD) */
  rdlfrom?: string
  /** Response deadline to (YYYY-MM-DD) */
  rdlto?: string
  /** Posted date from (YYYY-MM-DD) */
  postedFrom?: string
  /** Posted date to (YYYY-MM-DD) */
  postedTo?: string
  /** Filter active opportunities only */
  active?: 'Yes' | 'No'
  /** Number of results per page */
  limit?: string
  /** Offset for pagination */
  offset?: string
  /** Sort order */
  orderBy?: string
}

// ── Search response ────────────────────────────────────────────
/** Response from GET /opportunities/v2/search */
export interface SamSearchResponse {
  /** Total matching records */
  totalRecords: number
  /** Array of opportunity objects */
  opportunitiesData: SamOpportunity[]
  /** Links for pagination */
  links?: SamLink[]
}
