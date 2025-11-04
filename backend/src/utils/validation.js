const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 회원가입 유효성 검사
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다.'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('이름을 입력해주세요.')
    .isLength({ max: 50 })
    .withMessage('이름은 50자 이하여야 합니다.'),
  handleValidationErrors,
];

// 로그인 유효성 검사
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.'),
  handleValidationErrors,
];

// 회의록 생성 유효성 검사
const validateMeeting = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('회의 제목을 입력해주세요.')
    .isLength({ max: 200 })
    .withMessage('제목은 200자 이하여야 합니다.'),
  body('meetingDate')
    .isISO8601()
    .withMessage('유효한 날짜 형식을 입력해주세요.'),
  handleValidationErrors,
];

// 업무 생성 유효성 검사
const validateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('업무 제목을 입력해주세요.')
    .isLength({ max: 200 })
    .withMessage('제목은 200자 이하여야 합니다.'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('유효한 날짜 형식을 입력해주세요.'),
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('진행도는 0-100 사이의 숫자여야 합니다.'),
  body('workflowType')
    .optional()
    .isIn(['TOP_DOWN', 'PARALLEL', 'LINEAR', 'SEQUENTIAL', 'ITERATIVE', 'AD_HOC', 'APPROVAL'])
    .withMessage('유효하지 않은 워크플로우 타입입니다.'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .withMessage('유효하지 않은 상태입니다.'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('유효하지 않은 우선순위입니다.'),
  handleValidationErrors,
];

// 활동이력 생성 유효성 검사
const validateActivity = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('활동 내용을 입력해주세요.'),
  body('activityType')
    .optional()
    .isIn(['REPORT', 'COMMENT', 'STATUS_CHANGE'])
    .withMessage('유효하지 않은 활동 유형입니다.'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateMeeting,
  validateTask,
  validateActivity,
};

