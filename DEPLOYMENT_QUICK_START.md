# 빠른 배포 가이드

가장 간단한 방법으로 SLPMS를 배포하는 방법입니다.

## 5분 배포 (Vercel + Railway)

### 1단계: 백엔드 배포 (Railway) - 2분

1. [Railway](https://railway.app) 접속 → "Login" → "Start a New Project"
2. "Deploy from GitHub repo" 선택 → SLPMS 리포지토리 선택
3. "Add Service" → "PostgreSQL" 추가
4. "Add Service" → "GitHub Repo" → backend 폴더 선택
5. Node.js 서비스에서 "Settings" → "Root Directory"를 `backend`로 설정
6. "Variables" 탭에서 환경 변수 추가:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secret-key-here-change-this
   JWT_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=production
   ```
7. "Settings" → "Deploy" → "Build Command" 입력:
   ```
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
8. "Settings" → "Deploy" → "Start Command" 입력:
   ```
   npm start
   ```
9. 배포 완료 후 생성된 URL 복사 (예: `https://slpms-backend.railway.app`)

### 2단계: 프론트엔드 배포 (Vercel) - 2분

1. [Vercel](https://vercel.com) 접속 → "Sign Up" → GitHub으로 로그인
2. "Add New..." → "Project" → SLPMS 리포지토리 선택
3. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `dist` (기본값)
4. "Environment Variables" 추가:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
   (1단계에서 복사한 백엔드 URL 사용)
5. "Deploy" 클릭
6. 배포 완료 후 생성된 URL 확인 (예: `https://slpms.vercel.app`)

### 3단계: CORS 설정 업데이트 (1분)

Railway 백엔드 서비스의 환경 변수에 추가:
```
FRONTEND_URL=https://your-frontend-url.vercel.app
```

백엔드가 프론트엔드 요청을 허용하도록 설정됩니다.

## 완료!

이제 SLPMS가 배포되었습니다.

- 프론트엔드: `https://your-frontend-url.vercel.app`
- 백엔드: `https://your-backend-url.railway.app/api`

## 다음 단계

1. **도메인 연결** (선택사항)
   - Vercel: Settings → Domains에서 도메인 추가
   - Railway: Settings → Custom Domain에서 도메인 추가

2. **SSL 인증서**
   - Vercel과 Railway는 자동으로 HTTPS를 제공합니다

3. **첫 사용자 생성**
   - 배포된 프론트엔드에서 회원가입 페이지로 이동하여 첫 사용자 생성

## 문제 해결

### 백엔드가 작동하지 않는 경우
- Railway 로그 확인: 서비스 → "View Logs"
- 환경 변수 확인: `DATABASE_URL`이 올바른지 확인
- Prisma 마이그레이션 확인: `npx prisma migrate deploy` 실행 확인

### 프론트엔드가 API를 호출하지 못하는 경우
- 브라우저 콘솔에서 CORS 오류 확인
- `VITE_API_URL` 환경 변수가 올바른지 확인
- 백엔드 CORS 설정 확인

### 데이터베이스 연결 오류
- Railway PostgreSQL 서비스 상태 확인
- `DATABASE_URL` 환경 변수 확인
- Prisma 마이그레이션 실행 확인

## 비용

- **Vercel**: 무료 티어 (월 100GB 대역폭)
- **Railway**: 무료 티어 ($5 크레딧/월, 소규모 프로젝트 충분)

## 업데이트

코드를 수정하고 GitHub에 push하면 자동으로 재배포됩니다!

