# PostgreSQL 설치 및 설정 가이드 (macOS)

## 방법 1: Homebrew로 설치 (권장)

### 1단계: PostgreSQL 설치

```bash
# PostgreSQL 설치
brew install postgresql@14

# 또는 최신 버전
brew install postgresql
```

### 2단계: PostgreSQL 서비스 시작

```bash
# PostgreSQL 서비스 시작
brew services start postgresql@14

# 또는 최신 버전
brew services start postgresql
```

### 3단계: PostgreSQL 연결 확인

```bash
# PostgreSQL이 실행 중인지 확인
pg_isready

# 또는
psql -U postgres -c "SELECT version();"
```

## 방법 2: PostgreSQL.app 사용 (GUI)

1. [PostgreSQL.app](https://postgresapp.com/) 다운로드
2. 앱 설치 및 실행
3. 자동으로 PostgreSQL이 시작됩니다

## 데이터베이스 설정

### 1단계: PostgreSQL에 접속

```bash
# 기본 사용자로 접속
psql postgres

# 또는 특정 사용자로 접속
psql -U postgres
```

### 2단계: 데이터베이스 생성

PostgreSQL 프롬프트에서:

```sql
-- 데이터베이스 생성
CREATE DATABASE slpms;

-- 사용자 생성 (선택사항)
CREATE USER slpms_user WITH PASSWORD 'your_password';

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE slpms TO slpms_user;

-- 종료
\q
```

### 3단계: 환경 변수 설정

`backend/.env` 파일에서 `DATABASE_URL` 설정:

```env
# Homebrew로 설치한 경우 (기본 설정)
DATABASE_URL="postgresql://postgres@localhost:5432/slpms?schema=public"

# 또는 사용자와 비밀번호를 사용하는 경우
DATABASE_URL="postgresql://slpms_user:your_password@localhost:5432/slpms?schema=public"

# PostgreSQL.app을 사용하는 경우
DATABASE_URL="postgresql://localhost:5432/slpms?schema=public"
```

## PostgreSQL 명령어

### 서비스 관리

```bash
# PostgreSQL 시작
brew services start postgresql@14

# PostgreSQL 중지
brew services stop postgresql@14

# PostgreSQL 재시작
brew services restart postgresql@14

# 서비스 상태 확인
brew services list
```

### 연결 확인

```bash
# PostgreSQL이 실행 중인지 확인
pg_isready

# 버전 확인
psql --version

# 데이터베이스 목록 확인
psql -U postgres -l
```

### 데이터베이스 관리

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 목록 보기
\l

# 데이터베이스 선택
\c slpms

# 테이블 목록 보기
\dt

# 종료
\q
```

## 문제 해결

### 문제: "command not found: psql"

**해결**: PostgreSQL이 설치되지 않았습니다.

```bash
brew install postgresql@14
```

### 문제: "could not connect to server"

**해결**: PostgreSQL 서비스가 실행되지 않았습니다.

```bash
brew services start postgresql@14
```

### 문제: "password authentication failed"

**해결**: 비밀번호를 사용하지 않는 경우:

```env
# .env 파일에서 비밀번호 제거
DATABASE_URL="postgresql://postgres@localhost:5432/slpms?schema=public"
```

또는 비밀번호를 설정:

```bash
psql -U postgres
ALTER USER postgres WITH PASSWORD 'your_password';
```

### 문제: "database does not exist"

**해결**: 데이터베이스를 생성하세요.

```bash
psql -U postgres
CREATE DATABASE slpms;
\q
```

## 빠른 시작 (전체 과정)

```bash
# 1. PostgreSQL 설치
brew install postgresql@14

# 2. 서비스 시작
brew services start postgresql@14

# 3. 데이터베이스 생성
psql -U postgres -c "CREATE DATABASE slpms;"

# 4. 환경 변수 설정 (backend/.env)
echo 'DATABASE_URL="postgresql://postgres@localhost:5432/slpms?schema=public"' >> backend/.env

# 5. Prisma 마이그레이션
cd backend
npx prisma generate
npx prisma migrate deploy

# 6. 서버 시작
NODE_ENV=production node index.js
```

## 대안: SQLite 사용 (개발용)

PostgreSQL 설치가 어려운 경우, 개발 환경에서 SQLite를 사용할 수 있습니다.

### Prisma 스키마 수정

`backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### 환경 변수 설정

`backend/.env`:

```env
DATABASE_URL="file:./dev.db"
```

### 마이그레이션

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

**주의**: SQLite는 프로덕션 환경에는 권장되지 않습니다.

