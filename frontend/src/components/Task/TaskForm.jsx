import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { tasksAPI, organizationAPI } from '../../services/api';

export default function TaskForm({ open, onClose, taskId, meetingId, parentTaskId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: null,
    dueDate: '',
    progress: 0,
    workflowType: 'TOP_DOWN',
    status: 'PENDING',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    if (open) {
      loadUsers();
      if (taskId) {
        loadTask();
      } else {
        // 새 업무 생성 시 기본값 설정
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const localDateTime = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setFormData({
          title: '',
          description: '',
          assigneeId: null,
          dueDate: localDateTime,
          progress: 0,
          workflowType: 'TOP_DOWN',
          status: 'PENDING',
          priority: 'MEDIUM',
        });
      }
      setError('');
    }
  }, [open, taskId]);

  const loadUsers = async () => {
    try {
      const response = await organizationAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getById(taskId);
      const task = response.data.task;
      const localDateTime = task.dueDate
        ? new Date(new Date(task.dueDate).getTime() - new Date(task.dueDate).getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        : '';
      setFormData({
        title: task.title,
        description: task.description || '',
        assigneeId: task.assigneeId || null,
        dueDate: localDateTime,
        progress: task.progress,
        workflowType: task.workflowType,
        status: task.status,
        priority: task.priority,
      });
    } catch (error) {
      console.error('Load task error:', error);
      setError('업무를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssigneeChange = (event, newValue) => {
    setFormData((prev) => ({ ...prev, assigneeId: newValue?.id || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        meetingId: meetingId || undefined,
        parentTaskId: parentTaskId || undefined,
        progress: parseInt(formData.progress),
      };

      if (taskId) {
        await tasksAPI.update(taskId, submitData);
      } else if (parentTaskId) {
        await tasksAPI.createSubtask(parentTaskId, submitData);
      } else {
        await tasksAPI.create(submitData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save task error:', error);
      setError(error.response?.data?.message || '업무 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find((u) => u.id === formData.assigneeId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{taskId ? '업무 수정' : parentTaskId ? '하위업무 생성' : '업무 생성'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              required
              fullWidth
              label="업무 제목"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="업무 설명"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Autocomplete
                fullWidth
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={selectedUser || null}
                onChange={handleAssigneeChange}
                disabled={loading}
                renderInput={(params) => (
                  <TextField {...params} label="담당자" />
                )}
              />
              <TextField
                fullWidth
                label="마감일"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>워크플로우 타입</InputLabel>
                <Select
                  name="workflowType"
                  value={formData.workflowType}
                  onChange={handleChange}
                  disabled={loading}
                  label="워크플로우 타입"
                >
                  <MenuItem value="TOP_DOWN">상향식</MenuItem>
                  <MenuItem value="PARALLEL">병렬</MenuItem>
                  <MenuItem value="LINEAR">직렬</MenuItem>
                  <MenuItem value="SEQUENTIAL">순차</MenuItem>
                  <MenuItem value="ITERATIVE">반복</MenuItem>
                  <MenuItem value="AD_HOC">임시</MenuItem>
                  <MenuItem value="APPROVAL">승인</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  label="상태"
                >
                  <MenuItem value="PENDING">대기 중</MenuItem>
                  <MenuItem value="IN_PROGRESS">진행 중</MenuItem>
                  <MenuItem value="COMPLETED">완료</MenuItem>
                  <MenuItem value="CANCELLED">취소</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={loading}
                  label="우선순위"
                >
                  <MenuItem value="LOW">낮음</MenuItem>
                  <MenuItem value="MEDIUM">보통</MenuItem>
                  <MenuItem value="HIGH">높음</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="진행도 (%)"
                name="progress"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={formData.progress}
                onChange={handleChange}
                disabled={loading}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

