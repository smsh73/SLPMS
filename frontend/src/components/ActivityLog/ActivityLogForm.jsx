import { useState } from 'react';
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
} from '@mui/material';
import { activitiesAPI } from '../../services/api';

export default function ActivityLogForm({ open, onClose, taskId, activityId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    content: '',
    activityType: 'REPORT',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activityId) {
        await activitiesAPI.update(activityId, formData);
      } else {
        await activitiesAPI.create(taskId, formData);
      }
      onSuccess();
      setFormData({ content: '', activityType: 'REPORT' });
      onClose();
    } catch (error) {
      console.error('Save activity error:', error);
      setError(error.response?.data?.message || '활동이력 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ content: '', activityType: 'REPORT' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{activityId ? '활동이력 수정' : '활동이력 작성'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>활동 유형</InputLabel>
              <Select
                name="activityType"
                value={formData.activityType}
                onChange={handleChange}
                disabled={loading}
                label="활동 유형"
              >
                <MenuItem value="REPORT">업무보고서</MenuItem>
                <MenuItem value="COMMENT">댓글</MenuItem>
                <MenuItem value="STATUS_CHANGE">상태 변경</MenuItem>
              </Select>
            </FormControl>
            <TextField
              required
              fullWidth
              multiline
              rows={8}
              label="활동 내용"
              name="content"
              value={formData.content}
              onChange={handleChange}
              disabled={loading}
              placeholder="업무 진행 상황, 결과, 이슈 등을 상세히 기록해주세요."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
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

