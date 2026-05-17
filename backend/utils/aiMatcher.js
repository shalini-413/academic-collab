const SYNONYM_GROUPS = [
  ['react', 'reactjs', 'react.js'],
  ['node', 'nodejs', 'node.js'],
  ['express', 'expressjs', 'express.js'],
  ['next', 'nextjs', 'next.js'],
  ['vue', 'vuejs', 'vue.js'],
  ['ai', 'artificial intelligence'],
  ['ml', 'machine learning'],
  ['dl', 'deep learning'],
  ['nlp', 'natural language processing'],
  ['cv', 'computer vision'],
  ['js', 'javascript'],
  ['ts', 'typescript'],
  ['mongo', 'mongodb'],
  ['postgres', 'postgresql'],
  ['sql', 'structured query language'],
  ['genai', 'generative ai', 'generative artificial intelligence'],
  ['llm', 'large language model', 'large language models'],
  ['rag', 'retrieval augmented generation', 'retrieval-augmented generation'],
  ['ui', 'user interface'],
  ['ux', 'user experience'],
  ['dbms', 'database management system'],
  ['iot', 'internet of things'],
  ['ar', 'augmented reality'],
  ['vr', 'virtual reality'],
  ['python', 'py'],
  ['java', 'java programming'],
  ['csharp', 'c#', 'c sharp'],
  ['cplusplus', 'c++', 'c plus plus'],
  ['php', 'hypertext preprocessor'],
  ['ruby', 'ruby on rails'],
  ['go', 'golang'],
  ['rust', 'rust programming'],
  ['swift', 'swift programming'],
  ['kotlin', 'kotlin programming'],
  ['scala', 'scala programming'],
  ['r', 'r programming', 'r language'],
  ['matlab', 'matlab programming'],
  ['tensorflow', 'tf'],
  ['pytorch', 'torch'],
  ['keras', 'keras deep learning'],
  ['pandas', 'pandas data analysis'],
  ['numpy', 'numerical python'],
  ['scikit', 'scikit-learn', 'sklearn'],
  ['django', 'django framework'],
  ['flask', 'flask framework'],
  ['spring', 'spring boot', 'spring framework'],
  ['angular', 'angularjs'],
  ['svelte', 'svelte framework'],
  ['ember', 'emberjs'],
  ['backbone', 'backbonejs'],
  ['jquery', 'jquery library'],
  ['bootstrap', 'bootstrap css'],
  ['tailwind', 'tailwindcss'],
  ['sass', 'scss'],
  ['less', 'less css'],
  ['webpack', 'webpack bundler'],
  ['vite', 'vite bundler'],
  ['babel', 'babel transpiler'],
  ['eslint', 'eslint linter'],
  ['prettier', 'prettier formatter'],
  ['jest', 'jest testing'],
  ['mocha', 'mocha testing'],
  ['cypress', 'cypress testing'],
  ['selenium', 'selenium testing'],
  ['docker', 'docker container'],
  ['kubernetes', 'k8s', 'k8s cluster'],
  ['aws', 'amazon web services'],
  ['azure', 'microsoft azure'],
  ['gcp', 'google cloud platform'],
  ['heroku', 'heroku platform'],
  ['vercel', 'vercel deployment'],
  ['netlify', 'netlify deployment'],
  ['git', 'github', 'gitlab'],
  ['ci/cd', 'continuous integration', 'continuous deployment'],
  ['devops', 'development operations'],
  ['agile', 'agile methodology'],
  ['scrum', 'scrum framework'],
  ['kanban', 'kanban board'],
  ['rest', 'rest api', 'restful'],
  ['graphql', 'graphql api'],
  ['grpc', 'grpc protocol'],
  ['websocket', 'websockets'],
  ['http', 'https', 'http protocol'],
  ['tcp', 'tcp protocol'],
  ['udp', 'udp protocol'],
  ['dns', 'domain name system'],
  ['cdn', 'content delivery network'],
  ['ssl', 'tls', 'ssl certificate'],
  ['oauth', 'oauth2', 'authentication'],
  ['jwt', 'json web token'],
  ['session', 'session management'],
  ['cookie', 'http cookie'],
  ['csrf', 'csrf protection'],
  ['xss', 'cross site scripting'],
  ['sqli', 'sql injection'],
  ['ddos', 'distributed denial of service'],
  ['mitm', 'man in the middle'],
  ['encryption', 'cryptography'],
  ['hashing', 'hash function'],
  ['blockchain', 'distributed ledger'],
  ['smart contract', 'ethereum contract'],
  ['web3', 'web3 blockchain'],
  ['metamask', 'ethereum wallet'],
  ['solidity', 'solidity smart contract'],
  ['truffle', 'truffle suite'],
  ['hardhat', 'hardhat ethereum'],
  ['ganache', 'ganache blockchain'],
  ['ipfs', 'interplanetary file system'],
  ['filecoin', 'filecoin storage'],
  ['big data', 'bigdata'],
  ['data science', 'data analytics'],
  ['data engineering', 'data pipeline'],
  ['etl', 'extract transform load'],
  ['data warehouse', 'dw'],
  ['data lake', 'datalake'],
  ['business intelligence', 'bi'],
  ['tableau', 'tableau analytics'],
  ['power bi', 'powerbi'],
  ['looker', 'looker analytics'],
  ['snowflake', 'snowflake data'],
  ['redshift', 'amazon redshift'],
  ['bigquery', 'google bigquery'],
  ['spark', 'apache spark'],
  ['hadoop', 'apache hadoop'],
  ['kafka', 'apache kafka'],
  ['rabbitmq', 'rabbit message queue'],
  ['redis', 'redis cache'],
  ['elasticsearch', 'elastic search'],
  ['solr', 'apache solr'],
  ['logstash', 'elastic logstash'],
  ['kibana', 'elastic kibana'],
  ['grafana', 'grafana monitoring'],
  ['prometheus', 'prometheus monitoring'],
  ['nagios', 'nagios monitoring'],
  ['zabbix', 'zabbix monitoring'],
  ['jenkins', 'jenkins ci'],
  ['travis', 'travis ci'],
  ['circleci', 'circle ci'],
  ['github actions', 'gh actions'],
  ['gitlab ci', 'gitlab cicd'],
  ['terraform', 'hashicorp terraform'],
  ['ansible', 'ansible automation'],
  ['chef', 'chef configuration'],
  ['puppet', 'puppet configuration'],
  ['saltstack', 'salt automation'],
  ['linux', 'gnu linux'],
  ['ubuntu', 'ubuntu linux'],
  ['debian', 'debian linux'],
  ['centos', 'centos linux'],
  ['redhat', 'rhel', 'red hat'],
  ['windows', 'microsoft windows'],
  ['macos', 'os x', 'mac os'],
  ['android', 'android os'],
  ['ios', 'iphone os'],
  ['flutter', 'flutter mobile'],
  ['react native', 'reactnative'],
  ['ionic', 'ionic framework'],
  ['xamarin', 'xamarin mobile'],
  ['unity', 'unity engine'],
  ['unreal', 'unreal engine'],
  ['game dev', 'game development'],
  ['game design', 'gamedesign'],
  ['3d modeling', '3d modeling'],
  ['blender', 'blender 3d'],
  ['maya', 'autodesk maya'],
  ['photoshop', 'adobe photoshop'],
  ['illustrator', 'adobe illustrator'],
  ['figma', 'figma design'],
  ['sketch', 'sketch design'],
  ['adobe xd', 'adobe experience design'],
  ['invision', 'invision design'],
  ['zeplin', 'zeplin design'],
  ['wireframe', 'wireframing'],
  ['prototype', 'prototyping'],
  ['ux research', 'user research'],
  ['user testing', 'usability testing'],
  ['a/b testing', 'ab testing'],
  ['conversion rate', 'cro'],
  ['seo', 'search engine optimization'],
  ['sem', 'search engine marketing'],
  ['ppc', 'pay per click'],
  ['social media', 'social media marketing'],
  ['content marketing', 'content strategy'],
  ['email marketing', 'email campaign'],
  ['affiliate marketing', 'affiliate program'],
  ['growth hacking', 'growth strategy'],
  ['product management', 'pm'],
  ['product design', 'product design'],
  ['agile product', 'agile product management'],
  ['scrum master', 'scrum facilitator'],
  ['tech lead', 'technical lead'],
  ['engineering manager', 'em'],
  ['cto', 'chief technology officer'],
  ['vp engineering', 'vice president engineering'],
  ['software architect', 'system architect'],
  ['full stack', 'fullstack'],
  ['frontend', 'front-end', 'client side'],
  ['backend', 'back-end', 'server side'],
  ['devops engineer', 'devops'],
  ['sre', 'site reliability engineer'],
  ['qa', 'quality assurance'],
  ['qa engineer', 'quality engineer'],
  ['manual testing', 'manual qa'],
  ['automation testing', 'test automation'],
  ['performance testing', 'load testing'],
  ['security testing', 'penetration testing'],
  ['accessibility', 'a11y', 'wcag'],
  ['responsive design', 'mobile first'],
  ['pwa', 'progressive web app'],
  ['spa', 'single page application'],
  ['ssr', 'server side rendering'],
  ['ssg', 'static site generation'],
  ['csr', 'client side rendering'],
  ['jamstack', 'jam stack'],
  ['headless cms', 'headless content management'],
  ['api first', 'api-first'],
  ['microservices', 'microservice architecture'],
  ['monolith', 'monolithic architecture'],
  ['serverless', 'serverless computing'],
  ['faas', 'function as a service'],
  ['baas', 'backend as a service'],
  ['saas', 'software as a service'],
  ['paas', 'platform as a service'],
  ['iaas', 'infrastructure as a service'],
  ['multi cloud', 'multi-cloud'],
  ['hybrid cloud', 'hybrid-cloud'],
  ['edge computing', 'edge processing'],
  ['fog computing', 'fog processing']
];

