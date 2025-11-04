import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  MeetingRoom as MeetingRoomIcon,
  Assignment as TaskIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { meetingsAPI, tasksAPI } from '../services/api';
import { formatDate } from '../utils/helpers';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    meetings: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
  });
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, tasksRes] = await Promise.all([
        meetingsAPI.getAll(),
        tasksAPI.getAll(),
      ]);

      const meetings = meetingsRes.data.meetings || [];
      const tasks = tasksRes.data.tasks || [];

      const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
      const pendingTasks = tasks.filter((t) => t.status === 'PENDING').length;
      const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

      setStats({
        meetings: meetings.length,
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        inProgressTasks,
      });

      setRecentMeetings(meetings.slice(0, 5));
      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error('Dashboard data load error:', error);
      setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        대시보드
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* 통계 카드 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    회의록
                  </Typography>
                  <Typography variant="h4">{stats.meetings}</Typography>
                </Box>
                <MeetingRoomIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    전체 업무
                  </Typography>
                  <Typography variant="h4">{stats.totalTasks}</Typography>
                </Box>
                <TaskIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    완료된 업무
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.completedTasks}
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    진행 중 업무
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.inProgressTasks}
                  </Typography>
                </Box>
                <PendingIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 최근 회의록 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              최근 회의록
            </Typography>
            {recentMeetings.length === 0 ? (
              <Typography color="text.secondary">회의록이 없습니다.</Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {recentMeetings.map((meeting) => (
                  <Box
                    key={meeting.id}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {meeting.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(meeting.meetingDate)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 최근 업무 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              최근 업무
            </Typography>
            {recentTasks.length === 0 ? (
              <Typography color="text.secondary">업무가 없습니다.</Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {recentTasks.map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      진행도: {task.progress}% | 상태: {task.status}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

