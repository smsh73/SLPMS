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
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon, Search as SearchIcon } from '@mui/icons-material';
import { meetingsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import MeetingForm from '../components/Meeting/MeetingForm';

export default function MeetingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingsAPI.getAll();
      setMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('Meetings load error:', error);
      setError('회의록 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (meeting.content && meeting.content.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <Typography variant="h4">회의록</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          회의록 생성
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="회의록 검색..."
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
      </Box>

      {filteredMeetings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchTerm ? '검색 결과가 없습니다.' : '회의록이 없습니다.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>제목</TableCell>
                <TableCell>회의 일시</TableCell>
                <TableCell>생성자</TableCell>
                <TableCell>연결된 업무</TableCell>
                <TableCell>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMeetings.map((meeting) => (
                <TableRow key={meeting.id} hover>
                  <TableCell
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {meeting.title}
                  </TableCell>
                  <TableCell>{formatDate(meeting.meetingDate)}</TableCell>
                  <TableCell>{meeting.creator?.name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={meeting._count?.tasks || 0}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
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

      <MeetingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={loadMeetings}
      />
    </Box>
  );
}