const STOP_WORDS = new Set([
  'and', 'or', 'the', 'for', 'with', 'from', 'into', 'onto', 'using', 'based',
  'project', 'research', 'student', 'professor', 'developer', 'development',
  'a', 'an', 'in', 'on', 'at', 'to', 'by', 'of', 'as', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'also', 'now', 'here', 'there', 'then', 'once', 'about', 'above', 'below',
  'after', 'before', 'between', 'under', 'again', 'further', 'their', 'your', 'our',
  'its', 'his', 'her', 'my', 'mine', 'yours', 'hers', 'ours', 'theirs'
]);

const CANONICAL_SYNONYMS = SYNONYM_GROUPS.reduce((map, group) => {
  const canonical = group[0];
  group.forEach((term) => {
    map.set(term, canonical);
    map.set(term.replace(/[.\-]/g, ''), canonical);
  });
  return map;
}, new Map());

const DEFAULT_FIELD_WEIGHTS = {
  skills: 1,
  technologies: 0.95,
  techStack: 0.95,
  researchInterests: 1,
  interests: 0.95,
  domains: 0.9,
  researchField: 0.9,
  topics: 0.85,
  tags: 0.8,
  keywords: 0.75,
  title: 0.28,
  description: 0.24,
  bio: 0.18,
  department: 0.16
};

