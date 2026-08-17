const Category = require('../catalog/category.model');
const Service = require('../catalog/service.model');

/**
 * Mock AI Service for Intent Matching
 * In production, this would call OpenAI/Gemini with the user's message and the catalog context.
 */
const resolveIntent = async (message) => {
  if (!message || typeof message !== 'string') {
    const error = new Error('Message is required');
    error.statusCode = 400;
    throw error;
  }

  const query = message.toLowerCase();
  
  // 1. Fetch catalog context (in real AI, we'd pass this to the prompt)
  // For this mock, we'll just do a very basic keyword search
  const services = await Service.find({ isActive: true })
    .populate('categoryId', 'name')
    .populate('subcategoryId', 'name')
    .lean();

  const matches = [];

  // Very basic mock heuristic for Hindi/English keywords matching the taxonomy document
  const keywords = {
    'saaf': ['Cleaning', 'Deep Cleaning'],
    'clean': ['Cleaning', 'Deep Cleaning'],
    'ac': ['AC Repair', 'Appliance Repair'],
    'thanda': ['AC Repair'],
    'pipe': ['Plumbing'],
    'nal': ['Plumbing'],
    'doctor': ['Healthcare', 'Teleconsultation'],
    'bimar': ['Healthcare', 'Teleconsultation'],
    'khet': ['Agriculture', 'Tractor'],
    'tractor': ['Agriculture', 'Tractor'],
    'puja': ['Spiritual', 'Pandit']
  };

  // Find matching categories based on keywords
  let foundKeywords = [];
  for (const [key, relatedTerms] of Object.entries(keywords)) {
    if (query.includes(key)) {
      foundKeywords.push(...relatedTerms);
    }
  }

  if (foundKeywords.length > 0) {
    // Filter services that match the found keywords
    services.forEach(service => {
      const match = foundKeywords.some(term => 
        (service.name && service.name.includes(term)) ||
        (service.categoryId && service.categoryId.name && service.categoryId.name.includes(term)) ||
        (service.subcategoryId && service.subcategoryId.name && service.subcategoryId.name.includes(term))
      );
      if (match) {
        matches.push(service);
      }
    });
  }

  // If no specific match, suggest popular ones or fallback
  let responseText = "I found some services that might help you.";
  if (matches.length === 0) {
    responseText = "I couldn't find an exact match for that, but here are some popular services.";
    // Just return top 3 as fallback
    matches.push(...services.slice(0, 3));
  }

  return {
    reply: responseText,
    suggestedServices: matches.slice(0, 3).map(s => ({
      serviceId: s._id,
      name: s.name,
      category: s.categoryId ? s.categoryId.name : 'Unknown'
    }))
  };
};

module.exports = {
  resolveIntent
};
