# SLPMS (Slack-like Project Management System)

한국 기업의 업무 공유 및 지시 방식을 지원하는 워크플로우 관리 시스템

## 기술 스택

- **Backend**: Node.js + Express + PostgreSQL (Prisma)
- **Frontend**: React + Vite
- **인증**: JWT (이메일/비밀번호)

## 프로젝트 구조

```
SLPMS/
├── backend/          # Node.js 백엔드
├── frontend/         # React 프론트엔드
└── docs/            # 문서
```

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- PostgreSQL 14 이상
- npm 또는 yarn

### 백엔드 설정

```bash
cd backend
npm install
cp .env.example .env
# .env 파일에 데이터베이스 연결 정보 입력
npx prisma migrate dev
npm run dev
```

### 프론트엔드 설정

```bash
cd frontend
npm install
npm run dev
```

## 워크플로우 타입

- **top-down**: 상위 업무에서 하위 업무로의 하달 구조
- **parallel**: 동시에 진행되는 병렬 업무
- **linear**: 순차적으로 진행되는 직렬 업무
- **sequential**: 순차적 단계별 진행
- **iterative**: 반복적 개선 및 수정
- **ad-hoc**: 임시/즉석 업무
- **approval**: 승인 기반 업무

## 주요 기능

- 회의록 관리
- 업무(작업) 생성 및 하위업무 관리
- Due Date 및 진행도 관리
- 활동이력(업무보고서) 입력
- 조직도 기반 담당자 할당
- 워크플로우 타입별 업무 진행

