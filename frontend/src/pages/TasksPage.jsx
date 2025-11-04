import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Assignment as TaskIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { tasksAPI } from '../services/api';
import {
  getStatusLabel,
  getPriorityLabel,
  getPriorityColor,
  getProgressColor,
} from '../utils/helpers';
import TaskForm from '../components/Task/TaskForm';

export default function TasksPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const response = await tasksAPI.getAll(params);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Tasks load error:', error);
      setError('업무 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">업무</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          업무 생성
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="업무 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>상태 필터</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="상태 필터"
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="PENDING">대기 중</MenuItem>
              <MenuItem value="IN_PROGRESS">진행 중</MenuItem>
              <MenuItem value="COMPLETED">완료</MenuItem>
              <MenuItem value="CANCELLED">취소</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>우선순위 필터</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              label="우선순위 필터"
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="LOW">낮음</MenuItem>
              <MenuItem value="MEDIUM">보통</MenuItem>
              <MenuItem value="HIGH">높음</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {filteredTasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchTerm || statusFilter || priorityFilter
              ? '검색 결과가 없습니다.'
              : '업무가 없습니다.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>제목</TableCell>
                <TableCell>담당자</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>우선순위</TableCell>
                <TableCell>진행도</TableCell>
                <TableCell>하위업무</TableCell>
                <TableCell>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      {task.parentTaskId && (
                        <TaskIcon fontSize="small" color="action" />
                      )}
                      {task.title}
                    </Box>
                  </TableCell>
                  <TableCell>{task.assignee?.name || '-'}</TableCell>
                  <TableCell>
                    <Chip label={getStatusLabel(task.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPriorityLabel(task.priority)}
                      size="small"
                      color={getPriorityColor(task.priority)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
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
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task._count?.subtasks || 0}
                      size="small"
                      color="info"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={loadTasks}
      />
    </Box>
  );
}

