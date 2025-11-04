const express = require('express');
const prisma = require('../../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateTask } = require('../utils/validation');

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 업무 목록 조회 (필터링 지원)
router.get('/', async (req, res) => {
  try {
    const { 
      meetingId, 
      assigneeId, 
      status, 
      workflowType, 
      priority,
      parentTaskId 
    } = req.query;

    const where = {};
    
    if (meetingId) where.meetingId = meetingId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;
    if (workflowType) where.workflowType = workflowType;
    if (priority) where.priority = priority;
    if (parentTaskId === 'null' || parentTaskId === null) {
      where.parentTaskId = null;
    } else if (parentTaskId) {
      where.parentTaskId = parentTaskId;
    }

    const tasks = await prisma.task.findMany({
      where,
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
        _count: {
          select: {
            subtasks: true,
            activities: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: '업무 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 업무 상세 조회 (하위업무 포함)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            meetingDate: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            organization: {
              select: {
                department: true,
                position: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
          },
        },
        subtasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                subtasks: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: '업무 조회 중 오류가 발생했습니다.' });
  }
});

// 업무 생성
router.post('/', validateTask, async (req, res) => {
  try {
    const {
      meetingId,
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

    // meetingId가 있는 경우 회의록 존재 확인
    if (meetingId) {
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
      });

      if (!meeting) {
        return res.status(404).json({ message: '회의록을 찾을 수 없습니다.' });
      }
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
        meetingId: meetingId || null,
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
    console.error('Create task error:', error);
    res.status(500).json({ message: '업무 생성 중 오류가 발생했습니다.' });
  }
});

// 업무 수정
router.put('/:id', validateTask, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assigneeId,
      dueDate,
      progress,
      workflowType,
      status,
      priority,
    } = req.body;

    // 업무 존재 확인
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }

    // 권한 확인 (생성자 또는 담당자만 수정 가능)
    if (existingTask.createdBy !== req.user.id && existingTask.assigneeId !== req.user.id) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    // assigneeId가 변경되는 경우 사용자 존재 확인
    if (assigneeId && assigneeId !== existingTask.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        return res.status(404).json({ message: '담당자를 찾을 수 없습니다.' });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (progress !== undefined) updateData.progress = parseInt(progress);
    if (workflowType !== undefined) updateData.workflowType = workflowType;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
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
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    res.json({
      message: '업무가 수정되었습니다.',
      task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: '업무 수정 중 오류가 발생했습니다.' });
  }
});

// 업무 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 업무 존재 확인
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        subtasks: {
          select: { id: true },
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }

    // 권한 확인 (생성자만 삭제 가능)
    if (existingTask.createdBy !== req.user.id) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    // 하위업무가 있는 경우 확인
    if (existingTask.subtasks && existingTask.subtasks.length > 0) {
      return res.status(400).json({ 
        message: '하위업무가 있는 업무는 삭제할 수 없습니다. 먼저 하위업무를 삭제해주세요.' 
      });
    }

    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: '업무가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: '업무 삭제 중 오류가 발생했습니다.' });
  }
});

// 하위업무 생성
router.post('/:id/subtasks', validateTask, async (req, res) => {
  try {
    const { id: parentTaskId } = req.params;

    // 상위 업무 존재 확인
    const parentTask = await prisma.task.findUnique({
      where: { id: parentTaskId },
    });

    if (!parentTask) {
      return res.status(404).json({ message: '상위 업무를 찾을 수 없습니다.' });
    }

    // 상위 업무의 meetingId를 자동으로 상속
    const {
      title,
      description,
      assigneeId,
      dueDate,
      progress = 0,
      workflowType = parentTask.workflowType,
      status = 'PENDING',
      priority = parentTask.priority,
    } = req.body;

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
        meetingId: parentTask.meetingId,
        parentTaskId,
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
      message: '하위업무가 생성되었습니다.',
      task,
    });
  } catch (error) {
    console.error('Create subtask error:', error);
    res.status(500).json({ message: '하위업무 생성 중 오류가 발생했습니다.' });
  }
});

// 업무 계층 구조 조회
router.get('/:id/hierarchy', async (req, res) => {
  try {
    const { id } = req.params;

    const getTaskHierarchy = async (taskId) => {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
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
          subtasks: {
            select: {
              id: true,
              title: true,
              status: true,
              progress: true,
            },
          },
        },
      });

      if (!task) return null;

      const hierarchy = {
        ...task,
        children: [],
      };

      // 하위업무 재귀적으로 조회
      for (const subtask of task.subtasks) {
        const childHierarchy = await getTaskHierarchy(subtask.id);
        if (childHierarchy) {
          hierarchy.children.push(childHierarchy);
        }
      }

      return hierarchy;
    };

    const hierarchy = await getTaskHierarchy(id);

    if (!hierarchy) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }

    res.json({ hierarchy });
  } catch (error) {
    console.error('Get task hierarchy error:', error);
    res.status(500).json({ message: '업무 계층 구조 조회 중 오류가 발생했습니다.' });
  }
});

// 진행도 업데이트
router.put('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ message: '진행도는 0-100 사이의 숫자여야 합니다.' });
    }

    // 업무 존재 확인
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }

    // 권한 확인 (생성자 또는 담당자만 수정 가능)
    if (existingTask.createdBy !== req.user.id && existingTask.assigneeId !== req.user.id) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        progress: parseInt(progress),
        status: progress === 100 ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : 'PENDING',
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: '진행도가 업데이트되었습니다.',
      task,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: '진행도 업데이트 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

