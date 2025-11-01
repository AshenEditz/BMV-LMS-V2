// Date formatting
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Time formatting
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Badge expiry check
export const isBadgeValid = (badge) => {
  if (!badge.expiresAt) return true;
  return new Date(badge.expiresAt) > new Date();
};

// Grade validation
export const isValidGrade = (grade) => {
  const validGrades = ['6', '7', '8', '9', '10', '11', '12', '13'];
  return validGrades.includes(grade);
};

// Class validation
export const isValidClass = (classLetter) => {
  const validClasses = ['A', 'B', 'C', 'D'];
  return validClasses.includes(classLetter);
};

// Generate random color for avatars
export const generateAvatarColor = (name) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Sanitize user input
export const sanitizeInput = (input) => {
  return input.trim().replace(/<[^>]*>/g, '');
};

// Calculate quiz score
export const calculateQuizScore = (answers, questions) => {
  let correct = 0;
  questions.forEach((question, index) => {
    if (answers[index] === question.correctAnswer) {
      correct++;
    }
  });
  return Math.round((correct / questions.length) * 100);
};