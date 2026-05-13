const LEVEL_SCORES = {
  Junior: 0.7,
  Certified: 0.85,
  Senior: 1,
  Master: 1,
};

const toMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const getDayKey = (dateString) => {
  if (!dateString) return null;
  const dayIndex = new Date(dateString).getDay();
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayKeys[dayIndex] || null;
};

const isTimeWithinRanges = (timeMinutes, ranges = []) => {
  if (timeMinutes === null) return false;
  return ranges.some((range) => {
    const start = toMinutes(range.start);
    const end = toMinutes(range.end);
    if (start === null || end === null) return false;
    return timeMinutes >= start && timeMinutes <= end;
  });
};

const overlapScore = (tags = [], portfolio = []) => {
  if (!tags.length) return 0;
  const portfolioTags = new Set(
    portfolio.flatMap((item) => item.tags || []).map((tag) => tag.toLowerCase())
  );
  const matches = tags.filter((tag) => portfolioTags.has(tag.toLowerCase()));
  return matches.length / tags.length;
};

export function scoreStylistForRequest(stylist, request) {
  const weights = {
    service: 30,
    level: 15,
    certified: 10,
    location: 15,
    availability: 15,
    budget: 10,
    portfolio: 10,
    salonType: 5,
  };

  const serviceMatch = stylist.servicesOffered?.includes(request.serviceId) ? 1 : 0;
  const levelMatch = request.stylistLevel
    ? (stylist.level === request.stylistLevel ? 1 : LEVEL_SCORES[stylist.level] || 0.6)
    : (LEVEL_SCORES[stylist.level] || 0.7);
  const certifiedMatch = stylist.certified ? 1 : 0;

  const locationMatch = request.borough
    ? (stylist.boroughs || []).some((b) => b.toLowerCase() === request.borough.toLowerCase()) ? 1 : 0
    : 0.5;

  const dayKey = getDayKey(request.date);
  const ranges = dayKey ? (stylist.availabilityRules?.[dayKey] || []) : [];
  const availabilityMatch = isTimeWithinRanges(toMinutes(request.time || ''), ranges) ? 1 : 0;

  const budgetMatch = request.budgetMin !== null && request.budgetMax !== null
    ? (stylist.priceRange && stylist.priceRange.min <= request.budgetMax && stylist.priceRange.max >= request.budgetMin ? 1 : 0)
    : 0.5;

  const salonTypeMatch = request.salonType
    ? (stylist.salonType && stylist.salonType.toLowerCase() === request.salonType.toLowerCase() ? 1 : 0.5)
    : 0.5;

  const portfolioMatch = overlapScore(request.inspoTags || [], stylist.portfolio || []);

  const score =
    serviceMatch * weights.service +
    levelMatch * weights.level +
    certifiedMatch * weights.certified +
    locationMatch * weights.location +
    availabilityMatch * weights.availability +
    budgetMatch * weights.budget +
    portfolioMatch * weights.portfolio +
    salonTypeMatch * weights.salonType;

  return {
    score: Math.round(score),
    breakdown: {
      serviceMatch,
      levelMatch,
      certifiedMatch,
      locationMatch,
      availabilityMatch,
      budgetMatch,
      portfolioMatch,
      salonTypeMatch,
    },
  };
}

export function matchStylists(request, stylists = []) {
  const filtered = stylists.filter((stylist) => {
    const serviceOk = stylist.servicesOffered?.includes(request.serviceId);
    const budgetOk = request.budgetMin !== null && request.budgetMax !== null
      ? (stylist.priceRange && stylist.priceRange.min <= request.budgetMax && stylist.priceRange.max >= request.budgetMin)
      : true;
    return serviceOk && budgetOk;
  });

  return filtered
    .map((stylist) => {
      const result = scoreStylistForRequest(stylist, request);
      return {
        stylist,
        matchScore: result.score,
        breakdown: result.breakdown,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
