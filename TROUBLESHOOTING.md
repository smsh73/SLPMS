# 문제 해결 가이드

## 페이지가 로딩되지 않는 경우

### 1. 서버가 실행 중인지 확인

```bash
# 포트 3001이 사용 중인지 확인
lsof -i :3001

# 또는
netstat -an | grep 3001
```

서버가 실행되지 않았다면:

```bash
cd backend
NODE_ENV=production npm start
```

### 2. 빌드된 파일이 있는지 확인

```bash
ls -la backend/public/
```

파일이 없다면:

```bash
# 프론트엔드 빌드
cd frontend
npm run build

# 파일 복사
mkdir -p ../backend/public
cp -r dist/* ../backend/public/
```

### 3. 환경 변수 확인

```bash
# backend/.env 파일 확인
cat backend/.env
```

필수 환경 변수:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (기본값: 3001)
- `NODE_ENV=production`

### 4. 콘솔 에러 확인

브라우저 개발자 도구(F12)를 열고:
- Console 탭에서 에러 확인
- Network 탭에서 요청 상태 확인

### 5. 백엔드 로그 확인

서버를 실행한 터미널에서 에러 메시지 확인

## 일반적인 문제들

### 문제: "Cannot GET /"

**원인**: 정적 파일 경로가 잘못됨

**해결**:
```bash
# 빌드된 파일이 올바른 위치에 있는지 확인
ls -la backend/public/index.html
```

### 문제: "404 Not Found" for API calls

**원인**: API 경로가 올바르게 설정되지 않음

**해결**: `backend/index.js`에서 API 라우트가 올바르게 설정되어 있는지 확인

### 문제: CORS 오류

**원인**: CORS 설정 문제

**해결**: `backend/index.js`에서 CORS 설정 확인

### 문제: 데이터베이스 연결 오류

**원인**: DATABASE_URL이 올바르지 않음

**해결**:
```bash
# PostgreSQL 서비스 확인
pg_isready

# DATABASE_URL 확인
cat backend/.env | grep DATABASE_URL
```

### 문제: Prisma Client 오류

**원인**: Prisma Client가 생성되지 않음

**해결**:
```bash
cd backend
npx prisma generate
```

## 디버깅 모드

개발 모드로 실행하여 더 자세한 에러 확인:

```bash
# 백엔드 (개발 모드)
cd backend
npm run dev

# 프론트엔드 (새 터미널)
cd frontend
npm run dev
```

## 서버 재시작

```bash
# 프로세스 종료
pkill -f "node.*index.js"

# 또는 특정 포트 사용 중인 프로세스 종료
lsof -ti:3001 | xargs kill

# 서버 재시작
cd backend
NODE_ENV=production npm start
```

