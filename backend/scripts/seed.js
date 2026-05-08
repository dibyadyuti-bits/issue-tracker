const axios = require('axios');

const API_BASE = 'http://localhost:5050/api/v1';

const users = [
  { name: 'Arjun Sharma', email: 'arjun@tracker.com', password: 'password123', role: 'admin' },
  { name: 'Rohan Patel', email: 'rohan@tracker.com', password: 'password123', role: 'user' },
  { name: 'Vikram Iyer', email: 'vikram@tracker.com', password: 'password123', role: 'user' },
  { name: 'Neha Gupta', email: 'neha@tracker.com', password: 'password123', role: 'user' },
  { name: 'Priya Nair', email: 'priya@tracker.com', password: 'password123', role: 'admin' },
];

const issues = [
  { title: 'Login page responsive bug', description: 'The login form breaks on mobile screens smaller than 375px.', status: 'open', priority: 'high', category: 'UI/UX', tags: ['frontend', 'mobile'], dueDate: new Date(Date.now() + 3 * 86400000).toISOString() },
  { title: 'Database connection pool exhausted', description: 'Under high load the auth service runs out of DB connections.', status: 'in-progress', priority: 'critical', category: 'Backend', tags: ['database', 'performance'], dueDate: new Date(Date.now() + 1 * 86400000).toISOString() },
  { title: 'Add dark mode support', description: 'Users have requested a dark theme for the dashboard.', status: 'open', priority: 'low', category: 'Feature', tags: ['frontend', 'design'], dueDate: new Date(Date.now() + 14 * 86400000).toISOString() },
  { title: 'Email notifications failing', description: 'SMTP credentials expired, need to rotate keys.', status: 'resolved', priority: 'medium', category: 'DevOps', tags: ['email', 'config'], dueDate: new Date(Date.now() - 2 * 86400000).toISOString() },
  { title: 'Update API documentation', description: 'Swagger docs are out of sync with the latest endpoints.', status: 'closed', priority: 'low', category: 'Docs', tags: ['documentation'], dueDate: new Date(Date.now() - 7 * 86400000).toISOString() },
  { title: 'Memory leak in comment service', description: 'Heap usage grows over time and eventually triggers OOM.', status: 'in-progress', priority: 'high', category: 'Backend', tags: ['memory', 'bug'], dueDate: new Date(Date.now() + 2 * 86400000).toISOString() },
  { title: 'Implement OAuth2 login', description: 'Add Google and GitHub SSO options for faster onboarding.', status: 'open', priority: 'medium', category: 'Feature', tags: ['auth', 'oauth'], dueDate: new Date(Date.now() + 21 * 86400000).toISOString() },
  { title: 'CI pipeline timeout', description: 'Build step exceeds 10 minutes due to slow test execution.', status: 'open', priority: 'medium', category: 'DevOps', tags: ['ci', 'performance'], dueDate: new Date(Date.now() + 5 * 86400000).toISOString() },
  { title: 'User profile image upload', description: 'Allow users to upload avatar images to S3 bucket.', status: 'resolved', priority: 'low', category: 'Feature', tags: ['frontend', 'storage'], dueDate: new Date(Date.now() - 4 * 86400000).toISOString() },
  { title: 'Security audit findings', description: 'Remediate findings from the Q2 penetration test.', status: 'in-progress', priority: 'critical', category: 'Security', tags: ['security', 'compliance'], dueDate: new Date(Date.now() + 7 * 86400000).toISOString() },
  { title: 'Redesign landing page', description: 'Refresh the marketing site with new branding.', status: 'closed', priority: 'medium', category: 'UI/UX', tags: ['frontend', 'design'], dueDate: new Date(Date.now() - 10 * 86400000).toISOString() },
  { title: 'Cache Redis invalidation bug', description: 'Stale data persists in cache after issue updates.', status: 'open', priority: 'high', category: 'Backend', tags: ['cache', 'redis'], dueDate: new Date(Date.now() + 4 * 86400000).toISOString() },
];

const comments = [
  'Looking into this now.',
  'I can reproduce on Safari as well.',
  'Fixed in commit 4d4929f.',
  'Need more info from the reporter.',
  'Assigning to backend team.',
  'Deployed to staging, please verify.',
  'This is a known limitation of the current architecture.',
  'Working on a patch.',
  'Verified fixed in production.',
  'Documentation updated accordingly.',
];

async function registerUser(user) {
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, user);
    console.log(`Registered: ${user.email} (role: ${user.role})`);
    return { email: user.email, password: user.password, id: res.data.user?.id, ...res.data };
  } catch (err) {
    if (err.response?.data?.message === 'User already exists') {
      console.log(`Already exists: ${user.email}`);
      return { email: user.email, password: user.password };
    }
    throw err;
  }
}

async function loginUser(email, password) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return { token: res.data.token, user: res.data.user };
}

async function createIssue(issue, token) {
  const res = await axios.post(`${API_BASE}/issues`, issue, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
}

async function createComment(issueId, text, token) {
  await axios.post(`${API_BASE}/comments/issue/${issueId}`, { text }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

async function seed() {
  console.log('Seeding users...');
  const userRecords = [];
  for (const u of users) {
    userRecords.push(await registerUser(u));
  }

  const tokens = {};
  const userIds = {};
  for (const u of userRecords) {
    const loginRes = await loginUser(u.email, u.password);
    tokens[u.email] = loginRes.token;
    userIds[u.email] = loginRes.user?.id;
    console.log(`  Logged in: ${u.email} (id: ${userIds[u.email]})`);
  }

  console.log('Seeding issues...');
  const createdIssues = [];
  for (let i = 0; i < issues.length; i++) {
    const owner = users[i % users.length];
    const assignee = users[(i + 1) % users.length];

    const issueData = {
      ...issues[i],
      assignedToId: userIds[assignee.email]
    };

    const created = await createIssue(issueData, tokens[owner.email]);
    createdIssues.push(created);
    console.log(`  Created issue: ${created.title}`);
  }

  console.log('Seeding comments...');
  for (const issue of createdIssues) {
    const numComments = Math.floor(Math.random() * 3) + 1;
    for (let c = 0; c < numComments; c++) {
      const commenter = users[Math.floor(Math.random() * users.length)];
      const text = comments[Math.floor(Math.random() * comments.length)];
      await createComment(issue.id, text, tokens[commenter.email]);
    }
  }

  console.log('');
  console.log('Done!');
  console.log(`Users:      ${users.length}`);
  console.log(`Issues:     ${createdIssues.length}`);
  console.log(`Comments:   ~${createdIssues.length * 2}`);
  console.log('');
  console.log('Login credentials:');
  for (const u of users) {
    console.log(`  ${u.email} / ${u.password} (${u.role})`);
  }
}

seed().catch(err => {
  console.error('Seed failed:', err.response?.data || err.message);
  process.exit(1);
});
