// Simulated DB using browser localStorage (no backend needed)

const KEYS = {
  users: 'joineazy_users_v3',
  assignments: 'joineazy_assignments_v3',
  submissions: 'joineazy_submissions_v3',
};

const seed = {
  users: [
    { id: 'admin1',   name: 'Dr. Smith',     role: 'admin'   },
    { id: 'student1', name: 'Alice Johnson', role: 'student' },
    { id: 'student2', name: 'Bob Williams',  role: 'student' },
    { id: 'student3', name: 'Charlie Davis', role: 'student' },
  ],
  assignments: [
    {
      id: 'assign1', title: 'Frontend React Task', createdBy: 'admin1',
      description: 'Build a responsive dashboard using React and Tailwind CSS.',
      driveLink: 'https://drive.google.com/drive/u/1/folders/1uGyveVGB90LI1CFyu-YMGDWSScPGVhct',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'assign2', title: 'UI/UX Design Mockup', createdBy: 'admin1',
      description: 'Create a Figma mockup for the new mobile app interface.',
      driveLink: 'https://drive.google.com/drive/u/1/folders/1uGyveVGB90LI1CFyu-YMGDWSScPGVhct',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'assign3', title: 'Database Schema Design', createdBy: 'admin1',
      description: 'Design a normalized Postgres database schema for the e-commerce platform.',
      driveLink: 'https://drive.google.com/drive/u/1/folders/1uGyveVGB90LI1CFyu-YMGDWSScPGVhct',
      dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // Due yesterday
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), // Created 2 weeks ago
    },
    {
      id: 'assign4', title: 'API Integration Project', createdBy: 'admin1',
      description: 'Connect the frontend with our new GraphQL endpoint and display user data.',
      driveLink: 'https://drive.google.com/drive/u/1/folders/1uGyveVGB90LI1CFyu-YMGDWSScPGVhct',
      dueDate: new Date(Date.now() - 86400000 * 5).toISOString(), // Due 5 days ago
      createdAt: new Date(Date.now() - 86400000 * 21).toISOString(), // Created 3 weeks ago
    },
  ],
  submissions: [
    { id: 'sub1', assignmentId: 'assign1', studentId: 'student1', status: 'submitted', submittedAt: new Date().toISOString() },
    { id: 'sub2', assignmentId: 'assign3', studentId: 'student2', status: 'submitted', submittedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'sub3', assignmentId: 'assign4', studentId: 'student3', status: 'submitted', submittedAt: new Date(Date.now() - 86400000 * 6).toISOString() },
  ],
};

const get = (key) => JSON.parse(localStorage.getItem(key)) || [];
const set = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Seed data on first load
export const initializeData = () => {
  Object.entries(KEYS).forEach(([k, v]) => {
    if (!localStorage.getItem(v)) set(v, seed[k]);
  });
};

// Users
export const getUsers = () => get(KEYS.users);

// Assignments
export const getAssignments = () => get(KEYS.assignments);
export const getAssignmentById = (id) => getAssignments().find(a => a.id === id);
export const getAssignmentsByAdmin = (adminId) => getAssignments().filter(a => a.createdBy === adminId);
export const saveAssignment = (assignment) => set(KEYS.assignments, [...getAssignments(), assignment]);
export const deleteAssignment = (id) => {
  set(KEYS.assignments, getAssignments().filter(a => a.id !== id));
  // Cascade delete submissions
  set(KEYS.submissions, getSubmissions().filter(s => s.assignmentId !== id));
};
// Submissions
export const getSubmissions = () => get(KEYS.submissions);
export const getStudentSubmissions = (studentId) => getSubmissions().filter(s => s.studentId === studentId);
export const getAssignmentSubmissions = (assignmentId) => getSubmissions().filter(s => s.assignmentId === assignmentId);

export const saveSubmission = (submission) => {
  const all = getSubmissions();
  const idx = all.findIndex(s => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId);
  idx >= 0 ? (all[idx] = submission) : all.push(submission); // upsert
  set(KEYS.submissions, all);
};

// Wipe and re-seed (for demo resets)
export const resetData = () => {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  initializeData();
};
