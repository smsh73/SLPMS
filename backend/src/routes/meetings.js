const express = require('express');
const prisma = require('../../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateMeeting } = require('../utils/validation');

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 회의록 목록 조회
router.get('/', async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: { meetingDate: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    res.json({ meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: '회의록 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 회의록 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                subtasks: true,
                activities: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!meeting) {
      return res.status(404).json({ message: '회의록을 찾을 수 없습니다.' });
    }

    res.json({ meeting });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ message: '회의록 조회 중 오류가 발생했습니다.' });
  }
});

// 회의록 생성
router.post('/', validateMeeting, async (req, res) => {
  try {
    const { title, content, meetingDate } = req.body;

    const meeting = await prisma.meeting.create({
      data: {
        title,
        content,
        meetingDate: new Date(meetingDate),
        createdBy: req.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: '회의록이 생성되었습니다.',
      meeting,
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: '회의록 생성 중 오류가 발생했습니다.' });
  }
});

// 회의록 수정
router.put('/:id', validateMeeting, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, meetingDate } = req.body;

    // 회의록 존재 확인
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!existingMeeting) {
      return res.status(404).json({ message: '회의록을 찾을 수 없습니다.' });
    }

    // 권한 확인 (생성자만 수정 가능)
    if (existingMeeting.createdBy !== req.user.id) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        title,
        content,
        meetingDate: new Date(meetingDate),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: '회의록이 수정되었습니다.',
      meeting,
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ message: '회의록 수정 중 오류가 발생했습니다.' });
  }
});

// 회의록 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 회의록 존재 확인
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!existingMeeting) {
      return res.status(404).json({ message: '회의록을 찾을 수 없습니다.' });
    }

    // 권한 확인 (생성자만 삭제 가능)
    if (existingMeeting.createdBy !== req.user.id) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await prisma.meeting.delete({
      where: { id },
    });

    res.json({ message: '회의록이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ message: '회의록 삭제 중 오류가 발생했습니다.' });
  }
});

// 회의록에서 업무 생성
router.post('/:id/tasks', async (req, res) => {
  try {
    const { id: meetingId } = req.params;
    const {
      parentTaskId,
      title,
      description,
      assigneeId,
      dueDate,
      progress = 0,
      workflowType = 'TOP_DOWN',
      status = 'PENDING',
      priority = 'MEDIUM',
    } = req.body;

    // 회의록 존재 확인
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return res.status(404).json({ message: '회의록을 찾을 수 없습니다.' });
    }

    // parentTaskId가 있는 경우 상위 업무 존재 확인
    if (parentTaskId) {
      const parentTask = await prisma.task.findUnique({
        where: { id: parentTaskId },
      });

      if (!parentTask) {
        return res.status(404).json({ message: '상위 업무를 찾을 수 없습니다.' });
      }
    }

    // assigneeId가 있는 경우 사용자 존재 확인
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        return res.status(404).json({ message: '담당자를 찾을 수 없습니다.' });
      }
    }

    const task = await prisma.task.create({
      data: {
        meetingId,
        parentTaskId: parentTaskId || null,
        title,
        description,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        progress: parseInt(progress),
        workflowType,
        status,
        priority,
        createdBy: req.user.id,
      },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      message: '업무가 생성되었습니다.',
      task,
    });
  } catch (error) {
    console.error('Create task from meeting error:', error);
    res.status(500).json({ message: '업무 생성 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

