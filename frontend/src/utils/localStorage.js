// Simulated DB using browser localStorage (no backend needed)

const KEYS = {
  users:       'edutrack_users_v5',
  courses:     'edutrack_courses_v5',
  assignments: 'edutrack_assignments_v5',
  submissions: 'edutrack_submissions_v5',
  groups:      'edutrack_groups_v5',
};

const seed = {
  users: [
    { id: 'admin1',   name: 'Dr. Smith',     role: 'admin',   email: 'dr.smith@edu.com',   password: 'pass' },
    { id: 'student1', name: 'Alice Johnson', role: 'student', email: 'alice@edu.com',       password: 'pass' },
    { id: 'student2', name: 'Bob Williams',  role: 'student', email: 'bob@edu.com',         password: 'pass' },
    { id: 'student3', name: 'Charlie Davis', role: 'student', email: 'charlie@edu.com',     password: 'pass' },
  ],
  courses: [
    { id: 'course1', name: 'Web Development',       code: 'CS301', adminId: 'admin1', semester: 'Spring 2026', color: 'indigo'  },
    { id: 'course2', name: 'UI/UX Design Principles', code: 'DES201', adminId: 'admin1', semester: 'Spring 2026', color: 'violet'  },
    { id: 'course3', name: 'Database Systems',       code: 'CS401', adminId: 'admin1', semester: 'Spring 2026', color: 'sky'     },
  ],
  assignments: [
    {
      id: 'assign1', title: 'Frontend React Task', createdBy: 'admin1', courseId: 'course1',
      description: 'Build a responsive dashboard using React and Tailwind CSS. Include at least 3 interactive components and a mobile-friendly layout.',
      driveLink: 'https://drive.google.com/drive/u/1/folders/1uGyveVGB90LI1CFyu-YMGDWSScPGVhct',
      submissionType: 'Individual',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'assign2', title: 'UI/UX Design Mockup', createdBy: 'admin1', courseId: 'course2',
      description: 'Create a Figma mockup for the new mobile app interface. Include at least 5 screens with proper navigation flow and design system.',
      driveLink: 'https://drive.google.com/drive/u/1/folders/1uGyveVGB90LI1CFyu-YMGDWSScPGVhct',
      submissionType: 'Group',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'assign3', title: 'Database Schema Design', createdBy: 'admin1', courseId: 'course3',
      description: 'Design a normalized Postgres database schema for the e-commerce platform. Include ER diagram and at least 6 tables with proper relationships.',
      driveLink: 'https://drive.google.com/drive/u/1/folders/1uGyveVGB90LI1CFyu-YMGDWSScPGVhct',
      submissionType: 'Individual',
      dueDate: new Date(Date.now() - 86400000 * 1).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
      id: 'assign4', title: 'API Integration Project', createdBy: 'admin1', courseId: 'course1',
      description: 'Connect the frontend with our new GraphQL endpoint and display live user data. Use Apollo Client and implement proper error handling and loading states.',
      driveLink: 'https://drive.google.com/drive/u/1/folders/1uGyveVGB90LI1CFyu-YMGDWSScPGVhct',
      submissionType: 'Group',
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'assign5', title: 'Responsive Landing Page', createdBy: 'admin1', courseId: 'course1',
      description: 'Build a pixel-perfect, fully responsive landing page from the provided Figma design. Focus on animations and micro-interactions.',
      driveLink: 'https://drive.google.com/drive/u/1/folders/1uGyveVGB90LI1CFyu-YMGDWSScPGVhct',
      submissionType: 'Individual',
      dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'assign6', title: 'User Research Report', createdBy: 'admin1', courseId: 'course2',
      description: 'Conduct user interviews (at least 5) and compile a research report. Include insights, personas, and design recommendations.',
      driveLink: '',
      submissionType: 'Group',
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
  submissions: [
    { id: 'sub1', assignmentId: 'assign1', studentId: 'student1', status: 'submitted', acknowledged: true,  acknowledgedAt: new Date().toISOString(), acknowledgedBy: 'student1', driveLink: '' },
    { id: 'sub2', assignmentId: 'assign3', studentId: 'student2', status: 'submitted', acknowledged: true,  acknowledgedAt: new Date(Date.now() - 86400000 * 2).toISOString(), acknowledgedBy: 'student2', driveLink: '' },
    { id: 'sub3', assignmentId: 'assign3', studentId: 'student3', status: 'submitted', acknowledged: true,  acknowledgedAt: new Date(Date.now() - 86400000 * 6).toISOString(), acknowledgedBy: 'student3', driveLink: '' },
  ],
  groups: [
    { id: 'grp1', courseId: 'course2', name: 'Design Titans', leaderId: 'student1', memberIds: ['student1', 'student2'] },
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

// ── USERS ──────────────────────────────────────────────────────────────
export const getUsers = () => get(KEYS.users);

// ── COURSES ────────────────────────────────────────────────────────────
export const getCourses          = ()       => get(KEYS.courses);
export const getCourseById       = (id)     => getCourses().find(c => c.id === id);
export const getCoursesByAdmin   = (adminId)=> getCourses().filter(c => c.adminId === adminId);
// All students are enrolled in every course (simplified model)
export const getStudentCourses   = ()       => getCourses();

// ── ASSIGNMENTS ────────────────────────────────────────────────────────
export const getAssignments           = ()          => get(KEYS.assignments);
export const getAssignmentById        = (id)        => getAssignments().find(a => a.id === id);
export const getAssignmentsByAdmin    = (adminId)   => getAssignments().filter(a => a.createdBy === adminId);
export const getAssignmentsByCourse   = (courseId)  => getAssignments().filter(a => a.courseId === courseId);

export const saveAssignment = (assignment) => set(KEYS.assignments, [...getAssignments(), assignment]);

export const updateAssignment = (updated) => {
  const all = getAssignments();
  const idx = all.findIndex(a => a.id === updated.id);
  if (idx >= 0) all[idx] = updated;
  set(KEYS.assignments, all);
};

export const deleteAssignment = (id) => {
  set(KEYS.assignments, getAssignments().filter(a => a.id !== id));
  set(KEYS.submissions, getSubmissions().filter(s => s.assignmentId !== id));
};

// ── SUBMISSIONS ────────────────────────────────────────────────────────
export const getSubmissions              = ()             => get(KEYS.submissions);
export const getStudentSubmissions       = (studentId)    => getSubmissions().filter(s => s.studentId === studentId);
export const getAssignmentSubmissions    = (assignmentId) => getSubmissions().filter(s => s.assignmentId === assignmentId);

export const saveSubmission = (submission) => {
  const all = getSubmissions();
  const idx = all.findIndex(s => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId);
  idx >= 0 ? (all[idx] = submission) : all.push(submission);
  set(KEYS.submissions, all);
};

// When group leader acknowledges → all group members get an acknowledged submission
export const acknowledgeForGroup = ({ assignmentId, memberIds, leaderId }) => {
  const now = new Date().toISOString();
  memberIds.forEach(memberId => {
    const newSub = {
      id: `sub_${Date.now()}_${memberId}`,
      assignmentId,
      studentId: memberId,
      driveLink: '',
      status: 'submitted',
      acknowledged: true,
      acknowledgedAt: now,
      acknowledgedBy: leaderId,
    };
    saveSubmission(newSub);
  });
};

// ── GROUPS ─────────────────────────────────────────────────────────────
export const getGroups                = ()            => get(KEYS.groups);
export const getGroupById             = (id)          => getGroups().find(g => g.id === id);
export const getGroupsByCourse        = (courseId)    => getGroups().filter(g => g.courseId === courseId);
export const getGroupByStudentAndCourse = (studentId, courseId) =>
  getGroups().find(g => g.courseId === courseId && g.memberIds.includes(studentId));

export const saveGroup = (group) => {
  const all = getGroups();
  const idx = all.findIndex(g => g.id === group.id);
  idx >= 0 ? (all[idx] = group) : all.push(group);
  set(KEYS.groups, all);
};

export const deleteGroup = (id) => set(KEYS.groups, getGroups().filter(g => g.id !== id));

// ── RESET ──────────────────────────────────────────────────────────────
export const resetData = () => {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  initializeData();
};