const PROFILE_WEIGHTS = {
  skills: 1,
  researchInterests: 1.18,
  interests: 1.08,
  domains: 0.95,
  keywords: 0.72,
  bio: 0.12,
  department: 0.14
};

const STUDENT_TO_PROJECT_WEIGHTS = {
  skills: 1.18,
  researchInterests: 1.05,
  interests: 0.92,
  domains: 0.86,
  keywords: 0.72,
  bio: 0.08,
  department: 0.08
};

const PROJECT_WEIGHTS = {
  skills: 1.32,
  technologies: 1.12,
  researchInterests: 1.08,
  domains: 1.08,
  keywords: 0.86,
  tags: 0.78,
  title: 0.28,
  description: 0.22
};

const CONTEXT_WEIGHTS = {
  skills: 1.36,
  technologies: 1.16,
  researchInterests: 1.1,
  domains: 1.08,
  interests: 0.9,
  keywords: 0.84,
  tags: 0.8,
  title: 0.24,
  description: 0.18
};

const FIELD_LABELS = {
  skills: 'skills',
  technologies: 'technologies',
  techStack: 'technologies',
  researchInterests: 'research interests',
  interests: 'interests',
  domains: 'domains',
  researchField: 'research areas',
  topics: 'topics',
  tags: 'tags',
  keywords: 'keywords',
  title: 'project title',
  description: 'description',
  bio: 'bio',
  department: 'department'
};

class LRUCache {
  constructor(maxSize = 4000) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
    return value;
  }

  has(key) {
    return this.cache.has(key);
  }

  get size() {
    return this.cache.size;
  }
}

const termCache = new LRUCache(4000);
const vectorCache = new LRUCache(4000);

const clearMatchingCache = () => {
  termCache.clear();
  vectorCache.clear();
};

const clearCacheForUser = (userId) => {
  vectorCache.clear();
  termCache.clear();
};

const clearCacheForProject = (projectId) => {
  vectorCache.clear();
  termCache.clear();
};

const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${key}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? '');
};

