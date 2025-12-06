import type { ApiOfficer } from '../types';
import type { OfficerCategory, OfficerCategoryInfo } from '../types';

/**
 * Officer category metadata with hierarchy order
 */
export const officerCategories: Record<OfficerCategory, OfficerCategoryInfo> = {
  exec: {
    title: 'Executive Board',
    description: 'The primary leadership team responsible for strategic direction and overall governance',
  },
  admin: {
    title: 'Administrative Officers',
    description: 'Officers responsible for documentation and organizational operations',
  },
  finance: {
    title: 'Finance Officers',
    description: 'Officers ensuring financial transparency, business development, and treasury management',
  },
  rep: {
    title: 'Year Level Representatives',
    description: 'Student representatives for each year level ensuring effective communication between members and leadership',
  },
  ambassador: {
    title: 'PSSE Ambassadors',
    description: 'Official ambassadors representing PSSE in external events and partnerships',
  },
};

/**
 * Defines the hierarchy order for officer categories
 * Per database schema: EXEC > ADMIN > FINANCE > REP > AMBASSADOR
 */
export const categoryOrder: OfficerCategory[] = ['exec', 'admin', 'finance', 'rep', 'ambassador'];

/**
 * Maps database category values to the normalized frontend categories.
 * Database uses: EXEC, ADMIN, REP, FINANCE, AMBASSADOR
 */
function normalizeCategory(rawCategory: string): OfficerCategory {
  const category = rawCategory.toUpperCase().trim();

  // Direct matches from database enum
  switch (category) {
    case 'EXEC':
      return 'exec';
    case 'ADMIN':
      return 'admin';
    case 'FINANCE':
      return 'finance';
    case 'REP':
      return 'rep';
    case 'AMBASSADOR':
      return 'ambassador';
    default:
      // Default fallback - log for debugging
      console.warn(`Unknown officer category: "${rawCategory}", defaulting to 'exec'`);
      return 'exec';
  }
}

/**
 * Grouped officers by category
 */
export interface GroupedOfficers {
  category: OfficerCategory;
  categoryInfo: OfficerCategoryInfo;
  officers: ApiOfficer[];
}

/**
 * Groups a flat array of officers by their category following the hierarchy order.
 * Officers within each category are sorted by their 'order' field.
 * 
 * @param officers - Flat array of officers from the API
 * @returns Array of grouped officers ordered by hierarchy
 */
export function groupOfficersByCategory(officers: ApiOfficer[]): GroupedOfficers[] {
  // Create a map for faster lookup
  const categoryMap = new Map<OfficerCategory, ApiOfficer[]>();

  // Group officers by normalized category
  for (const officer of officers) {
    const category = normalizeCategory(officer.category);
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(officer);
  }

  // Sort officers within each category by their order field
  for (const [, categoryOfficers] of categoryMap) {
    categoryOfficers.sort((a, b) => a.order - b.order);
  }

  // Build the grouped result following hierarchy order
  const grouped: GroupedOfficers[] = [];

  for (const category of categoryOrder) {
    const categoryOfficers = categoryMap.get(category) || [];
    if (categoryOfficers.length > 0) {
      grouped.push({
        category,
        categoryInfo: officerCategories[category],
        officers: categoryOfficers,
      });
    }
  }

  return grouped;
}

/**
 * Maps an ApiOfficer to the format expected by OfficerCard component
 */
export function mapApiOfficerToOfficer(apiOfficer: ApiOfficer) {
  return {
    id: String(apiOfficer.id),
    title: apiOfficer.position,
    name: apiOfficer.name,
    image: apiOfficer.photoUrl,
    category: normalizeCategory(apiOfficer.category),
  };
}

