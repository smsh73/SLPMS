# SLPMS 프로젝트 설정 가이드

이 문서는 SLPMS 프로젝트를 처음 설정하는 방법을 단계별로 안내합니다.

## 1단계: 프로젝트 디렉토리 구조 생성

프로젝트는 다음과 같은 구조로 구성됩니다:

```
SLPMS/
├── backend/          # Node.js 백엔드 서버
├── frontend/         # React 프론트엔드
└── docs/            # 프로젝트 문서
```

## 2단계: PostgreSQL 데이터베이스 설정

### 2.1 PostgreSQL 설치 확인

PostgreSQL이 설치되어 있는지 확인합니다:

```bash
psql --version
```

설치되어 있지 않다면 PostgreSQL을 설치합니다.

### 2.2 데이터베이스 생성

PostgreSQL에 접속하여 데이터베이스를 생성합니다:

```bash
psql -U postgres
```

PostgreSQL 프롬프트에서:

```sql
CREATE DATABASE slpms;
\q
```

### 2.3 데이터베이스 연결 정보 확인

다음 정보를 준비합니다:
- 호스트: localhost (기본값)
- 포트: 5432 (기본값)
- 데이터베이스 이름: slpms
- 사용자 이름: postgres (또는 설정한 사용자)
- 비밀번호: PostgreSQL 비밀번호

## 3단계: 백엔드 설정

### 3.1 백엔드 디렉토리 생성 및 초기화

```bash
mkdir backend
cd backend
npm init -y
```

### 3.2 필요한 패키지 설치

```bash
npm install express prisma @prisma/client bcryptjs jsonwebtoken cors dotenv
npm install -D nodemon @types/node typescript ts-node
```

### 3.3 환경 변수 파일 생성

`backend/.env` 파일을 생성하고 다음 내용을 입력합니다:

```
DATABASE_URL="postgresql://사용자이름:비밀번호@localhost:5432/slpms?schema=public"
JWT_SECRET="your-secret-key-here-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
```

**중요**: `JWT_SECRET`은 보안을 위해 강력한 랜덤 문자열로 변경해야 합니다.

### 3.4 Prisma 초기화

```bash
npx prisma init
```

이 명령어는 Prisma 스키마 파일을 생성합니다.

### 3.5 Prisma 스키마 작성

`backend/prisma/schema.prisma` 파일을 수정하여 데이터베이스 모델을 정의합니다.

### 3.6 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name init
```

이 명령어는 데이터베이스 테이블을 생성합니다.

## 4단계: 프론트엔드 설정

### 4.1 Vite를 사용한 React 프로젝트 생성

```bash
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### 4.2 필요한 패키지 설치

```bash
npm install react-router-dom axios
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

### 4.3 환경 변수 파일 생성

`frontend/.env` 파일을 생성하고 다음 내용을 입력합니다:

```
VITE_API_URL=http://localhost:3001/api
```

## 5단계: 개발 서버 실행

### 5.1 백엔드 서버 실행

터미널 1:

```bash
cd backend
npm run dev
```

백엔드 서버가 http://localhost:3001 에서 실행됩니다.

### 5.2 프론트엔드 개발 서버 실행

터미널 2:

```bash
cd frontend
npm run dev
```

프론트엔드 서버가 http://localhost:5173 에서 실행됩니다 (Vite 기본 포트).

## 6단계: 초기 사용자 생성

데이터베이스에 직접 사용자를 생성하거나, 회원가입 기능을 통해 첫 사용자를 생성합니다.

## 문제 해결

### PostgreSQL 연결 오류

- PostgreSQL 서비스가 실행 중인지 확인: `pg_isready`
- 데이터베이스 연결 정보가 올바른지 확인
- 방화벽 설정 확인

### 포트 충돌

- 백엔드 포트(3001) 또는 프론트엔드 포트(5173)가 이미 사용 중인 경우 `.env` 파일에서 포트를 변경합니다.

### Prisma 마이그레이션 오류

- 데이터베이스가 존재하는지 확인
- 연결 정보가 올바른지 확인
- 이전 마이그레이션 롤백이 필요한 경우: `npx prisma migrate reset`

## 다음 단계

설정이 완료되면 다음을 진행합니다:

1. 백엔드 API 엔드포인트 구현
2. 프론트엔드 컴포넌트 구현
3. 인증 시스템 구현
4. 회의록 관리 기능 구현
5. 업무 관리 기능 구현

각 단계별 상세 구현은 프로젝트 진행에 따라 추가됩니다.

