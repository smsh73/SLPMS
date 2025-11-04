#!/bin/bash

echo "=========================================="
echo "SLPMS 데이터베이스 설정"
echo "=========================================="

# Find PostgreSQL bin directory
if [ -d "/opt/homebrew/opt/postgresql@15/bin" ]; then
  PSQL_BIN="/opt/homebrew/opt/postgresql@15/bin/psql"
elif [ -d "/usr/local/opt/postgresql@15/bin" ]; then
  PSQL_BIN="/usr/local/opt/postgresql@15/bin/psql"
elif command -v psql &> /dev/null; then
  PSQL_BIN="psql"
else
  echo "오류: psql을 찾을 수 없습니다."
  echo "PostgreSQL이 설치되어 있는지 확인하세요."
  exit 1
fi

echo "PostgreSQL 경로: $PSQL_BIN"
echo ""

# Check if PostgreSQL is running
if ! $PSQL_BIN -U postgres -c "SELECT 1;" > /dev/null 2>&1; then
  echo "PostgreSQL이 실행되지 않았습니다."
  echo "다음 명령어로 PostgreSQL을 시작하세요:"
  echo "  brew services start postgresql@15"
  exit 1
fi

echo "PostgreSQL이 실행 중입니다."
echo ""

# Check if database exists
if $PSQL_BIN -U postgres -lqt | cut -d \| -f 1 | grep -qw slpms; then
  echo "데이터베이스 'slpms'가 이미 존재합니다."
  read -p "데이터베이스를 삭제하고 다시 생성하시겠습니까? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "데이터베이스 삭제 중..."
    $PSQL_BIN -U postgres -c "DROP DATABASE IF EXISTS slpms;"
    echo "데이터베이스 생성 중..."
    $PSQL_BIN -U postgres -c "CREATE DATABASE slpms;"
    echo "데이터베이스가 생성되었습니다."
  fi
else
  echo "데이터베이스 생성 중..."
  $PSQL_BIN -U postgres -c "CREATE DATABASE slpms;"
  if [ $? -eq 0 ]; then
    echo "데이터베이스 'slpms'가 생성되었습니다."
  else
    echo "데이터베이스 생성 실패. 권한을 확인하세요."
    exit 1
  fi
fi

echo ""
echo "=========================================="
echo "데이터베이스 설정 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo "1. backend/.env 파일에서 DATABASE_URL 확인"
echo "2. Prisma 마이그레이션 실행:"
echo "   cd backend"
echo "   npx prisma generate"
echo "   npx prisma migrate deploy"
echo ""

