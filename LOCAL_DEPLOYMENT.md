# 로컬 배포 가이드

이 문서는 SLPMS를 로컬 환경에 프로덕션 모드로 배포하는 방법을 안내합니다.

## 사전 준비

1. **PostgreSQL 데이터베이스 설정**
   - PostgreSQL이 설치되어 있어야 합니다
   - 데이터베이스가 생성되어 있어야 합니다

2. **환경 변수 설정**
   - `backend/.env` 파일이 필요합니다
   - `frontend/.env` 파일이 필요합니다 (선택사항)

## 빠른 배포 (자동 스크립트)

### 방법 1: 배포 스크립트 사용

```bash
# 스크립트에 실행 권한 부여
chmod +x scripts/deploy-local.sh

# 배포 실행
./scripts/deploy-local.sh
```

이 스크립트는 다음을 수행합니다:
1. 프론트엔드 빌드
2. 빌드된 파일을 백엔드로 복사
3. 백엔드 의존성 설치 및 Prisma 준비

### 방법 2: 수동 배포

#### 1단계: 프론트엔드 빌드

```bash
cd frontend
npm install
npm run build
```

빌드된 파일은 `frontend/dist` 디렉토리에 생성됩니다.

#### 2단계: 백엔드 준비

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

#### 3단계: 빌드된 파일 복사

```bash
# 프로젝트 루트에서
mkdir -p backend/public
cp -r frontend/dist/* backend/public/
```

#### 4단계: 백엔드 서버 실행

```bash
cd backend
NODE_ENV=production npm start
```

서버가 http://localhost:3001 에서 실행됩니다.

브라우저에서 http://localhost:3001 접속하면 애플리케이션이 실행됩니다.

## PM2를 사용한 프로덕션 실행

PM2를 사용하면 더 안정적으로 서버를 실행할 수 있습니다.

### PM2 설치

```bash
npm install -g pm2
```

### PM2로 서버 실행

```bash
cd backend
NODE_ENV=production pm2 start index.js --name slpms
```

### PM2 명령어

```bash
# 서버 상태 확인
pm2 status

# 로그 확인
pm2 logs slpms

# 서버 재시작
pm2 restart slpms

# 서버 중지
pm2 stop slpms

# 서버 삭제
pm2 delete slpms

# 시스템 재부팅 시 자동 시작
pm2 startup
pm2 save
```

## 환경 변수 설정

### backend/.env

```env
DATABASE_URL="postgresql://사용자이름:비밀번호@localhost:5432/slpms?schema=public"
JWT_SECRET="your-production-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3001
```

### frontend/.env (개발 시에만 필요, 빌드 시에는 VITE_API_URL 사용)

```env
VITE_API_URL=http://localhost:3001/api
```

## 빌드 확인

프로덕션 빌드가 제대로 되었는지 확인:

```bash
# 프론트엔드 빌드 확인
ls -la frontend/dist/

# 백엔드 public 디렉토리 확인
ls -la backend/public/
```

## 문제 해결

### 빌드 오류

```bash
# node_modules 삭제 후 재설치
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend
npm install
npm run build
```

### 데이터베이스 연결 오류

- PostgreSQL 서비스가 실행 중인지 확인: `pg_isready`
- `DATABASE_URL` 환경 변수가 올바른지 확인
- 데이터베이스가 존재하는지 확인

### 포트 충돌

- 다른 프로세스가 3001 포트를 사용 중인지 확인: `lsof -i :3001`
- `.env` 파일에서 포트 변경

### 정적 파일이 서빙되지 않는 경우

- `backend/public` 디렉토리에 파일이 있는지 확인
- `NODE_ENV=production`으로 설정되어 있는지 확인

## 개발 모드 vs 프로덕션 모드

### 개발 모드

```bash
# 백엔드
cd backend
npm run dev

# 프론트엔드 (새 터미널)
cd frontend
npm run dev
```

- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:3001

### 프로덕션 모드

```bash
# 배포 후
cd backend
NODE_ENV=production npm start
```

- 전체 애플리케이션: http://localhost:3001

## 업데이트

코드를 수정한 후 다시 배포하려면:

```bash
# 배포 스크립트 재실행
./scripts/deploy-local.sh

# 또는 수동으로
cd frontend && npm run build
cp -r frontend/dist/* backend/public/
cd backend && NODE_ENV=production pm2 restart slpms
```

## 성능 최적화

프로덕션 모드에서는:
- 프론트엔드 파일이 최적화되어 빌드됩니다
- 코드가 압축(minify)됩니다
- 불필요한 코드가 제거됩니다
- 정적 파일이 캐싱됩니다

## 보안 체크리스트

- [ ] `JWT_SECRET`을 강력한 값으로 변경
- [ ] 데이터베이스 비밀번호를 강력하게 설정
- [ ] `NODE_ENV=production`으로 설정
- [ ] 환경 변수에 민감한 정보 저장 (코드에 하드코딩 금지)

