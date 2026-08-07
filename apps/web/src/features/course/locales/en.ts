export default {
  pageTitle: 'Courses',
  searchPlaceholder: 'Search courses...',
  empty: 'No courses found.',
  columns: ['Name', 'Email', 'Phone', 'Status', 'Created At', 'Actions'],
  columnsDetail: ['Name', 'Email', 'Phone', 'Created At', 'Actions'],
  create: {
    title: 'Create Course',
    description: 'Fill in the details below to add a new course.',
    success: 'Course created successfully!',
  },
  edit: {
    title: 'Edit Course',
    description: 'Update the course information below.',
    success: 'Course updated successfully!',
    loadError: 'Failed to load course data',
  },
  detail: {
    title: 'Course Details',
    description: 'View the full information of the course.',
    loadError: 'Failed to load course details',
  },
  addStudent: {
    pageTitle: 'Add Students',
    pageDescription: 'Select students to enroll in this course.',
    availableTitle: 'Available Students',
    searchPlaceholder: 'Search students...',
    empty: 'No available students found.',
    selected: '{count} student(s) selected',
    success: 'Successfully added {count} student(s)!',
    error: 'Failed to add students',
  },
  enrolledStudents: {
    title: 'Enrolled Students',
    searchPlaceholder: 'Search students...',
    empty: 'No students found.',
  },
  classRules: {
    title: 'Class Rules',
    empty: 'No class rules found.',
  },
  form: {
    name: 'Name',
    namePlaceholder: 'Course name',
    status: 'Status',
    description: 'Description',
    descriptionPlaceholder: 'Course description...',
  },
  removeStudent: {
    title: 'Delete Enrollment',
    message: 'Are you sure you want to remove "{student}" from this course?',
    success: 'Student removed from course successfully!',
    error: 'Failed to remove student from course',
  },
  deleteRule: {
    title: 'Delete Class Rule',
    message:
      'Are you sure you want to delete this class rule? All future sessions will be removed.',
    success: 'Class rule deleted successfully!',
    error: 'Failed to delete class rule',
  },
  delete: {
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete "{course}"? This action cannot be undone.',
    success: 'Course deleted successfully!',
  },
};