const toArray = (value) => {
  if (value == null || value === false) return [];
  if (Array.isArray(value)) return value.flatMap(toArray);
  return String(value).split(/[,;/|]+/).map((item) => item.trim()).filter(Boolean);
};

const compactKeyword = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/c\+\+/g, 'cplusplus')
  .replace(/c#/g, 'csharp')
  .replace(/&/g, ' and ')
  .replace(/[._-]+/g, ' ')
  .replace(/[^a-z0-9+#\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeKeyword = (value) => {
  const cleaned = compactKeyword(value);
  if (!cleaned) return '';
  const squashed = cleaned.replace(/\s+/g, '');
  
  const canonicalMatch = CANONICAL_SYNONYMS.get(cleaned) || CANONICAL_SYNONYMS.get(squashed);
  if (canonicalMatch) return canonicalMatch;
  
  const allSynonyms = Array.from(CANONICAL_SYNONYMS.keys());
  const fuzzyMatch = findFuzzyMatch(cleaned, allSynonyms, 0.8);
  if (fuzzyMatch) {
    return CANONICAL_SYNONYMS.get(fuzzyMatch) || fuzzyMatch;
  }
  
  return cleaned;
};

const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

const findFuzzyMatch = (term, candidates, threshold = 0.7) => {
  if (!term || term.length < 3) return null;
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const candidate of candidates) {
    if (!candidate || candidate.length < 3) continue;
    
    const maxLen = Math.max(term.length, candidate.length);
    const distance = levenshteinDistance(term.toLowerCase(), candidate.toLowerCase());
    const similarity = 1 - (distance / maxLen);
    
    if (similarity >= threshold && similarity > bestScore) {
      bestScore = similarity;
      bestMatch = candidate;
    }
  }
  
  return bestMatch;
};

const tokenize = (value) => compactKeyword(value)
  .split(/\s+/)
  .map(normalizeKeyword)
  .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const termsFromValue = (value) => {
  const cacheKey = stableStringify(value);
  const cached = termCache.get(cacheKey);
  if (cached) return cached;

  const terms = [];
  toArray(value).forEach((item) => {
    const phrase = normalizeKeyword(item);
    if (phrase && !STOP_WORDS.has(phrase)) terms.push(phrase);
    tokenize(item).forEach((token) => terms.push(token));
  });

  const result = Array.from(new Set(terms));
  return termCache.set(cacheKey, result);
};

const addWeightedTerm = (vector, term, weight, field, displayTerm) => {
  if (!term || !Number.isFinite(weight) || weight <= 0) return;
  const existing = vector.get(term) || { weight: 0, fields: new Set(), display: displayTerm || term };
  existing.weight = Math.max(existing.weight, weight);
  existing.fields.add(FIELD_LABELS[field] || field);
  if (displayTerm && displayTerm.length < existing.display.length) existing.display = displayTerm;
  vector.set(term, existing);
};

const addTermWithPartials = (vector, term, weight, field) => {
  addWeightedTerm(vector, term, weight, field, term);
  tokenize(term).forEach((token) => {
    if (token !== term) addWeightedTerm(vector, token, weight * 0.68, field, token);
  });
};

const buildWeightedVector = (source = {}, fieldWeights = DEFAULT_FIELD_WEIGHTS) => {
  const cacheKey = stableStringify({ source, fieldWeights });
  const cached = vectorCache.get(cacheKey);
  if (cached) return cached;

  const vector = new Map();
  Object.entries(fieldWeights).forEach(([field, weight]) => {
    toArray(source[field]).forEach((item) => {
      termsFromValue(item).forEach((term) => addTermWithPartials(vector, term, weight, field));
    });
  });

  return vectorCache.set(cacheKey, vector);
};

const cosineSimilarity = (vectorA, vectorB) => {
  if (!vectorA.size || !vectorB.size) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  vectorA.forEach((entry) => { normA += entry.weight * entry.weight; });
  vectorB.forEach((entry) => { normB += entry.weight * entry.weight; });
  vectorA.forEach((entryA, term) => {
    const entryB = vectorB.get(term);
    if (entryB) dot += entryA.weight * entryB.weight;
  });

  const epsilon = 1e-10;
  if (normA < epsilon || normB < epsilon) return 0;
  
  const sqrtNormA = Math.sqrt(normA);
  const sqrtNormB = Math.sqrt(normB);
  
  if (sqrtNormA < epsilon || sqrtNormB < epsilon) return 0;
  
  const denominator = sqrtNormA * sqrtNormB;
  if (denominator < epsilon) return 0;

  const similarity = dot / denominator;
  
  if (!Number.isFinite(similarity)) return 0;
  if (isNaN(similarity)) return 0;
  
  return Math.max(0, Math.min(1, similarity));
};

const toScore = (similarity) => {
  if (!Number.isFinite(similarity) || similarity <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round(similarity * 100)));
};

