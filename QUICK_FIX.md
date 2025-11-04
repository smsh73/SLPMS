# 빠른 문제 해결

## 서버가 시작되지 않는 경우

### 1단계: 환경 변수 파일 확인

```bash
cd backend
ls -la .env
```

`.env` 파일이 없다면:

```bash
# .env 파일 생성
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/slpms?schema=public"
JWT_SECRET="slpms-secret-key-change-in-production-2024"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3001
EOF
```

**중요**: `DATABASE_URL`을 실제 PostgreSQL 설정에 맞게 수정하세요!

### 2단계: 프론트엔드 빌드 확인

```bash
# 프로젝트 루트에서
ls -la backend/public/index.html
```

파일이 없다면:

```bash
cd frontend
npm install
npm run build
cd ..
mkdir -p backend/public
cp -r frontend/dist/* backend/public/
```

### 3단계: 서버 시작

#### 방법 1: 자동 스크립트 사용

```bash
./scripts/start-server.sh
```

#### 방법 2: 수동으로 시작

```bash
cd backend
NODE_ENV=production node index.js
```

#### 방법 3: npm 사용

```bash
cd backend
NODE_ENV=production npm start
```

### 4단계: 서버 실행 확인

새 터미널에서:

```bash
curl http://localhost:3001/health
```

다음과 같은 응답이 나와야 합니다:
```json
{"status":"ok","message":"SLPMS API is running"}
```

## 데이터베이스 연결 오류가 발생하는 경우

### PostgreSQL 서비스 확인

```bash
# macOS (Homebrew)
brew services list | grep postgresql

# PostgreSQL 실행 확인
pg_isready

# 수동으로 시작 (필요시)
brew services start postgresql
```

### 데이터베이스 생성

```bash
psql -U postgres
```

PostgreSQL 프롬프트에서:

```sql
CREATE DATABASE slpms;
\q
```

### Prisma 마이그레이션

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

## 자주 발생하는 오류

### 오류: "Cannot find module"

```bash
cd backend
npm install
```

### 오류: "Prisma Client not generated"

```bash
cd backend
npx prisma generate
```

### 오류: "Port 3001 already in use"

```bash
# 포트를 사용하는 프로세스 확인
lsof -i :3001

# 프로세스 종료 (PID를 확인한 후)
kill -9 <PID>
```

## 완전한 재시작

모든 것을 처음부터 다시 시작하려면:

```bash
# 1. 프론트엔드 빌드
cd frontend
npm install
npm run build
cd ..

# 2. 빌드 파일 복사
mkdir -p backend/public
cp -r frontend/dist/* backend/public/

# 3. 백엔드 준비
cd backend
npm install
npx prisma generate

# 4. 서버 시작
NODE_ENV=production node index.js
```

