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
  const categoryMap = new Map<string, ApiOfficer[]>();

  // Group officers by category
  for (const officer of officers) {
    const category = officer.category.toLowerCase();
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
    const officers = categoryMap.get(category) || [];
    if (officers.length > 0) {
      grouped.push({
        category,
        categoryInfo: officerCategories[category],
        officers,
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
    category: apiOfficer.category.toLowerCase() as OfficerCategory,
  };
}
