#!/bin/bash

echo "=========================================="
echo "SLPMS 로컬 서버 시작"
echo "=========================================="

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
  echo ""
  echo "경고: backend/.env 파일이 없습니다."
  echo "다음 명령어로 .env 파일을 생성하세요:"
  echo "  cp backend/.env.example backend/.env"
  echo "  # 그 다음 .env 파일을 편집하여 DATABASE_URL 등을 설정하세요"
  echo ""
  read -p "계속하시겠습니까? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check if frontend is built
if [ ! -d "backend/public" ] || [ -z "$(ls -A backend/public)" ]; then
  echo ""
  echo "프론트엔드가 빌드되지 않았습니다. 빌드를 시작합니다..."
  ./scripts/deploy-local.sh
fi

cd backend

echo ""
echo "백엔드 서버를 시작합니다..."
echo "브라우저에서 http://localhost:3001 접속하세요"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요"
echo ""

NODE_ENV=production npm start

