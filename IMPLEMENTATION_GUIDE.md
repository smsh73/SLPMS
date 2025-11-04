# SLPMS 구현 가이드

이 문서는 SLPMS 프로젝트를 실제로 실행하고 사용하는 방법을 안내합니다.

## 1단계: 데이터베이스 설정

### PostgreSQL 설치 확인

PostgreSQL이 설치되어 있는지 확인합니다:

```bash
psql --version
```

설치되어 있지 않다면 PostgreSQL을 설치합니다.

### 데이터베이스 생성

PostgreSQL에 접속하여 데이터베이스를 생성합니다:

```bash
psql -U postgres
```

PostgreSQL 프롬프트에서:

```sql
CREATE DATABASE slpms;
\q
```

### 데이터베이스 연결 정보 수정

`backend/.env` 파일을 생성하고 다음 내용을 입력합니다:

```
DATABASE_URL="postgresql://사용자이름:비밀번호@localhost:5432/slpms?schema=public"
JWT_SECRET="slpms-secret-key-change-in-production-2024"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

**중요**: `DATABASE_URL`의 사용자이름과 비밀번호를 실제 PostgreSQL 설정에 맞게 수정하세요.

### Prisma 마이그레이션 실행

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

이 명령어는 데이터베이스 테이블을 생성합니다.

## 2단계: 백엔드 실행

```bash
cd backend
npm run dev
```

백엔드 서버가 http://localhost:3001 에서 실행됩니다.

## 3단계: 프론트엔드 실행

새 터미널에서:

```bash
cd frontend
npm run dev
```

프론트엔드 서버가 http://localhost:5173 에서 실행됩니다 (Vite 기본 포트).

### 프론트엔드 환경 변수 설정

`frontend/.env` 파일을 생성하고 다음 내용을 입력합니다:

```
VITE_API_URL=http://localhost:3001/api
```

## 4단계: 초기 사용자 생성

### 방법 1: API를 통한 회원가입

프론트엔드 회원가입 페이지를 통해 첫 사용자를 생성합니다.

또는 API를 직접 호출:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "관리자"
  }'
```

### 방법 2: Prisma Studio를 통한 데이터 확인

```bash
cd backend
npm run prisma:studio
```

Prisma Studio가 http://localhost:5555 에서 실행됩니다.

## 5단계: API 테스트

### 로그인

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

응답에서 `token`을 받아서 다음 API 호출에 사용합니다.

### 회의록 생성

```bash
curl -X POST http://localhost:3001/api/meetings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "주간 회의",
    "content": "이번 주 업무 진행 상황 공유",
    "meetingDate": "2024-01-15T10:00:00Z"
  }'
```

### 회의록에서 업무 생성

```bash
curl -X POST http://localhost:3001/api/meetings/MEETING_ID/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "프로젝트 계획 수립",
    "description": "프로젝트 일정 및 리소스 계획",
    "assigneeId": "USER_ID",
    "dueDate": "2024-01-20T18:00:00Z",
    "workflowType": "TOP_DOWN",
    "priority": "HIGH"
  }'
```

## 워크플로우 타입 설명

- **TOP_DOWN**: 상위 업무에서 하위 업무로의 하달 구조 (한국 기업의 전형적인 업무 지시 방식)
- **PARALLEL**: 동시에 진행되는 병렬 업무 (여러 팀이 동시에 작업)
- **LINEAR**: 순차적으로 진행되는 직렬 업무 (A 작업 완료 후 B 작업 시작)
- **SEQUENTIAL**: 순차적 단계별 진행 (단계별로 명확한 순서가 있는 업무)
- **ITERATIVE**: 반복적 개선 및 수정 (개발 프로세스 등)
- **AD_HOC**: 임시/즉석 업무 (계획되지 않은 긴급 업무)
- **APPROVAL**: 승인 기반 업무 (승인 절차가 필요한 업무)

## 주요 기능 사용법

### 회의록 관리

1. 회의록 생성: 회의록을 생성하면 해당 회의록과 연결된 업무를 생성할 수 있습니다.
2. 회의록에서 업무 생성: 회의록 상세 페이지에서 직접 업무를 생성할 수 있습니다.

### 업무 관리

1. 업무 생성: 회의록에서 생성하거나 독립적으로 생성할 수 있습니다.
2. 하위업무 생성: 상위 업무에서 하위업무를 생성하여 계층 구조를 만들 수 있습니다.
3. 진행도 관리: 업무의 진행도를 0-100%로 설정할 수 있습니다.
4. 담당자 할당: 조직도에서 사용자를 선택하여 담당자를 할당할 수 있습니다.

### 활동이력 관리

1. 업무보고서 작성: 업무별로 활동이력을 작성하여 진행 상황을 기록합니다.
2. 댓글 작성: 업무에 대한 댓글을 작성할 수 있습니다.
3. 상태 변경 기록: 업무 상태 변경 시 자동으로 기록됩니다.

## 문제 해결

### PostgreSQL 연결 오류

- PostgreSQL 서비스가 실행 중인지 확인: `pg_isready`
- 데이터베이스 연결 정보가 올바른지 확인
- 방화벽 설정 확인

### Prisma 마이그레이션 오류

- 데이터베이스가 존재하는지 확인
- 연결 정보가 올바른지 확인
- 이전 마이그레이션 롤백이 필요한 경우: `npx prisma migrate reset`

### 포트 충돌

- 백엔드 포트(3001) 또는 프론트엔드 포트(5173)가 이미 사용 중인 경우 `.env` 파일에서 포트를 변경합니다.

### CORS 오류

- 백엔드 `index.js`에서 CORS 설정이 올바른지 확인합니다.
- 프론트엔드 URL이 CORS 허용 목록에 포함되어 있는지 확인합니다.

## 다음 단계

백엔드 API가 완성되었으므로, 이제 프론트엔드 UI 구현을 진행합니다:

1. 인증 UI (로그인/회원가입)
2. 회의록 관리 UI
3. 업무 관리 UI
4. 활동이력 관리 UI
5. 조직도 UI

각 UI 구현은 별도로 진행됩니다.

