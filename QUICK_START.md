# SLPMS 빠른 시작 가이드

## 프로젝트 구조

```
SLPMS/
├── backend/          # Node.js 백엔드 (Express + Prisma + PostgreSQL)
├── frontend/         # React 프론트엔드 (Vite + Material-UI)
├── ARCHITECTURE.md   # 아키텍처 설계 문서
├── SETUP_GUIDE.md    # 상세 설정 가이드
├── IMPLEMENTATION_GUIDE.md  # 구현 가이드
└── README.md         # 프로젝트 개요
```

## 빠른 시작 (3단계)

### 1단계: 데이터베이스 설정

PostgreSQL 데이터베이스 생성:

```bash
psql -U postgres
CREATE DATABASE slpms;
\q
```

`backend/.env` 파일 생성 (DATABASE_URL 수정 필요):

```
DATABASE_URL="postgresql://사용자이름:비밀번호@localhost:5432/slpms?schema=public"
JWT_SECRET="slpms-secret-key-change-in-production-2024"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

Prisma 마이그레이션 실행:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 2단계: 백엔드 실행

```bash
cd backend
npm run dev
```

백엔드 서버: http://localhost:3001

### 3단계: 프론트엔드 실행

새 터미널에서:

```bash
cd frontend
# .env 파일 생성 (선택사항, 기본값 사용 가능)
echo 'VITE_API_URL=http://localhost:3001/api' > .env
npm run dev
```

프론트엔드 서버: http://localhost:5173

## 첫 사용자 생성

브라우저에서 http://localhost:5173 접속 → 회원가입 페이지에서 첫 사용자 생성

또는 API로 직접 생성:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "관리자"
  }'
```

## 주요 기능

### 구현 완료된 기능

1. **인증 시스템**
   - 이메일/비밀번호 회원가입
   - 로그인 (JWT 토큰)
   - 인증 상태 관리

2. **회의록 관리**
   - 회의록 CRUD
   - 회의록 목록 조회
   - 회의록 상세 조회

3. **업무 관리**
   - 업무 CRUD
   - 하위업무 생성
   - 업무 계층 구조 조회
   - 진행도 관리
   - 담당자 할당

4. **활동이력 관리**
   - 업무별 활동이력 조회
   - 활동이력 생성/수정/삭제

5. **조직도 관리**
   - 사용자 목록 조회
   - 조직 정보 관리

6. **프론트엔드 UI**
   - 로그인/회원가입 페이지
   - 대시보드
   - 회의록 목록 페이지
   - 업무 목록 페이지
   - 조직도 페이지

### 워크플로우 타입

- **TOP_DOWN**: 상향식 (한국 기업의 전형적인 업무 지시 방식)
- **PARALLEL**: 병렬 (동시 진행)
- **LINEAR**: 직렬 (순차 진행)
- **SEQUENTIAL**: 순차 (단계별 진행)
- **ITERATIVE**: 반복 (개선 및 수정)
- **AD_HOC**: 임시 (긴급 업무)
- **APPROVAL**: 승인 (승인 기반 업무)

## 다음 단계

기본 구조가 완성되었으므로 다음 기능들을 추가로 구현할 수 있습니다:

1. **회의록 상세 페이지**: 회의록 내용 보기 및 업무 생성
2. **업무 상세 페이지**: 업무 상세 정보, 하위업무, 활동이력 관리
3. **업무 생성/수정 폼**: 모달 또는 페이지로 업무 생성/수정
4. **회의록 생성/수정 폼**: 모달 또는 페이지로 회의록 생성/수정
5. **활동이력 작성**: 업무보고서 작성 기능
6. **조직도 시각화**: 조직 구조를 트리 형태로 표시
7. **필터링 및 검색**: 업무 필터링 및 검색 기능
8. **반응형 디자인 개선**: 모바일 환경 최적화

## 문제 해결

### PostgreSQL 연결 오류

- PostgreSQL 서비스 실행 확인: `pg_isready`
- 데이터베이스 이름 확인: `psql -l`
- 연결 정보 확인: `backend/.env` 파일의 `DATABASE_URL`

### 포트 충돌

- 백엔드 포트 변경: `backend/.env`의 `PORT`
- 프론트엔드 포트 변경: `vite.config.js`에서 설정

### Prisma 오류

- Prisma Client 재생성: `npx prisma generate`
- 마이그레이션 재실행: `npx prisma migrate reset` (주의: 데이터 삭제됨)

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 회의록
- `GET /api/meetings` - 회의록 목록
- `GET /api/meetings/:id` - 회의록 상세
- `POST /api/meetings` - 회의록 생성
- `PUT /api/meetings/:id` - 회의록 수정
- `DELETE /api/meetings/:id` - 회의록 삭제
- `POST /api/meetings/:id/tasks` - 회의록에서 업무 생성

### 업무
- `GET /api/tasks` - 업무 목록 (필터링 지원)
- `GET /api/tasks/:id` - 업무 상세
- `POST /api/tasks` - 업무 생성
- `PUT /api/tasks/:id` - 업무 수정
- `DELETE /api/tasks/:id` - 업무 삭제
- `POST /api/tasks/:id/subtasks` - 하위업무 생성
- `GET /api/tasks/:id/hierarchy` - 업무 계층 구조
- `PUT /api/tasks/:id/progress` - 진행도 업데이트

### 활동이력
- `GET /api/activities/tasks/:taskId` - 업무별 활동이력
- `POST /api/activities/tasks/:taskId` - 활동이력 생성
- `PUT /api/activities/:id` - 활동이력 수정
- `DELETE /api/activities/:id` - 활동이력 삭제

### 조직도
- `GET /api/organization` - 조직도 조회
- `GET /api/organization/users` - 사용자 목록
- `GET /api/organization/users/:userId/tasks` - 사용자별 담당 업무
- `POST /api/organization/users/:userId` - 조직 정보 저장

## 기술 스택

- **Backend**: Node.js, Express, Prisma, PostgreSQL, JWT
- **Frontend**: React, Vite, React Router, Material-UI, Axios
- **인증**: JWT (이메일/비밀번호)

## 개발 환경

- Node.js 18 이상
- PostgreSQL 14 이상
- npm 또는 yarn

