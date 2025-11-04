const express = require('express');
const prisma = require('../../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 조직도 조회 (계층 구조)
router.get('/', async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        manager: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        subordinates: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { department: 'asc' },
        { position: 'asc' },
      ],
    });

    res.json({ organizations });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ message: '조직도 조회 중 오류가 발생했습니다.' });
  }
});

// 사용자 목록 조회
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        organization: {
          select: {
            department: true,
            position: true,
            managerId: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: '사용자 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 특정 사용자의 담당 업무 조회
router.get('/users/:userId/tasks', async (req, res) => {
  try {
    const { userId } = req.params;

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            meetingDate: true,
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
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ message: '담당 업무 조회 중 오류가 발생했습니다.' });
  }
});

// 조직 정보 생성/수정
router.post('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { department, position, managerId } = req.body;

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // managerId가 있는 경우 유효성 확인
    if (managerId) {
      const manager = await prisma.organization.findUnique({
        where: { userId: managerId },
      });

      if (!manager) {
        return res.status(404).json({ message: '상급자를 찾을 수 없습니다.' });
      }

      // 자기 자신을 상급자로 설정할 수 없음
      if (managerId === userId) {
        return res.status(400).json({ message: '자기 자신을 상급자로 설정할 수 없습니다.' });
      }
    }

    // 기존 조직 정보 확인
    const existingOrg = await prisma.organization.findUnique({
      where: { userId },
    });

    let organization;
    if (existingOrg) {
      // 업데이트
      organization = await prisma.organization.update({
        where: { userId },
        data: {
          department,
          position,
          managerId: managerId || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manager: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } else {
      // 생성
      organization = await prisma.organization.create({
        data: {
          userId,
          department,
          position,
          managerId: managerId || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manager: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    }

    res.json({
      message: '조직 정보가 저장되었습니다.',
      organization,
    });
  } catch (error) {
    console.error('Create/Update organization error:', error);
    res.status(500).json({ message: '조직 정보 저장 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