const getMatchedDetails = (vectorA, vectorB) => [...vectorA.entries()]
  .filter(([term]) => vectorB.has(term))
  .map(([term, entryA]) => {
    const entryB = vectorB.get(term);
    const fields = Array.from(new Set([...entryA.fields, ...entryB.fields]));
    return {
      term,
      label: entryA.display || entryB.display || term,
      weight: (entryA.weight || 0) + (entryB.weight || 0),
      fields
    };
  })
  .sort((a, b) => b.weight - a.weight)
  .slice(0, 12);

const sanitizeResult = (result) => {
  const score = Math.min(100, Math.max(0, Number(result.score) || 0));
  const matchedDetails = result.matchedDetails || [];
  const matchedKeywords = Array.from(new Set(matchedDetails.map((detail) => detail.label))).slice(0, 10);
  return {
    ...result,
    score,
    matchScore: score,
    similarity: Number.isFinite(result.similarity) ? result.similarity : score / 100,
    matchPercentage: score,
    matchedKeywords,
    matchedSkills: matchedDetails.filter((detail) => detail.fields.some((field) => field.includes('skill') || field.includes('technolog'))).map((detail) => detail.label).slice(0, 8),
    matchedInterests: matchedDetails.filter((detail) => detail.fields.some((field) => field.includes('interest') || field.includes('area') || field.includes('domain'))).map((detail) => detail.label).slice(0, 8),
    whyMatched: matchedKeywords.length
      ? `Matched because of ${matchedKeywords.slice(0, 5).join(', ')}`
      : 'No strong overlap yet. Add more skills, interests, or research domains.',
    vectorSize: result.vectorSize || { source: 0, target: 0 }
  };
};

const compareSources = (sourceA = {}, sourceB = {}, options = {}) => {
  const vectorA = buildWeightedVector(sourceA, options.weightsA || DEFAULT_FIELD_WEIGHTS);
  const vectorB = buildWeightedVector(sourceB, options.weightsB || DEFAULT_FIELD_WEIGHTS);
  const similarity = cosineSimilarity(vectorA, vectorB);
  const matchedDetails = getMatchedDetails(vectorA, vectorB);

  return sanitizeResult({
    score: toScore(similarity),
    similarity,
    matchedDetails,
    vectorSize: { source: vectorA.size, target: vectorB.size }
  });
};

const profileSource = (profile = {}) => ({
  skills: profile.skills || [],
  researchInterests: profile.researchInterests || [],
  interests: profile.interests || profile.researchInterests || [],
  domains: profile.domains || profile.researchField || [],
  keywords: profile.keywords || profile.tags || [],
  department: profile.department || '',
  bio: profile.bio || ''
});

const projectSource = (project = {}) => ({
  skills: project.requiredSkills || project.skills || [],
  technologies: project.technologies || project.techStack || [],
  researchInterests: project.researchField || project.researchInterests || [],
  domains: project.domains || project.researchField || [],
  keywords: project.keywords || project.tags || [],
  tags: project.tags || [],
  title: project.title || '',
  description: project.description || ''
});

const filterSource = (filters = {}) => ({
  skills: [filters.skills, filters.techStack, filters.technologies].filter(Boolean),
  researchInterests: [filters.interests, filters.researchInterests, filters.domain].filter(Boolean),
  domains: [filters.department, filters.domain].filter(Boolean),
  keywords: [filters.q, filters.search, filters.keyword].filter(Boolean)
});

const hasMeaningfulContext = (context = {}) => Object.values(context).some((value) => toArray(value).length > 0);

const mergeContext = (...contexts) => contexts.reduce((merged, context) => {
  Object.entries(context || {}).forEach(([key, value]) => {
    const values = toArray(value);
    if (values.length) merged[key] = [...(merged[key] || []), ...values];
  });
  return merged;
}, {});

