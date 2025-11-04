// 날짜 포맷팅
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 날짜와 시간 포맷팅
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 상대 시간 포맷팅 (예: 2시간 전)
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
};

// 워크플로우 타입 한글 변환
export const getWorkflowTypeLabel = (type) => {
  const labels = {
    TOP_DOWN: '상향식',
    PARALLEL: '병렬',
    LINEAR: '직렬',
    SEQUENTIAL: '순차',
    ITERATIVE: '반복',
    AD_HOC: '임시',
    APPROVAL: '승인',
  };
  return labels[type] || type;
};

// 상태 한글 변환
export const getStatusLabel = (status) => {
  const labels = {
    PENDING: '대기 중',
    IN_PROGRESS: '진행 중',
    COMPLETED: '완료',
    CANCELLED: '취소',
  };
  return labels[status] || status;
};

// 우선순위 한글 변환
export const getPriorityLabel = (priority) => {
  const labels = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
  };
  return labels[priority] || priority;
};

// 활동 유형 한글 변환
export const getActivityTypeLabel = (type) => {
  const labels = {
    REPORT: '업무보고서',
    COMMENT: '댓글',
    STATUS_CHANGE: '상태 변경',
  };
  return labels[type] || type;
};

// 상태 색상
export const getStatusColor = (status) => {
  const colors = {
    PENDING: 'default',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
  };
  return colors[status] || 'default';
};

// 우선순위 색상
export const getPriorityColor = (priority) => {
  const colors = {
    LOW: 'info',
    MEDIUM: 'warning',
    HIGH: 'error',
  };
  return colors[priority] || 'default';
};

// 진행도에 따른 색상
export const getProgressColor = (progress) => {
  if (progress === 100) return 'success';
  if (progress >= 50) return 'primary';
  if (progress > 0) return 'warning';
  return 'default';
};

