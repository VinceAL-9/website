import type { ApiOfficer } from '../types';
import type { OfficerCategory, OfficerCategoryInfo } from '../types';

/**
 * Officer category metadata with hierarchy order
 */
export const officerCategories: Record<OfficerCategory, OfficerCategoryInfo> = {
  executive: {
    title: 'Executive Board',
    description: 'The primary leadership team responsible for strategic direction and overall governance',
  },
  administrative: {
    title: 'Administrative Officers',
    description: 'Officers responsible for documentation, financial management, and organizational operations',
  },
  audit: {
    title: 'Audit & Finance',
    description: 'Officers ensuring financial transparency and business development',
  },
  communications: {
    title: 'Communications & Representation',
    description: 'Officers managing communications, public relations, and student representation',
  },
};

/**
 * Defines the hierarchy order for officer categories
 * Per SRS: Executive > Administrative > Audit > Communications
 */
export const categoryOrder: OfficerCategory[] = ['executive', 'administrative', 'audit', 'communications'];

/**
 * Maps various category formats from the database to the normalized frontend categories.
 * This handles both seed data categories and new categories from the Dashboard.
 */
function normalizeCategory(rawCategory: string): OfficerCategory {
  const category = rawCategory.toLowerCase().trim();

  // Direct matches (from Dashboard form with lowercase values)
  if (category === 'executive' || category === 'administrative' || category === 'audit' || category === 'communications') {
    return category as OfficerCategory;
  }

  // Seed data mappings
  if (category.includes('executive')) {
    return 'executive';
  }
  if (category.includes('administrative') || category.includes('finance') || category.includes('treasurer')) {
    return 'administrative';
  }
  if (category.includes('audit')) {
    return 'audit';
  }
  if (category.includes('communications') || category.includes('representative') || category.includes('ambassador')) {
    return 'communications';
  }

  // Default fallback - log for debugging
  console.warn(`Unknown officer category: "${rawCategory}", defaulting to 'executive'`);
  return 'executive';
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

