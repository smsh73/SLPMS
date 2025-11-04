#!/bin/bash

echo "=========================================="
echo "SLPMS 서버 시작"
echo "=========================================="

cd "$(dirname "$0")/../backend" || exit 1

# Check if .env exists
if [ ! -f ".env" ]; then
  echo ""
  echo "오류: backend/.env 파일이 없습니다."
  echo ""
  echo "다음 명령어로 .env 파일을 생성하세요:"
  echo "  cd backend"
  echo "  cp .env.example .env"
  echo "  # 그 다음 .env 파일을 편집하여 DATABASE_URL 등을 설정하세요"
  echo ""
  exit 1
fi

# Check if public directory exists and has files
if [ ! -d "public" ] || [ ! -f "public/index.html" ]; then
  echo ""
  echo "경고: 프론트엔드가 빌드되지 않았습니다."
  echo "자동으로 빌드를 시작합니다..."
  echo ""
  cd ..
  ./scripts/deploy-local.sh
  cd backend
fi

# Load environment variables
export NODE_ENV=production

echo ""
echo "서버를 시작합니다..."
echo "브라우저에서 http://localhost:3001 접속하세요"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요"
echo "=========================================="
echo ""

# Start server
node index.js

