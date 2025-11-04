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
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { tasksAPI, activitiesAPI } from '../../services/api';
import {
  formatDateTime,
  getStatusLabel,
  getPriorityLabel,
  getPriorityColor,
  getProgressColor,
  getWorkflowTypeLabel,
  getActivityTypeLabel,
  formatRelativeTime,
} from '../../utils/helpers';
import TaskForm from './TaskForm';
import ActivityLogForm from '../ActivityLog/ActivityLogForm';
import ActivityLogList from '../ActivityLog/ActivityLogList';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [task, setTask] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [creatingSubtask, setCreatingSubtask] = useState(false);
  const [activityFormOpen, setActivityFormOpen] = useState(false);

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getById(id);
      setTask(response.data.task);
    } catch (error) {
      console.error('Load task error:', error);
      setError('업무를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 업무를 삭제하시겠습니까? 하위업무도 함께 삭제됩니다.')) {
      return;
    }

    try {
      await tasksAPI.delete(id);
      if (task?.meetingId) {
        navigate(`/meetings/${task.meetingId}`);
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Delete task error:', error);
      alert(error.response?.data?.message || '업무 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleProgressUpdate = async (newProgress) => {
    try {
      await tasksAPI.updateProgress(id, newProgress);
      loadTask();
    } catch (error) {
      console.error('Update progress error:', error);
      alert('진행도 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleTaskCreated = () => {
    loadTask();
    setTaskFormOpen(false);
  };

  const handleActivityCreated = () => {
    loadTask();
    setActivityFormOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !task) {
    return <Alert severity="error">{error || '업무를 찾을 수 없습니다.'}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => (task.meetingId ? navigate(`/meetings/${task.meetingId}`) : navigate('/tasks'))}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {task.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setCreatingSubtask(true);
            setEditingTaskId(null);
            setTaskFormOpen(true);
          }}
        >
          하위업무
        </Button>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => {
            setEditingTaskId(id);
            setCreatingSubtask(false);
            setTaskFormOpen(true);
          }}
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
              업무 정보
            </Typography>
            <Divider sx={{ my: 2 }} />
            {task.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {task.description}
                </Typography>
              </Box>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  상태
                </Typography>
                <Chip label={getStatusLabel(task.status)} sx={{ mt: 0.5 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  우선순위
                </Typography>
                <Chip
                  label={getPriorityLabel(task.priority)}
                  color={getPriorityColor(task.priority)}
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  워크플로우 타입
                </Typography>
                <Typography variant="body1">{getWorkflowTypeLabel(task.workflowType)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  담당자
                </Typography>
                <Typography variant="body1">{task.assignee?.name || '미할당'}</Typography>
              </Grid>
              {task.dueDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    마감일
                  </Typography>
                  <Typography variant="body1">{formatDateTime(task.dueDate)}</Typography>
                </Grid>
              )}
              {task.meeting && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    연결된 회의록
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => navigate(`/meetings/${task.meeting.id}`)}
                  >
                    {task.meeting.title}
                  </Button>
                </Grid>
              )}
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                진행도
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={task.progress}
                  color={getProgressColor(task.progress)}
                  sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                />
                <Typography variant="body1" sx={{ minWidth: 50 }}>
                  {task.progress}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {[0, 25, 50, 75, 100].map((progress) => (
                  <Button
                    key={progress}
                    size="small"
                    variant={task.progress === progress ? 'contained' : 'outlined'}
                    onClick={() => handleProgressUpdate(progress)}
                  >
                    {progress}%
                  </Button>
                ))}
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="활동이력" />
              <Tab label="하위업무" />
            </Tabs>
            <Divider />
            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">활동이력</Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setActivityFormOpen(true)}
                    >
                      활동이력 작성
                    </Button>
                  </Box>
                  <ActivityLogList taskId={id} activities={task.activities || []} onUpdate={loadTask} />
                </Box>
              )}
              {tabValue === 1 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">하위업무 ({task.subtasks?.length || 0})</Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setCreatingSubtask(true);
                        setEditingTaskId(null);
                        setTaskFormOpen(true);
                      }}
                    >
                      하위업무 생성
                    </Button>
                  </Box>
                  {task.subtasks && task.subtasks.length > 0 ? (
                    <Box>
                      {task.subtasks.map((subtask) => (
                        <Accordion key={subtask.id}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                                {subtask.title}
                              </Typography>
                              <Chip label={getStatusLabel(subtask.status)} size="small" />
                              <LinearProgress
                                variant="determinate"
                                value={subtask.progress}
                                sx={{ width: 100, height: 6 }}
                              />
                              <Typography variant="caption">{subtask.progress}%</Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box display="flex" gap={2} mb={2}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate(`/tasks/${subtask.id}`)}
                              >
                                상세보기
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => {
                                  setEditingTaskId(subtask.id);
                                  setCreatingSubtask(false);
                                  setTaskFormOpen(true);
                                }}
                              >
                                수정
                              </Button>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">하위업무가 없습니다.</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              생성 정보
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                생성자
              </Typography>
              <Typography variant="body1">{task.creator?.name || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                생성일시
              </Typography>
              <Typography variant="body1">{formatDateTime(task.createdAt)}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <TaskForm
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTaskId(null);
          setCreatingSubtask(false);
        }}
        taskId={editingTaskId}
        parentTaskId={creatingSubtask ? id : undefined}
        meetingId={task.meetingId}
        onSuccess={handleTaskCreated}
      />

      <ActivityLogForm
        open={activityFormOpen}
        onClose={() => setActivityFormOpen(false)}
        taskId={id}
        onSuccess={handleActivityCreated}
      />
    </Box>
  );
}

