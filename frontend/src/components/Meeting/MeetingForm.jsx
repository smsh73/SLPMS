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
} from '@mui/material';
import { meetingsAPI } from '../../services/api';

export default function MeetingForm({ open, onClose, meetingId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    meetingDate: '',
  });

  useEffect(() => {
    if (open) {
      if (meetingId) {
        loadMeeting();
      } else {
        // 새 회의록 생성 시 현재 날짜/시간을 기본값으로 설정
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setFormData({
          title: '',
          content: '',
          meetingDate: localDateTime,
        });
      }
      setError('');
    }
  }, [open, meetingId]);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const response = await meetingsAPI.getById(meetingId);
      const meeting = response.data.meeting;
      const localDateTime = new Date(new Date(meeting.meetingDate).getTime() - new Date(meeting.meetingDate).getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFormData({
        title: meeting.title,
        content: meeting.content || '',
        meetingDate: localDateTime,
      });
    } catch (error) {
      console.error('Load meeting error:', error);
      setError('회의록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (meetingId) {
        await meetingsAPI.update(meetingId, formData);
      } else {
        await meetingsAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save meeting error:', error);
      setError(error.response?.data?.message || '회의록 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{meetingId ? '회의록 수정' : '회의록 생성'}</DialogTitle>
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
              label="회의 제목"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              required
              fullWidth
              label="회의 일시"
              name="meetingDate"
              type="datetime-local"
              value={formData.meetingDate}
              onChange={handleChange}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              multiline
              rows={6}
              label="회의 내용"
              name="content"
              value={formData.content}
              onChange={handleChange}
              disabled={loading}
            />
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

