const express = require('express');
const prisma = require('../../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateActivity } = require('../utils/validation');

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 업무별 활동이력 조회
router.get('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    // 업무 존재 확인
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }

    const activities = await prisma.activityLog.findMany({
      where: { taskId },
      include: {
        user: {
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
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ activities });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: '활동이력 조회 중 오류가 발생했습니다.' });
  }
});

// 활동이력 생성
router.post('/tasks/:taskId', validateActivity, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, activityType = 'REPORT' } = req.body;

    // 업무 존재 확인
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: '업무를 찾을 수 없습니다.' });
    }

    const activity = await prisma.activityLog.create({
      data: {
        taskId,
        userId: req.user.id,
        content,
        activityType,
      },
      include: {
        user: {
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
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      message: '활동이력이 생성되었습니다.',
      activity,
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: '활동이력 생성 중 오류가 발생했습니다.' });
  }
});

// 활동이력 수정
router.put('/:id', validateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // 활동이력 존재 확인
    const existingActivity = await prisma.activityLog.findUnique({
      where: { id },
    });

    if (!existingActivity) {
      return res.status(404).json({ message: '활동이력을 찾을 수 없습니다.' });
    }

    // 권한 확인 (작성자만 수정 가능)
    if (existingActivity.userId !== req.user.id) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    const activity = await prisma.activityLog.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      message: '활동이력이 수정되었습니다.',
      activity,
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ message: '활동이력 수정 중 오류가 발생했습니다.' });
  }
});

// 활동이력 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 활동이력 존재 확인
    const existingActivity = await prisma.activityLog.findUnique({
      where: { id },
    });

    if (!existingActivity) {
      return res.status(404).json({ message: '활동이력을 찾을 수 없습니다.' });
    }

    // 권한 확인 (작성자만 삭제 가능)
    if (existingActivity.userId !== req.user.id) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await prisma.activityLog.delete({
      where: { id },
    });

    res.json({ message: '활동이력이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: '활동이력 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

