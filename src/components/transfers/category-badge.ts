export function getCategoryBadgeLabel(category: string) {
  const normalizedCategory = category.trim();

  return normalizedCategory.length > 0 ? normalizedCategory : null;
}
