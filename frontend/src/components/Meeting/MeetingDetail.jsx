import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Card,
  CardContent,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { meetingsAPI, tasksAPI } from '../../services/api';
import { formatDateTime, getStatusLabel, getPriorityLabel, getPriorityColor, getProgressColor } from '../../utils/helpers';
import TaskForm from '../Task/TaskForm';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meeting, setMeeting] = useState(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  useEffect(() => {
    loadMeeting();
  }, [id]);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const response = await meetingsAPI.getById(id);
      setMeeting(response.data.meeting);
    } catch (error) {
      console.error('Load meeting error:', error);
      setError('회의록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 회의록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await meetingsAPI.delete(id);
      navigate('/meetings');
    } catch (error) {
      console.error('Delete meeting error:', error);
      alert(error.response?.data?.message || '회의록 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleTaskCreated = () => {
    loadMeeting();
    setTaskFormOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !meeting) {
    return <Alert severity="error">{error || '회의록을 찾을 수 없습니다.'}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/meetings')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {meeting.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setTaskFormOpen(true)}
        >
          업무 생성
        </Button>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/meetings/${id}/edit`)}
        >
          수정
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          삭제
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              회의 정보
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                회의 일시
              </Typography>
              <Typography variant="body1">{formatDateTime(meeting.meetingDate)}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                생성자
              </Typography>
              <Typography variant="body1">{meeting.creator?.name || '-'}</Typography>
            </Box>
            {meeting.content && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  회의 내용
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {meeting.content}
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              연결된 업무 ({meeting.tasks?.length || 0})
            </Typography>
            <Divider sx={{ my: 2 }} />
            {meeting.tasks && meeting.tasks.length > 0 ? (
              <Box>
                {meeting.tasks.map((task) => (
                  <Card
                    key={task.id}
                    sx={{ mb: 2, cursor: 'pointer' }}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                        <Typography variant="h6">{task.title}</Typography>
                        <Chip label={getStatusLabel(task.status)} size="small" />
                      </Box>
                      {task.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {task.description}
                        </Typography>
                      )}
                      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mt={2}>
                        {task.assignee && (
                          <Chip label={`담당자: ${task.assignee.name}`} size="small" />
                        )}
                        <Chip
                          label={getPriorityLabel(task.priority)}
                          size="small"
                          color={getPriorityColor(task.priority)}
                        />
                        <Box sx={{ flexGrow: 1, minWidth: 150 }}>
                          <LinearProgress
                            variant="determinate"
                            value={task.progress}
                            color={getProgressColor(task.progress)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {task.progress}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">연결된 업무가 없습니다.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              통계
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                전체 업무
              </Typography>
              <Typography variant="h5">{meeting.tasks?.length || 0}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                진행 중 업무
              </Typography>
              <Typography variant="h5" color="primary">
                {meeting.tasks?.filter((t) => t.status === 'IN_PROGRESS').length || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                완료된 업무
              </Typography>
              <Typography variant="h5" color="success.main">
                {meeting.tasks?.filter((t) => t.status === 'COMPLETED').length || 0}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <TaskForm
        open={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        meetingId={id}
        onSuccess={handleTaskCreated}
      />
    </Box>
  );
}