const combineResults = (parts, weights) => {
  const totalWeight = weights.reduce((sum, weight, index) => sum + (parts[index] ? weight : 0), 0) || 1;
  const score = Math.round(parts.reduce((sum, part, index) => sum + ((part?.score || 0) * weights[index]), 0) / totalWeight);
  const matchedDetails = Array.from(new Map(
    parts.flatMap((part) => part?.matchedDetails || []).map((detail) => [detail.term, detail])
  ).values()).slice(0, 12);

  return sanitizeResult({
    score,
    similarity: score / 100,
    matchedDetails,
    vectorSize: {
      source: parts[0]?.vectorSize?.source || 0,
      target: parts.reduce((sum, part) => sum + (part?.vectorSize?.target || 0), 0)
    },
    profileScore: parts[0]?.score || 0,
    contextScore: parts[1]?.score || 0
  });
};

const rankMatches = (source, targets = [], scorer, limit) => targets
  .map((target) => ({ target, match: scorer(source, target) }))
  .map(({ target, match }) => ({ ...target, ...match }))
  .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  .slice(0, limit || targets.length);

const matchingEngine = {
  normalizeKeyword,
  termsFromValue,
  buildWeightedVector,
  compareSources,
  profileSource,
  projectSource,
  filterSource,

  compareProfiles(profileA = {}, profileB = {}) {
    return compareSources(profileSource(profileA), profileSource(profileB), {
      weightsA: STUDENT_TO_PROJECT_WEIGHTS,
      weightsB: STUDENT_TO_PROJECT_WEIGHTS
    });
  },

  compareUserToProject(user = {}, project = {}) {
    const result = compareSources(profileSource(user), projectSource(project), {
      weightsA: STUDENT_TO_PROJECT_WEIGHTS,
      weightsB: PROJECT_WEIGHTS
    });
    return result;
  },

  compareWithContext(profileA = {}, profileB = {}, context = {}) {
    const base = this.compareProfiles(profileA, profileB);
    const normalizedContext = projectSource(context);
    if (!hasMeaningfulContext(normalizedContext)) return { ...base, profileScore: base.score, contextScore: 0 };

    const contextMatch = compareSources(profileSource(profileB), normalizedContext, {
      weightsA: STUDENT_TO_PROJECT_WEIGHTS,
      weightsB: PROJECT_WEIGHTS
    });

    return combineResults([base, contextMatch], [0.5, 0.5]);
  },

  compareProfileToFilters(profileA = {}, profileB = {}, filters = {}, project = null) {
    const context = mergeContext(filterSource(filters), project ? projectSource(project) : {});
    return this.compareWithContext(profileA, profileB, context);
  },

  rankProfiles(sourceProfile, targetProfiles = [], options = {}) {
    return rankMatches(
      sourceProfile,
      targetProfiles,
      (source, target) => options.context
        ? this.compareWithContext(source, target, options.context)
        : this.compareProfiles(source, target),
      options.limit
    );
  },

  rankProjects(user, projects = [], options = {}) {
    return rankMatches(user, projects, (source, project) => this.compareUserToProject(source, project), options.limit);
  },

//   getStudentProjectMatchScore(student = {}, project = {}) {
//     const result = this.compareUserToProject(student, project);
//     if (process.env.DEBUG_MATCHING === 'true') {
//       console.log('[MATCH DEBUG]', {
//         studentId: student._id,
//         clearMatchingCache = clearMatchingCache;
// exports.clearCacheForUser = clearCacheForUser;
// exports.clearCacheForProject = clearCacheForProject;

// exports.projectId: project._id,
//         studentSkills: student.skills,
//         projectSkills: project.requiredSkills,
//         studentInterests: student.researchInterests,
//         projectField: project.researchField,
//         matchScore: result.matchScore,
//         matchedDetails: result.matchedDetails
//       });
//     }
//     return result;
//   }

getStudentProjectMatchScore(student = {}, project = {}) {
  const result = this.compareUserToProject(student, project);
  if (process.env.DEBUG_MATCHING === 'true') {
    console.log('[MATCH DEBUG]', {
      studentId: student._id,
      projectId: project._id,
      studentSkills: student.skills,
      projectSkills: project.requiredSkills,
      studentInterests: student.researchInterests,
      projectField: project.researchField,
      matchScore: result.matchScore,
      matchedDetails: result.matchedDetails
    });
  }
  return result;
}
};

exports.matchingEngine = matchingEngine;
exports.clearMatchingCache = clearMatchingCache;
exports.clearCacheForUser = clearCacheForUser;
exports.clearCacheForProject = clearCacheForProject;

exports.getMatchScore = (studentSkills = [], projectSkills = []) =>
matchingEngine.compareSources({ skills: studentSkills }, { skills: projectSkills }).score;

exports.getProfileMatchScore = (profileA = {}, profileB = {}) =>
matchingEngine.compareProfiles(profileA, profileB).score;



