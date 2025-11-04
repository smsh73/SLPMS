# SLPMS (Slack-like Project Management System)

한국 기업의 업무 공유 및 지시 방식을 지원하는 워크플로우 관리 시스템

## 기술 스택

- **Backend**: Node.js + Express + PostgreSQL (Prisma)
- **Frontend**: React + Vite
- **인증**: JWT (이메일/비밀번호)

## 빠른 시작

### 1. 사전 요구사항

- Node.js 18 이상
- PostgreSQL 14 이상
- npm 또는 yarn

### 2. 데이터베이스 설정

```bash
# PostgreSQL 데이터베이스 생성
psql -U postgres
CREATE DATABASE slpms;
\q
```

### 3. 환경 변수 설정

`backend/.env` 파일 생성:

```env
DATABASE_URL="postgresql://사용자이름:비밀번호@localhost:5432/slpms?schema=public"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. 개발 모드 실행

#### 백엔드

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

#### 프론트엔드 (새 터미널)

```bash
cd frontend
npm install
npm run dev
```

- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:3001

### 5. 로컬 프로덕션 배포

#### 자동 배포

```bash
# 배포 스크립트 실행
./scripts/deploy-local.sh

# 서버 시작
./scripts/start-local.sh
```

#### 수동 배포

```bash
# 프론트엔드 빌드
cd frontend
npm run build

# 빌드된 파일 복사
mkdir -p ../backend/public
cp -r dist/* ../backend/public/

# 백엔드 실행
cd ../backend
NODE_ENV=production npm start
```

- 전체 애플리케이션: http://localhost:3001

## 주요 기능

- ✅ 회의록 관리
- ✅ 업무(작업) 생성 및 하위업무 관리
- ✅ Due Date 및 진행도 관리
- ✅ 활동이력(업무보고서) 입력
- ✅ 조직도 기반 담당자 할당
- ✅ 7가지 워크플로우 타입 지원

## 워크플로우 타입

- **TOP_DOWN**: 상향식 (한국 기업의 전형적인 업무 지시 방식)
- **PARALLEL**: 병렬 (동시 진행)
- **LINEAR**: 직렬 (순차 진행)
- **SEQUENTIAL**: 순차 (단계별 진행)
- **ITERATIVE**: 반복 (개선 및 수정)
- **AD_HOC**: 임시 (긴급 업무)
- **APPROVAL**: 승인 (승인 기반 업무)

## 프로젝트 구조

```
SLPMS/
├── backend/          # Node.js 백엔드
├── frontend/         # React 프론트엔드
├── scripts/         # 배포 스크립트
└── docs/           # 문서
```

## 문서

- [QUICK_START.md](QUICK_START.md) - 빠른 시작 가이드
- [LOCAL_DEPLOYMENT.md](LOCAL_DEPLOYMENT.md) - 로컬 배포 가이드
- [DEPLOYMENT.md](DEPLOYMENT.md) - 프로덕션 배포 가이드
- [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) - 빠른 배포 가이드
- [ARCHITECTURE.md](ARCHITECTURE.md) - 아키텍처 설계 문서

## 배포

### 로컬 배포

```bash
./scripts/deploy-local.sh
./scripts/start-local.sh
```

### 클라우드 배포

- **Vercel + Railway** (권장): [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) 참고
- **기타 옵션**: [DEPLOYMENT.md](DEPLOYMENT.md) 참고

## 라이선스

ISC
