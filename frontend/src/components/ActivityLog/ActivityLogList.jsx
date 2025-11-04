import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { activitiesAPI } from '../../services/api';
import { getActivityTypeLabel, formatRelativeTime } from '../../utils/helpers';
import ActivityLogForm from './ActivityLogForm';

export default function ActivityLogList({ taskId, activities, onUpdate }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editFormOpen, setEditFormOpen] = useState(false);

  const handleMenuOpen = (event, activity) => {
    setAnchorEl(event.currentTarget);
    setSelectedActivity(activity);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedActivity(null);
  };

  const handleEdit = () => {
    setEditFormOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 활동이력을 삭제하시겠습니까?')) {
      handleMenuClose();
      return;
    }

    try {
      await activitiesAPI.delete(selectedActivity.id);
      onUpdate();
    } catch (error) {
      console.error('Delete activity error:', error);
      alert('활동이력 삭제 중 오류가 발생했습니다.');
    } finally {
      handleMenuClose();
    }
  };

  const handleActivityUpdated = () => {
    setEditFormOpen(false);
    onUpdate();
  };

  if (!activities || activities.length === 0) {
    return (
      <Alert severity="info">활동이력이 없습니다. 첫 활동이력을 작성해보세요.</Alert>
    );
  }

  return (
    <Box>
      {activities.map((activity) => (
        <Card key={activity.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {activity.user?.name || '알 수 없음'}
                  </Typography>
                  <Chip
                    label={getActivityTypeLabel(activity.activityType)}
                    size="small"
                    color="primary"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatRelativeTime(activity.createdAt)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {activity.user?.organization?.department && (
                    <>{activity.user.organization.department} · </>
                  )}
                  {activity.user?.organization?.position && <>{activity.user.organization.position}</>}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, activity)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
              {activity.content}
            </Typography>
          </CardContent>
        </Card>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          수정
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          삭제
        </MenuItem>
      </Menu>

      {selectedActivity && (
        <ActivityLogForm
          open={editFormOpen}
          onClose={() => {
            setEditFormOpen(false);
            setSelectedActivity(null);
          }}
          taskId={taskId}
          activityId={selectedActivity?.id}
          onSuccess={handleActivityUpdated}
        />
      )}
    </Box>
  );
}

