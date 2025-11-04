# SLPMS 배포 가이드

이 문서는 SLPMS 프로젝트를 프로덕션 환경에 배포하는 방법을 안내합니다.

## 배포 옵션

### 옵션 1: Vercel (프론트엔드) + Railway (백엔드) - 권장

**장점:**
- 무료 티어 제공
- 자동 배포 (Git push 시 자동 배포)
- 간단한 설정

**단계:**

#### 1. 프론트엔드 배포 (Vercel)

1. [Vercel](https://vercel.com)에 가입
2. GitHub 리포지토리 연결
3. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://your-backend-url.railway.app/api
     ```

#### 2. 백엔드 배포 (Railway)

1. [Railway](https://railway.app)에 가입
2. GitHub 리포지토리 연결
3. 새 프로젝트 생성 → "Deploy from GitHub repo" 선택
4. 서비스 추가:
   - **PostgreSQL** 서비스 추가
   - **Node.js** 서비스 추가 (backend 폴더 선택)
5. 환경 변수 설정:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-production-secret-key
   JWT_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=production
   ```
6. 빌드 명령어:
   ```
   cd backend && npm install && npx prisma generate && npx prisma migrate deploy
   ```
7. 시작 명령어:
   ```
   cd backend && npm start
   ```

#### 3. 프론트엔드 API URL 업데이트

Vercel 환경 변수에서 백엔드 URL을 업데이트합니다.

---

### 옵션 2: Netlify (프론트엔드) + Render (백엔드)

**장점:**
- 무료 티어 제공
- 자동 배포

**단계:**

#### 1. 프론트엔드 배포 (Netlify)

1. [Netlify](https://netlify.com)에 가입
2. GitHub 리포지토리 연결
3. 빌드 설정:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Environment variables**:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
     ```

#### 2. 백엔드 배포 (Render)

1. [Render](https://render.com)에 가입
2. GitHub 리포지토리 연결
3. 새 **Web Service** 생성:
   - **Build Command**: `cd backend && npm install && npx prisma generate`
   - **Start Command**: `cd backend && npm start`
   - **Environment**:
     ```
     DATABASE_URL=your-postgresql-url
     JWT_SECRET=your-production-secret-key
     JWT_EXPIRES_IN=7d
     PORT=3001
     NODE_ENV=production
     ```
4. **PostgreSQL** 데이터베이스 추가

---

### 옵션 3: VPS에 전체 배포 (Ubuntu 서버)

**장점:**
- 완전한 제어
- 비용 효율적 (장기 사용 시)

**단계:**

1. **서버 준비**
   ```bash
   # Ubuntu 업데이트
   sudo apt update && sudo apt upgrade -y
   
   # Node.js 설치
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # PostgreSQL 설치
   sudo apt install -y postgresql postgresql-contrib
   
   # PM2 설치 (프로세스 관리)
   sudo npm install -g pm2
   ```

2. **데이터베이스 설정**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE slpms;
   CREATE USER slpms_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE slpms TO slpms_user;
   \q
   ```

3. **프로젝트 클론 및 빌드**
   ```bash
   git clone https://github.com/smsh73/SLPMS.git
   cd SLPMS
   
   # 백엔드 설정
   cd backend
   npm install
   cp .env.example .env
   # .env 파일 수정
   npx prisma generate
   npx prisma migrate deploy
   
   # 프론트엔드 빌드
   cd ../frontend
   npm install
   npm run build
   ```

4. **Nginx 설정** (프론트엔드 서빙)
   ```bash
   sudo apt install -y nginx
   
   # Nginx 설정 파일 생성
   sudo nano /etc/nginx/sites-available/slpms
   ```
   
   Nginx 설정:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # 프론트엔드
       location / {
           root /home/ubuntu/SLPMS/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # 백엔드 API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/slpms /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **PM2로 백엔드 실행**
   ```bash
   cd /home/ubuntu/SLPMS/backend
   pm2 start index.js --name slpms-backend
   pm2 startup
   pm2 save
   ```

---

## 프로덕션 빌드 명령어

### 프론트엔드 빌드

```bash
cd frontend
npm run build
```

빌드된 파일은 `frontend/dist` 디렉토리에 생성됩니다.

### 백엔드 준비

```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
```

---

## 환경 변수 설정

### 프론트엔드 (.env)

```
VITE_API_URL=https://your-backend-url.com/api
```

### 백엔드 (.env)

```
DATABASE_URL=postgresql://user:password@host:5432/slpms?schema=public
JWT_SECRET=your-very-secure-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
```

**중요**: 프로덕션에서는 `JWT_SECRET`을 강력한 랜덤 문자열로 변경하세요.

---

## 보안 체크리스트

- [ ] `JWT_SECRET`을 강력한 값으로 변경
- [ ] 데이터베이스 비밀번호를 강력하게 설정
- [ ] HTTPS 사용 (SSL 인증서 설정)
- [ ] CORS 설정 확인 (프론트엔드 도메인만 허용)
- [ ] 환경 변수에 민감한 정보 저장 (코드에 하드코딩 금지)
- [ ] 정기적인 백업 설정

---

## 자동 배포 설정

### GitHub Actions (선택사항)

`.github/workflows/deploy.yml` 파일을 생성하여 자동 배포를 설정할 수 있습니다.

---

## 문제 해결

### CORS 오류

백엔드 `index.js`에서 CORS 설정 확인:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend-domain.com',
  credentials: true
}));
```

### 데이터베이스 연결 오류

- 데이터베이스 URL 확인
- 방화벽 설정 확인
- 데이터베이스 서비스 실행 확인

### 빌드 오류

- Node.js 버전 확인 (18 이상)
- `npm install` 재실행
- 캐시 삭제: `rm -rf node_modules package-lock.json && npm install`

---

## 추천 배포 플랫폼 비교

| 플랫폼 | 프론트엔드 | 백엔드 | 데이터베이스 | 무료 티어 |
|--------|-----------|--------|-------------|----------|
| Vercel | ✅ | ❌ | ❌ | ✅ |
| Netlify | ✅ | ❌ | ❌ | ✅ |
| Railway | ✅ | ✅ | ✅ | ✅ |
| Render | ✅ | ✅ | ✅ | ✅ |
| Heroku | ✅ | ✅ | ❌ | ❌ |

**권장 조합**: Vercel (프론트엔드) + Railway (백엔드 + DB)

---

## 다음 단계

배포 후:
1. 도메인 연결 (선택사항)
2. SSL 인증서 설정 (HTTPS)
3. 모니터링 설정
4. 백업 정책 수립

