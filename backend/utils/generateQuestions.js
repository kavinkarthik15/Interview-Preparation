// ─── Universal Dynamic Question Engine ──────────────────────
// Generates a structured set of interview questions tailored to
// any job_role × experience_level combination.
//
// Question categories (Phase 3):
//   core_knowledge  – fundamentals & concepts for the role
//   scenario_based  – "what would you do if…" situational Qs
//   problem_solving – analytical / design / debugging Qs
//   behavioral      – STAR-method past-experience Qs
//
// Each question carries rich metadata:
//   { text, category, type, difficulty, expectedTopics,
//     keyCompetency, evaluationCriteria, timeLimit }
//
// Swap this module for an AI-powered generator later —
// just return the same shape from generateQuestions().
// ─────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────
//  QUESTION BANK — organised by category × difficulty
// ─────────────────────────────────────────────────────────────

const QUESTION_BANK = {
  // ═══════════════════════════════════════════════════════════
  //  CORE KNOWLEDGE — fundamentals, concepts, theory
  // ═══════════════════════════════════════════════════════════
  core_knowledge: {
    easy: [
      {
        text: 'What are the basic data types in your primary programming language?',
        keyCompetency: 'Language Fundamentals',
        evaluationCriteria: ['Correct enumeration', 'Understanding of type system', 'Mention of type coercion']
      },
      {
        text: 'Explain the difference between a stack and a queue.',
        keyCompetency: 'Data Structures',
        evaluationCriteria: ['LIFO vs FIFO distinction', 'Real-world examples', 'Common operations']
      },
      {
        text: 'What is the purpose of version control systems like Git?',
        keyCompetency: 'Development Tools',
        evaluationCriteria: ['Collaboration benefits', 'History tracking', 'Branching concepts']
      },
      {
        text: 'Describe what an API is and why it matters.',
        keyCompetency: 'Software Architecture',
        evaluationCriteria: ['Clear definition', 'Use-case examples', 'Understanding of contract']
      },
      {
        text: 'What is HTTP and how does it work at a high level?',
        keyCompetency: 'Networking',
        evaluationCriteria: ['Request-response model', 'Common methods', 'Status codes awareness']
      },
      {
        text: 'What is the difference between a class and an object?',
        keyCompetency: 'OOP Fundamentals',
        evaluationCriteria: ['Blueprint vs instance', 'Instantiation', 'Property/method access']
      },
      {
        text: 'Explain what a relational database is and give an example.',
        keyCompetency: 'Databases',
        evaluationCriteria: ['Tables/rows/columns', 'Relationships', 'SQL mention']
      },
      {
        text: 'What is the difference between compiled and interpreted languages?',
        keyCompetency: 'Language Fundamentals',
        evaluationCriteria: ['Compilation step', 'Runtime behavior', 'Examples of each']
      },
      {
        text: 'What are environment variables and why are they used?',
        keyCompetency: 'Development Practices',
        evaluationCriteria: ['Configuration management', 'Security benefits', 'Practical usage']
      },
      {
        text: 'Explain the concept of DRY (Don\'t Repeat Yourself) in software development.',
        keyCompetency: 'Software Principles',
        evaluationCriteria: ['Definition', 'Benefits', 'Practical application']
      }
    ],
    medium: [
      {
        text: 'Explain the concept of time complexity and give examples of O(n) vs O(n²).',
        keyCompetency: 'Algorithms',
        evaluationCriteria: ['Big-O notation', 'Concrete examples', 'Space vs time trade-off']
      },
      {
        text: 'What are design patterns? Describe one you have used.',
        keyCompetency: 'Software Design',
        evaluationCriteria: ['Pattern definition', 'Specific example', 'When to apply']
      },
      {
        text: 'Explain how indexing works in databases and when you would use it.',
        keyCompetency: 'Database Optimization',
        evaluationCriteria: ['B-tree / index structure', 'Query performance', 'Trade-offs']
      },
      {
        text: 'Describe the differences between SQL and NoSQL databases.',
        keyCompetency: 'Databases',
        evaluationCriteria: ['Schema flexibility', 'Scalability patterns', 'Use-case fit']
      },
      {
        text: 'What is RESTful API design? What are its core principles?',
        keyCompetency: 'API Design',
        evaluationCriteria: ['REST constraints', 'Resource-oriented design', 'HTTP methods mapping']
      },
      {
        text: 'Explain the event loop in Node.js (or the concurrency model of your preferred runtime).',
        keyCompetency: 'Runtime Internals',
        evaluationCriteria: ['Single-threaded model', 'Call stack & task queue', 'Non-blocking I/O']
      },
      {
        text: 'What is the difference between authentication and authorization?',
        keyCompetency: 'Security',
        evaluationCriteria: ['Clear distinction', 'Examples (JWT, RBAC)', 'Implementation awareness']
      },
      {
        text: 'Explain SOLID principles and why they matter.',
        keyCompetency: 'Software Design',
        evaluationCriteria: ['All five principles', 'Practical benefits', 'Example of violation']
      },
      {
        text: 'What is dependency injection and what problem does it solve?',
        keyCompetency: 'Software Architecture',
        evaluationCriteria: ['Inversion of control', 'Testability', 'Loose coupling']
      },
      {
        text: 'Explain the difference between processes and threads.',
        keyCompetency: 'Operating Systems',
        evaluationCriteria: ['Memory isolation', 'Scheduling', 'Concurrency implications']
      }
    ],
    hard: [
      {
        text: 'Explain how garbage collection works in your preferred language runtime.',
        keyCompetency: 'Runtime Internals',
        evaluationCriteria: ['GC algorithm type', 'Generational collection', 'Tuning strategies']
      },
      {
        text: 'Describe the CAP theorem and its implications for distributed systems.',
        keyCompetency: 'Distributed Systems',
        evaluationCriteria: ['Three guarantees', 'Partition tolerance', 'Real-world trade-offs']
      },
      {
        text: 'Explain the differences between optimistic and pessimistic locking.',
        keyCompetency: 'Concurrency',
        evaluationCriteria: ['Conflict detection vs prevention', 'Performance impact', 'Use-case fit']
      },
      {
        text: 'How does TLS/SSL ensure secure communication? Walk through the handshake.',
        keyCompetency: 'Security',
        evaluationCriteria: ['Certificate exchange', 'Symmetric/asymmetric keys', 'Forward secrecy']
      },
      {
        text: 'Explain eventual consistency and how it differs from strong consistency.',
        keyCompetency: 'Distributed Systems',
        evaluationCriteria: ['Consistency models', 'Latency trade-offs', 'Conflict resolution']
      },
      {
        text: 'What are consensus algorithms? Compare Raft and Paxos at a high level.',
        keyCompetency: 'Distributed Systems',
        evaluationCriteria: ['Leader election', 'Log replication', 'Fault tolerance']
      },
      {
        text: 'Explain how a B-tree index differs from a hash index in databases.',
        keyCompetency: 'Database Internals',
        evaluationCriteria: ['Range queries', 'Equality lookups', 'I/O characteristics']
      },
      {
        text: 'Describe the internals of a HashMap — hashing, collisions, and resizing.',
        keyCompetency: 'Data Structures',
        evaluationCriteria: ['Hash function', 'Collision strategies', 'Amortized complexity']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  //  SCENARIO-BASED — "what would you do if…"
  // ═══════════════════════════════════════════════════════════
  scenario_based: {
    easy: [
      {
        text: 'If you were given a task with unclear requirements, what would you do first?',
        keyCompetency: 'Communication',
        evaluationCriteria: ['Clarification approach', 'Stakeholder engagement', 'Documentation']
      },
      {
        text: 'How would you approach joining a new team and codebase?',
        keyCompetency: 'Adaptability',
        evaluationCriteria: ['Onboarding strategy', 'Code reading approach', 'Relationship building']
      },
      {
        text: 'What would you do if you realized you made a mistake in production?',
        keyCompetency: 'Accountability',
        evaluationCriteria: ['Immediate actions', 'Communication', 'Post-mortem mindset']
      },
      {
        text: 'How would you handle being assigned a technology you have never used before?',
        keyCompetency: 'Learning Agility',
        evaluationCriteria: ['Learning plan', 'Resource identification', 'Time management']
      },
      {
        text: 'What would you do if you disagreed with a code review comment?',
        keyCompetency: 'Collaboration',
        evaluationCriteria: ['Professional discourse', 'Evidence-based argument', 'Compromise']
      }
    ],
    medium: [
      {
        text: 'If two senior engineers disagree on an architectural approach, how would you help reach a decision?',
        keyCompetency: 'Conflict Resolution',
        evaluationCriteria: ['Mediation skills', 'Data-driven evaluation', 'Decision framework']
      },
      {
        text: 'How would you handle a situation where a critical feature deadline conflicts with code quality?',
        keyCompetency: 'Prioritization',
        evaluationCriteria: ['Risk assessment', 'Trade-off awareness', 'Stakeholder communication']
      },
      {
        text: 'What would you do if you discovered a security vulnerability in a third-party dependency?',
        keyCompetency: 'Security Awareness',
        evaluationCriteria: ['Severity assessment', 'Mitigation steps', 'Disclosure process']
      },
      {
        text: 'How would you approach estimating a project when the scope is ambiguous?',
        keyCompetency: 'Project Planning',
        evaluationCriteria: ['Estimation techniques', 'Uncertainty buffers', 'Iterative refinement']
      },
      {
        text: 'Your team is behind schedule on a sprint. What steps do you take?',
        keyCompetency: 'Delivery Management',
        evaluationCriteria: ['Root-cause analysis', 'Scope negotiation', 'Communication plan']
      },
      {
        text: 'A junior developer submits a PR with significant issues. How do you review it?',
        keyCompetency: 'Mentoring',
        evaluationCriteria: ['Constructive feedback', 'Teaching approach', 'Empathy']
      },
      {
        text: 'A stakeholder requests a feature that contradicts your technical best practices. How do you respond?',
        keyCompetency: 'Stakeholder Management',
        evaluationCriteria: ['Technical explanation', 'Alternative proposals', 'Business empathy']
      }
    ],
    hard: [
      {
        text: 'If the system you own started experiencing cascading failures at 2 AM, walk me through your incident response.',
        keyCompetency: 'Incident Management',
        evaluationCriteria: ['Triage process', 'Communication protocol', 'Root-cause analysis', 'Post-mortem']
      },
      {
        text: 'How would you convince leadership to invest in paying down technical debt?',
        keyCompetency: 'Strategic Influence',
        evaluationCriteria: ['Business case framing', 'Risk quantification', 'Incremental approach']
      },
      {
        text: 'You inherit a critical service with no documentation, no tests, and the original author has left. What is your plan?',
        keyCompetency: 'Risk Management',
        evaluationCriteria: ['Assessment approach', 'Stabilization steps', 'Knowledge capture']
      },
      {
        text: 'A production database is growing beyond capacity and queries are slowing. Outline your remediation strategy.',
        keyCompetency: 'Operational Excellence',
        evaluationCriteria: ['Immediate mitigation', 'Long-term architecture', 'Monitoring']
      },
      {
        text: 'Your team morale is low after a failed launch. How do you help the team recover?',
        keyCompetency: 'Leadership',
        evaluationCriteria: ['Empathy', 'Retrospective facilitation', 'Motivational approach']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  //  PROBLEM-SOLVING — analytical, design, debugging questions
  // ═══════════════════════════════════════════════════════════
  problem_solving: {
    easy: [
      {
        text: 'How would you design a URL shortener?',
        keyCompetency: 'System Design',
        evaluationCriteria: ['Hash/ID generation', 'Storage strategy', 'Redirect flow']
      },
      {
        text: 'Describe how you would build a simple to-do list application.',
        keyCompetency: 'Application Design',
        evaluationCriteria: ['Data model', 'CRUD operations', 'User interface considerations']
      },
      {
        text: 'How would you find a bug that only happens intermittently in production?',
        keyCompetency: 'Debugging',
        evaluationCriteria: ['Reproduce strategy', 'Logging approach', 'Hypothesis testing']
      },
      {
        text: 'How would you design a basic authentication system with login and registration?',
        keyCompetency: 'Security Design',
        evaluationCriteria: ['Password hashing', 'Session/token management', 'Input validation']
      },
      {
        text: 'Given a list of one million integers, how would you find duplicates efficiently?',
        keyCompetency: 'Algorithmic Thinking',
        evaluationCriteria: ['Data structure choice', 'Time/space complexity', 'Edge cases']
      }
    ],
    medium: [
      {
        text: 'How would you design a notification service that supports email, SMS, and push notifications?',
        keyCompetency: 'System Design',
        evaluationCriteria: ['Channel abstraction', 'Queue architecture', 'Retry/failure handling']
      },
      {
        text: 'Design an API rate limiting system that works across multiple servers.',
        keyCompetency: 'Distributed Systems Design',
        evaluationCriteria: ['Token bucket / sliding window', 'Shared state', 'Edge cases']
      },
      {
        text: 'How would you design a job queue system for processing background tasks?',
        keyCompetency: 'System Design',
        evaluationCriteria: ['Queue semantics', 'Worker model', 'At-least-once delivery']
      },
      {
        text: 'Describe how you would debug a memory leak in a production application.',
        keyCompetency: 'Debugging',
        evaluationCriteria: ['Profiling tools', 'Heap analysis', 'Common leak patterns']
      },
      {
        text: 'How would you implement a search feature that returns results as the user types?',
        keyCompetency: 'Feature Design',
        evaluationCriteria: ['Debouncing', 'Indexing strategy', 'Relevance ranking']
      },
      {
        text: 'How would you design a caching layer for a read-heavy application?',
        keyCompetency: 'Performance Optimization',
        evaluationCriteria: ['Cache invalidation', 'TTL strategy', 'Cache-aside vs write-through']
      },
      {
        text: 'You notice an API endpoint is consistently slow. Walk me through how you would diagnose and fix it.',
        keyCompetency: 'Performance Debugging',
        evaluationCriteria: ['Profiling methodology', 'Database query analysis', 'Incremental optimization']
      }
    ],
    hard: [
      {
        text: 'How would you design a real-time collaborative document editor like Google Docs?',
        keyCompetency: 'Advanced System Design',
        evaluationCriteria: ['CRDT / OT algorithm', 'Conflict resolution', 'Sync model']
      },
      {
        text: 'Design a distributed cache system with consistency guarantees.',
        keyCompetency: 'Distributed Systems Design',
        evaluationCriteria: ['Partitioning', 'Replication', 'Consistency protocol']
      },
      {
        text: 'How would you architect a system that handles 100k requests per second with sub-100ms latency?',
        keyCompetency: 'High-Performance Design',
        evaluationCriteria: ['Load balancing', 'Horizontal scaling', 'Bottleneck identification']
      },
      {
        text: 'Design a recommendation engine for an e-commerce platform.',
        keyCompetency: 'ML System Design',
        evaluationCriteria: ['Collaborative filtering', 'Feature engineering', 'Serving architecture']
      },
      {
        text: 'How would you migrate a legacy monolith to microservices with zero downtime?',
        keyCompetency: 'Architecture Migration',
        evaluationCriteria: ['Strangler fig pattern', 'Data migration', 'Rollback plan']
      },
      {
        text: 'Design a fraud detection system that processes financial transactions in real time.',
        keyCompetency: 'Stream Processing Design',
        evaluationCriteria: ['Event pipeline', 'Rule engine vs ML', 'Latency requirements']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  //  BEHAVIORAL — past-experience, STAR-method questions
  // ═══════════════════════════════════════════════════════════
  behavioral: {
    easy: [
      {
        text: 'Tell me about yourself and your professional background.',
        keyCompetency: 'Self-Awareness',
        evaluationCriteria: ['Clear narrative', 'Relevance to role', 'Conciseness']
      },
      {
        text: 'Why are you interested in this role?',
        keyCompetency: 'Motivation',
        evaluationCriteria: ['Company research', 'Role alignment', 'Genuine enthusiasm']
      },
      {
        text: 'Describe a project you are proud of and your role in it.',
        keyCompetency: 'Ownership',
        evaluationCriteria: ['Clear contribution', 'Impact description', 'Lessons learned']
      },
      {
        text: 'How do you prioritize your tasks when you have multiple deadlines?',
        keyCompetency: 'Time Management',
        evaluationCriteria: ['Prioritization framework', 'Communication', 'Flexibility']
      },
      {
        text: 'Describe a time you helped a colleague solve a problem.',
        keyCompetency: 'Teamwork',
        evaluationCriteria: ['Initiative', 'Approach', 'Outcome']
      }
    ],
    medium: [
      {
        text: 'Describe a time when you had a conflict with a teammate. How did you resolve it?',
        keyCompetency: 'Conflict Resolution',
        evaluationCriteria: ['Situation clarity', 'Resolution approach', 'Relationship outcome']
      },
      {
        text: 'Tell me about a time you failed. What did you learn?',
        keyCompetency: 'Growth Mindset',
        evaluationCriteria: ['Honest failure admission', 'Root-cause reflection', 'Applied learning']
      },
      {
        text: 'How do you handle receiving critical feedback on your work?',
        keyCompetency: 'Coachability',
        evaluationCriteria: ['Emotional regulation', 'Action plan', 'Follow-up']
      },
      {
        text: 'Describe a situation where you had to learn a new technology quickly to deliver a project.',
        keyCompetency: 'Learning Agility',
        evaluationCriteria: ['Learning strategy', 'Time management', 'Delivery outcome']
      },
      {
        text: 'Give an example of when you went above and beyond your defined responsibilities.',
        keyCompetency: 'Initiative',
        evaluationCriteria: ['Situation context', 'Self-motivation', 'Impact']
      },
      {
        text: 'Tell me about a time you had to persuade others to adopt your idea.',
        keyCompetency: 'Influence',
        evaluationCriteria: ['Preparation', 'Communication approach', 'Outcome']
      }
    ],
    hard: [
      {
        text: 'Tell me about a time you had to make a difficult decision with incomplete information.',
        keyCompetency: 'Decision Making',
        evaluationCriteria: ['Decision framework', 'Risk assessment', 'Outcome and reflection']
      },
      {
        text: 'Describe a situation where you disagreed with your manager on a technical direction. What happened?',
        keyCompetency: 'Professional Courage',
        evaluationCriteria: ['Respectful challenge', 'Evidence-based argument', 'Resolution']
      },
      {
        text: 'How have you handled a situation where project requirements changed significantly mid-sprint?',
        keyCompetency: 'Adaptability',
        evaluationCriteria: ['Impact assessment', 'Reprioritization', 'Stakeholder communication']
      },
      {
        text: 'Give an example of how you mentored or helped a junior developer grow.',
        keyCompetency: 'Mentoring',
        evaluationCriteria: ['Teaching approach', 'Patience', 'Measurable growth']
      },
      {
        text: 'Describe the most complex cross-team coordination you have managed.',
        keyCompetency: 'Leadership',
        evaluationCriteria: ['Scope of coordination', 'Communication plan', 'Delivery outcome']
      },
      {
        text: 'Tell me about a time you identified a systemic problem nobody else noticed. What did you do?',
        keyCompetency: 'Strategic Thinking',
        evaluationCriteria: ['Pattern recognition', 'Initiative', 'Organizational impact']
      }
    ]
  }
};

// ─── Role-specific question overrides ────────────────────────
// These are injected as core_knowledge questions.
const ROLE_QUESTIONS = {
  'frontend developer': [
    { text: 'Explain the Virtual DOM and how it improves rendering performance.', keyCompetency: 'Frontend Frameworks', evaluationCriteria: ['Reconciliation process', 'Diffing algorithm', 'Real DOM comparison'] },
    { text: 'What are Core Web Vitals and how do you optimize for them?', keyCompetency: 'Performance', evaluationCriteria: ['LCP, FID, CLS definitions', 'Measurement tools', 'Optimization techniques'] },
    { text: 'Describe how you would implement accessibility (a11y) in a web application.', keyCompetency: 'Accessibility', evaluationCriteria: ['ARIA attributes', 'Keyboard navigation', 'Screen reader support'] },
    { text: 'What is the difference between SSR, SSG, and CSR? When would you choose each?', keyCompetency: 'Rendering Strategies', evaluationCriteria: ['Performance trade-offs', 'SEO implications', 'Use-case mapping'] }
  ],
  'backend developer': [
    { text: 'How do you design a scalable REST API?', keyCompetency: 'API Architecture', evaluationCriteria: ['Resource modeling', 'Pagination/filtering', 'Versioning'] },
    { text: 'Explain connection pooling and why it matters for database performance.', keyCompetency: 'Database Performance', evaluationCriteria: ['Pool lifecycle', 'Configuration tuning', 'Connection overhead'] },
    { text: 'How do you handle database migrations safely in production?', keyCompetency: 'Operational Practices', evaluationCriteria: ['Migration tools', 'Rollback strategy', 'Zero-downtime approach'] },
    { text: 'Describe your approach to API versioning and backward compatibility.', keyCompetency: 'API Design', evaluationCriteria: ['Versioning strategies', 'Deprecation policy', 'Contract testing'] }
  ],
  'full stack developer': [
    { text: 'How do you decide what logic belongs on the frontend vs. the backend?', keyCompetency: 'Architecture', evaluationCriteria: ['Performance considerations', 'Security boundaries', 'UX implications'] },
    { text: 'Describe your experience with both SQL and NoSQL databases and when you choose each.', keyCompetency: 'Databases', evaluationCriteria: ['Data modeling approach', 'Scalability', 'Consistency requirements'] },
    { text: 'How do you manage shared types or API contracts between frontend and backend?', keyCompetency: 'Cross-Stack Practices', evaluationCriteria: ['Contract definition', 'Code generation', 'Validation sync'] },
    { text: 'What is your approach to end-to-end testing across the full stack?', keyCompetency: 'Testing', evaluationCriteria: ['Tool selection', 'Test scope', 'CI integration'] }
  ],
  'data engineer': [
    { text: 'Explain the difference between batch and stream processing.', keyCompetency: 'Data Processing', evaluationCriteria: ['Latency trade-offs', 'Use-case fit', 'Technology examples'] },
    { text: 'How would you design a fault-tolerant ETL pipeline?', keyCompetency: 'Data Pipeline Design', evaluationCriteria: ['Idempotency', 'Error handling', 'Monitoring'] },
    { text: 'What is data partitioning and when would you use it?', keyCompetency: 'Data Architecture', evaluationCriteria: ['Partition strategies', 'Query performance', 'Rebalancing'] },
    { text: 'Describe your experience with data warehousing solutions and how you choose between them.', keyCompetency: 'Data Warehousing', evaluationCriteria: ['Tool comparison', 'Schema design', 'Query optimization'] }
  ],
  'devops engineer': [
    { text: 'Describe a CI/CD pipeline you have built or maintained. What were the key design decisions?', keyCompetency: 'CI/CD', evaluationCriteria: ['Pipeline stages', 'Testing strategy', 'Deployment strategy'] },
    { text: 'How do you approach infrastructure as code and what tools do you prefer?', keyCompetency: 'IaC', evaluationCriteria: ['Tool comparison', 'State management', 'Drift detection'] },
    { text: 'What is container orchestration and when would you use Kubernetes vs. simpler alternatives?', keyCompetency: 'Containers', evaluationCriteria: ['Orchestration benefits', 'Complexity trade-offs', 'Scaling strategies'] },
    { text: 'How do you design monitoring, alerting, and observability for production systems?', keyCompetency: 'Observability', evaluationCriteria: ['Metrics/logs/traces', 'Alert design', 'SLO/SLI awareness'] }
  ],
  'mobile developer': [
    { text: 'What are the key differences between native and cross-platform mobile development?', keyCompetency: 'Mobile Architecture', evaluationCriteria: ['Performance impact', 'Development speed', 'Maintenance cost'] },
    { text: 'How do you handle offline-first functionality in mobile applications?', keyCompetency: 'Mobile Patterns', evaluationCriteria: ['Local storage', 'Sync strategies', 'Conflict resolution'] },
    { text: 'Describe your approach to mobile app performance optimization.', keyCompetency: 'Performance', evaluationCriteria: ['Rendering optimization', 'Memory management', 'Network efficiency'] },
    { text: 'How do you manage complex application state in a mobile app?', keyCompetency: 'State Management', evaluationCriteria: ['Architecture pattern', 'Reactivity model', 'Testing approach'] }
  ],
  'qa engineer': [
    { text: 'Describe your approach to building a test automation framework from scratch.', keyCompetency: 'Test Automation', evaluationCriteria: ['Framework architecture', 'Tool selection', 'Maintainability'] },
    { text: 'How do you decide what to automate vs. test manually?', keyCompetency: 'Test Strategy', evaluationCriteria: ['ROI analysis', 'Risk-based testing', 'Execution frequency'] },
    { text: 'What is your strategy for regression testing in a fast-moving codebase?', keyCompetency: 'Regression Testing', evaluationCriteria: ['Test selection', 'Impact analysis', 'CI integration'] },
    { text: 'How do you handle flaky tests in CI and what steps do you take to eliminate them?', keyCompetency: 'Test Reliability', evaluationCriteria: ['Root-cause analysis', 'Isolation techniques', 'Monitoring'] }
  ],
  'data scientist': [
    { text: 'Explain the bias-variance trade-off and how it affects model selection.', keyCompetency: 'ML Fundamentals', evaluationCriteria: ['Clear definitions', 'Practical implications', 'Mitigation strategies'] },
    { text: 'How do you handle imbalanced datasets in classification problems?', keyCompetency: 'Data Preprocessing', evaluationCriteria: ['Sampling techniques', 'Metric selection', 'Algorithmic approaches'] },
    { text: 'Describe your feature engineering process for a new ML project.', keyCompetency: 'Feature Engineering', evaluationCriteria: ['Exploration approach', 'Domain knowledge', 'Validation'] },
    { text: 'How do you deploy and monitor ML models in production?', keyCompetency: 'MLOps', evaluationCriteria: ['Serving infrastructure', 'Drift detection', 'Retraining pipeline'] }
  ],
  'product manager': [
    { text: 'How do you prioritize features when you have limited engineering resources?', keyCompetency: 'Prioritization', evaluationCriteria: ['Framework used', 'Stakeholder alignment', 'Data-driven decisions'] },
    { text: 'Describe how you define and measure success for a product feature.', keyCompetency: 'Metrics', evaluationCriteria: ['KPI selection', 'Measurement plan', 'Iteration approach'] },
    { text: 'How do you gather and synthesize user feedback into actionable requirements?', keyCompetency: 'User Research', evaluationCriteria: ['Research methods', 'Synthesis process', 'Requirement translation'] },
    { text: 'What is your approach to writing technical specifications that both engineers and stakeholders understand?', keyCompetency: 'Communication', evaluationCriteria: ['Document structure', 'Audience awareness', 'Completeness'] }
  ],
  'cloud engineer': [
    { text: 'Compare the major cloud providers (AWS, Azure, GCP) and when you would choose each.', keyCompetency: 'Cloud Platforms', evaluationCriteria: ['Service comparison', 'Pricing models', 'Vendor lock-in'] },
    { text: 'How do you design for high availability and disaster recovery in the cloud?', keyCompetency: 'Reliability', evaluationCriteria: ['Multi-AZ/region', 'Failover strategy', 'RTO/RPO'] },
    { text: 'Explain the shared responsibility model in cloud security.', keyCompetency: 'Cloud Security', evaluationCriteria: ['Provider vs customer scope', 'Practical implications', 'Compliance'] },
    { text: 'How do you manage and optimize cloud costs at scale?', keyCompetency: 'FinOps', evaluationCriteria: ['Cost monitoring', 'Right-sizing', 'Reserved vs spot instances'] }
  ]
};
// ─── Company-specific question overlays ────────────────────
const COMPANY_QUESTIONS = {
  google: [
    { text: 'How would you design a web crawler that indexes billions of pages?', category: 'problem_solving', keyCompetency: 'System Design', evaluationCriteria: ['URL frontier', 'Politeness/robots.txt', 'Deduplication', 'Distributed architecture'] },
    { text: 'Describe how you would approach an ambiguous, open-ended technical problem at scale.', category: 'behavioral', keyCompetency: 'Googleyness', evaluationCriteria: ['Structured thinking', 'Iterative refinement', 'Collaboration', 'Data-driven approach'] },
    { text: 'Explain how MapReduce works and when you would use it.', category: 'core_knowledge', keyCompetency: 'Distributed Computing', evaluationCriteria: ['Map phase', 'Shuffle & sort', 'Reduce phase', 'Use-case fit'] }
  ],
  amazon: [
    { text: 'Tell me about a time you had to make a decision that prioritized the customer above all else.', category: 'behavioral', keyCompetency: 'Customer Obsession', evaluationCriteria: ['Customer-first mindset', 'Trade-off awareness', 'Measurable outcome'] },
    { text: 'Describe a situation where you disagreed with your team but committed to the decision anyway.', category: 'behavioral', keyCompetency: 'Disagree and Commit', evaluationCriteria: ['Respectful challenge', 'Data backing', 'Follow-through'] },
    { text: 'How would you design a highly available order processing system?', category: 'problem_solving', keyCompetency: 'System Design', evaluationCriteria: ['Queue architecture', 'Idempotency', 'Failure handling', 'Scaling'] }
  ],
  meta: [
    { text: 'How would you design a news feed system that serves billions of users?', category: 'problem_solving', keyCompetency: 'System Design', evaluationCriteria: ['Fan-out approach', 'Ranking algorithm', 'Caching', 'Real-time updates'] },
    { text: 'Describe your approach to building software that moves fast without breaking things.', category: 'behavioral', keyCompetency: 'Move Fast', evaluationCriteria: ['Development velocity', 'Testing strategy', 'Risk management'] },
    { text: 'How do you balance building for impact vs. technical excellence?', category: 'scenario_based', keyCompetency: 'Impact Focus', evaluationCriteria: ['Prioritization', 'Trade-off analysis', 'Stakeholder alignment'] }
  ],
  microsoft: [
    { text: 'How would you design a real-time collaboration feature for a cloud productivity suite?', category: 'problem_solving', keyCompetency: 'System Design', evaluationCriteria: ['Conflict resolution', 'Real-time sync', 'Offline support', 'Scalability'] },
    { text: 'Tell me about a time you built something that made a meaningful impact on users.', category: 'behavioral', keyCompetency: 'Growth Mindset', evaluationCriteria: ['User empathy', 'Iteration', 'Measurable impact'] },
    { text: 'How do you approach inclusive design and accessibility in your work?', category: 'scenario_based', keyCompetency: 'Inclusive Design', evaluationCriteria: ['Accessibility standards', 'User diversity', 'Testing approach'] }
  ],
  apple: [
    { text: 'How do you ensure the highest quality in software you ship to users?', category: 'behavioral', keyCompetency: 'Attention to Detail', evaluationCriteria: ['Quality standards', 'Testing rigor', 'User experience focus'] },
    { text: 'Describe how you would optimize an application for both performance and battery life on mobile.', category: 'problem_solving', keyCompetency: 'Performance Optimization', evaluationCriteria: ['CPU optimization', 'Memory management', 'Background processing', 'Profiling'] },
    { text: 'How do you approach building intuitive user experiences?', category: 'scenario_based', keyCompetency: 'UX Sensibility', evaluationCriteria: ['User research', 'Simplicity', 'Iteration', 'Delight factors'] }
  ],
  netflix: [
    { text: 'How would you design a content recommendation engine that personalizes for millions of users?', category: 'problem_solving', keyCompetency: 'ML System Design', evaluationCriteria: ['Collaborative filtering', 'Feature engineering', 'A/B testing', 'Serving architecture'] },
    { text: 'Describe your understanding of the Netflix culture of freedom and responsibility.', category: 'behavioral', keyCompetency: 'Culture Fit', evaluationCriteria: ['Context not control', 'Judgment', 'Candor'] },
    { text: 'How would you build a system that can handle adaptive video streaming at global scale?', category: 'problem_solving', keyCompetency: 'Streaming Architecture', evaluationCriteria: ['CDN strategy', 'Adaptive bitrate', 'Buffer management', 'Global distribution'] }
  ],
  startup: [
    { text: 'How do you decide what to build first when resources are extremely limited?', category: 'scenario_based', keyCompetency: 'Prioritization', evaluationCriteria: ['MVP thinking', 'User validation', 'Speed vs quality', 'Impact estimation'] },
    { text: 'Tell me about a time you wore multiple hats to get something shipped.', category: 'behavioral', keyCompetency: 'Versatility', evaluationCriteria: ['Cross-functional work', 'Ownership', 'Resourcefulness'] },
    { text: 'How would you architect a product to handle 10x growth with minimal rework?', category: 'problem_solving', keyCompetency: 'Scalable Architecture', evaluationCriteria: ['Modular design', 'Horizontal scaling', 'Technical debt awareness'] }
  ]
};

// ─── Time limits by difficulty (seconds) ──────────────────
const TIME_LIMITS = {
  easy:   180,  // 3 minutes
  medium: 300,  // 5 minutes
  hard:   420   // 7 minutes
};
// ─── Difficulty distribution by experience ───────────────────
const DIFFICULTY_MIX = {
  junior:       { easy: 0.50, medium: 0.40, hard: 0.10 },
  mid:          { easy: 0.20, medium: 0.50, hard: 0.30 },
  senior:       { easy: 0.10, medium: 0.40, hard: 0.50 },
  lead:         { easy: 0.05, medium: 0.35, hard: 0.60 },
  principal:    { easy: 0.00, medium: 0.30, hard: 0.70 }
};

// ─── Category distribution by experience ─────────────────────
const CATEGORY_MIX = {
  junior:    { core_knowledge: 0.45, scenario_based: 0.15, problem_solving: 0.15, behavioral: 0.25 },
  mid:       { core_knowledge: 0.35, scenario_based: 0.20, problem_solving: 0.25, behavioral: 0.20 },
  senior:    { core_knowledge: 0.25, scenario_based: 0.20, problem_solving: 0.35, behavioral: 0.20 },
  lead:      { core_knowledge: 0.20, scenario_based: 0.25, problem_solving: 0.30, behavioral: 0.25 },
  principal: { core_knowledge: 0.15, scenario_based: 0.25, problem_solving: 0.35, behavioral: 0.25 }
};

const TOTAL_QUESTIONS = 10;

// ─── Helpers ─────────────────────────────────────────────────

/** Shuffle array in place (Fisher-Yates) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick `count` random items from `arr` without repeating */
function pickRandom(arr, count) {
  const shuffled = shuffle([...arr]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** Normalize role string for matching */
function normalizeRole(role) {
  return (role || '').toLowerCase().trim();
}

/** Map experience_level input to an internal key */
function normalizeExperience(level) {
  const map = {
    junior: 'junior', entry: 'junior', 'entry-level': 'junior', intern: 'junior',
    mid: 'mid', middle: 'mid', intermediate: 'mid', 'mid-level': 'mid',
    senior: 'senior', sr: 'senior',
    lead: 'lead', staff: 'lead', 'team lead': 'lead', manager: 'lead',
    principal: 'principal', architect: 'principal', distinguished: 'principal', fellow: 'principal'
  };
  return map[(level || '').toLowerCase().trim()] || 'mid';
}

/** Weighted random pick from { easy: 0.2, medium: 0.5, hard: 0.3 } */
function weightedPick(weights) {
  const r = Math.random();
  let cumulative = 0;
  for (const [key, w] of Object.entries(weights)) {
    cumulative += w;
    if (r <= cumulative) return key;
  }
  return 'medium';
}

/** Truncate a string to maxLen with ellipsis */
function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/** Build a structured question object */
function buildQuestion({ text, category, difficulty, keyCompetency, evaluationCriteria, expectedTopics, timerEnabled }) {
  return {
    _id: new mongoose.Types.ObjectId(),
    text,
    category,
    type: category,                       // backward-compat alias
    difficulty,
    keyCompetency: keyCompetency || '',
    evaluationCriteria: evaluationCriteria || [],
    expectedTopics: expectedTopics || [],
    timeLimit: timerEnabled ? (TIME_LIMITS[difficulty] || TIME_LIMITS.medium) : 0
  };
}

// ─── Main generator ─────────────────────────────────────────

/**
 * Generate a dynamic, structured set of interview questions.
 *
 * Returns structured JSON:
 * {
 *   questions: [
 *     {
 *       _id, text, category, type, difficulty,
 *       keyCompetency, evaluationCriteria, expectedTopics, timeLimit
 *     }, …
 *   ]
 * }
 *
 * @param {Object}  opts
 * @param {string}  opts.jobRole          - e.g. "Backend Developer"
 * @param {string}  opts.experienceLevel  - e.g. "senior"
 * @param {string}  [opts.jobDescription] - optional free-text JD
 * @param {string}  [opts.difficulty]      - 'easy'|'medium'|'hard'|'mixed' (default: 'mixed')
 * @param {string}  [opts.targetCompany]   - optional company name for company-specific Qs
 * @param {boolean} [opts.timerEnabled]    - if true, attach time limits per question
 * @param {number}  [opts.count]          - total questions (default 10)
 * @returns {{ questions: Array<Object> }}
 */
function generateQuestions({ jobRole, experienceLevel, jobDescription, difficulty = 'mixed', targetCompany = '', timerEnabled = false, count = TOTAL_QUESTIONS }) {
  const expKey = normalizeExperience(experienceLevel);
  const roleLower = normalizeRole(jobRole);
  const catMix = CATEGORY_MIX[expKey];

  // If a fixed difficulty is selected, override the mix
  let diffMix;
  if (difficulty && difficulty !== 'mixed') {
    // All questions use the chosen difficulty
    diffMix = { easy: 0, medium: 0, hard: 0, [difficulty]: 1 };
  } else {
    diffMix = DIFFICULTY_MIX[expKey];
  }

  const questions = [];
  const usedTexts = new Set();

  // ── 1. Role-specific questions (up to 30 % of total) ─────
  const roleBank = ROLE_QUESTIONS[roleLower] || [];
  const roleCount = Math.min(Math.ceil(count * 0.3), roleBank.length);
  const pickedRole = pickRandom(roleBank, roleCount);

  for (const rq of pickedRole) {
    questions.push(buildQuestion({
      text: rq.text,
      category: 'core_knowledge',
      difficulty: weightedPick(diffMix),
      keyCompetency: rq.keyCompetency,
      evaluationCriteria: rq.evaluationCriteria,
      expectedTopics: [jobRole],
      timerEnabled
    }));
    usedTexts.add(rq.text);
  }

  // ── 2. Guarantee at least one Q from each category ────────
  const requiredCategories = Object.keys(catMix);
  const coveredCategories = new Set(questions.map(q => q.category));

  for (const cat of requiredCategories) {
    if (coveredCategories.has(cat)) continue;
    const bank = QUESTION_BANK[cat];
    if (!bank) continue;

    // Pick one from the most appropriate difficulty
    const preferredDiff = weightedPick(diffMix);
    const pool = bank[preferredDiff] || bank.medium || Object.values(bank).flat();
    const available = (Array.isArray(pool) ? pool : []).filter(q => !usedTexts.has(q.text));
    if (available.length === 0) continue;

    const picked = available[Math.floor(Math.random() * available.length)];
    questions.push(buildQuestion({
      text: picked.text,
      category: cat,
      difficulty: preferredDiff,
      keyCompetency: picked.keyCompetency,
      evaluationCriteria: picked.evaluationCriteria,
      expectedTopics: [jobRole],
      timerEnabled
    }));
    usedTexts.add(picked.text);
    coveredCategories.add(cat);
  }

  // ── 3. Fill remaining slots from the general bank ─────────
  const remaining = count - questions.length;

  for (const category of requiredCategories) {
    const catCount = Math.max(0, Math.round(remaining * catMix[category]));
    const bank = QUESTION_BANK[category];
    if (!bank) continue;

    for (const diff of ['easy', 'medium', 'hard']) {
      const diffCount = Math.max(0, Math.round(catCount * diffMix[diff]));
      const pool = (bank[diff] || []).filter(q => !usedTexts.has(q.text));
      const selected = pickRandom(pool, diffCount);

      for (const sq of selected) {
        if (questions.length >= count) break;
        questions.push(buildQuestion({
          text: sq.text,
          category,
          difficulty: diff,
          keyCompetency: sq.keyCompetency,
          evaluationCriteria: sq.evaluationCriteria,
          expectedTopics: [jobRole],
          timerEnabled
        }));
        usedTexts.add(sq.text);
      }
    }
  }

  // ── 4. Pad if still under target ─────────────────────────
  if (questions.length < count) {
    const allPool = Object.entries(QUESTION_BANK)
      .flatMap(([cat, diffs]) =>
        Object.entries(diffs).flatMap(([diff, arr]) =>
          arr.filter(q => !usedTexts.has(q.text)).map(q => ({ ...q, _cat: cat, _diff: diff }))
        )
      );
    const extra = pickRandom(allPool, count - questions.length);
    for (const eq of extra) {
      questions.push(buildQuestion({
        text: eq.text,
        category: eq._cat,
        difficulty: eq._diff,
        keyCompetency: eq.keyCompetency,
        evaluationCriteria: eq.evaluationCriteria,
        expectedTopics: [jobRole],
        timerEnabled
      }));
      usedTexts.add(eq.text);
    }
  }

  // ── 5. JD-specific question (if job_description provided) ─
  if (jobDescription && jobDescription.trim().length > 0) {
    const jdQuestion = buildQuestion({
      text: `Based on this job description, explain how your experience aligns with the key requirements: "${truncate(jobDescription, 300)}"`,
      category: 'scenario_based',
      difficulty: 'medium',
      keyCompetency: 'Job Fit',
      evaluationCriteria: ['Requirement mapping', 'Experience relevance', 'Self-awareness'],
      expectedTopics: [jobRole, 'job fit'],
      timerEnabled
    });
    // Insert early (position 1) so it appears after the first intro question
    questions.splice(1, 0, jdQuestion);
    // Trim to respect the count limit
    questions.length = Math.min(questions.length, count);
  }

  // ── 6. Company-specific questions (Phase 9) ─────────────
  if (targetCompany && targetCompany.trim()) {
    const companyKey = targetCompany.toLowerCase().trim();
    const companyBank = COMPANY_QUESTIONS[companyKey] || [];
    const companyCount = Math.min(Math.ceil(count * 0.3), companyBank.length);
    if (companyCount > 0) {
      const pickedCompany = pickRandom(companyBank, companyCount);
      for (const cq of pickedCompany) {
        const cQuestion = buildQuestion({
          text: cq.text,
          category: cq.category || 'behavioral',
          difficulty: weightedPick(diffMix),
          keyCompetency: cq.keyCompetency,
          evaluationCriteria: cq.evaluationCriteria,
          expectedTopics: [jobRole, targetCompany],
          timerEnabled
        });
        // Insert company Qs early
        questions.splice(Math.min(2, questions.length), 0, cQuestion);
      }
      // Trim to respect count limit
      questions.length = Math.min(questions.length, count);
    }
  }

  // ── 7. Final shuffle (keep first question stable) ─────────
  const first = questions[0];
  const rest = shuffle(questions.slice(1));

  return { questions: [first, ...rest] };
}

module.exports = { generateQuestions, normalizeExperience, normalizeRole };
