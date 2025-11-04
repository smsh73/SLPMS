#!/bin/bash

echo "=========================================="
echo "SLPMS 로컬 배포 시작"
echo "=========================================="

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
  echo "오류: backend/.env 파일이 없습니다."
  echo "backend/.env.example을 참고하여 .env 파일을 생성하세요."
  exit 1
fi

# Build frontend
echo ""
echo "1단계: 프론트엔드 빌드 중..."
cd frontend

if [ ! -d "node_modules" ]; then
  echo "프론트엔드 의존성 설치 중..."
  npm install
fi

echo "프론트엔드 빌드 중..."
npm run build

if [ $? -ne 0 ]; then
  echo "프론트엔드 빌드 실패!"
  exit 1
fi

echo "프론트엔드 빌드 완료!"

# Copy built files to backend/public
cd ..
echo ""
echo "2단계: 빌드된 파일을 백엔드로 복사 중..."
mkdir -p backend/public
cp -r frontend/dist/* backend/public/

# Prepare backend
echo ""
echo "3단계: 백엔드 준비 중..."
cd backend

if [ ! -d "node_modules" ]; then
  echo "백엔드 의존성 설치 중..."
  npm install
fi

# Generate Prisma client
echo "Prisma Client 생성 중..."
npx prisma generate

# Run migrations
echo "데이터베이스 마이그레이션 실행 중..."
npx prisma migrate deploy

cd ..

echo ""
echo "=========================================="
echo "로컬 배포 준비 완료!"
echo "=========================================="
echo ""
echo "백엔드 서버를 시작하려면:"
echo "  cd backend"
echo "  NODE_ENV=production npm start"
echo ""
echo "또는 PM2를 사용하여:"
echo "  cd backend"
echo "  NODE_ENV=production pm2 start index.js --name slpms"
echo ""

