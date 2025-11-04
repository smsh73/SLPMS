# SLPMS 아키텍처 설계 문서

## 1. 요구사항 및 현황 분석

### 1.1 프로젝트 목표
Notion을 모방하되, 한국 기업의 업무 공유 및 지시 방식을 지원하는 워크플로우 관리 시스템 구축

### 1.2 핵심 기능 요구사항

#### 1.2.1 회의록 관리
- 회의록 생성, 수정, 삭제
- 회의록에서 업무(작업) 및 하위업무(작업) 생성이 시작됨
- 회의록과 생성된 업무 간의 연결 관계 관리

#### 1.2.2 업무(작업) 관리
- 업무 생성, 수정, 삭제
- 하위업무 생성 (계층적 구조)
- Due Date 설정
- 진행도 관리 (0-100%)
- 담당자 할당 (조직도 기반)

#### 1.2.3 조직도 관리
- 조직도 구조 수용
- 사용자별 역할 및 권한 관리
- 담당자 할당 기능

#### 1.2.4 활동이력 관리
- 업무별 활동이력(업무보고서) 입력
- 활동이력 조회 및 검색
- 활동이력과 업무의 연결

#### 1.2.5 워크플로우 지원
- **Top-Down 방식**: 상위 업무에서 하위 업무로의 하달 구조
- **Parallel 방식**: 동시에 진행되는 병렬 업무
- **Linear 방식**: 순차적으로 진행되는 직렬 업무

### 1.3 기술 스택
- **Frontend**: React (반응형 웹)
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL 또는 MongoDB (선택 필요)

### 1.4 현재 현황
- 프로젝트 초기 단계 (빈 디렉토리)
- 신규 프로젝트 구축 필요

## 2. 핵심 설계 포인트

### 2.1 데이터 모델 설계
가장 중요한 것은 **회의록 → 업무 → 하위업무**의 계층적 관계와 **워크플로우 타입**을 효과적으로 표현하는 데이터 구조입니다.

**핵심 문제점**:
- 회의록과 업무 간의 1:N 관계
- 업무와 하위업무 간의 무한 계층 구조
- 워크플로우 타입(Parallel, Linear) 표현
- 조직도 구조와 담당자 할당

### 2.2 API 설계
RESTful API 구조로 설계하되, 한국 기업의 업무 흐름에 맞는 엔드포인트 설계가 필요합니다.

**핵심 문제점**:
- 회의록에서 업무 생성 시 연관 관계 자동 생성
- 업무 계층 구조 조회 효율성
- 워크플로우 타입별 업무 진행 상태 관리

### 2.3 프론트엔드 구조
회의록 중심의 워크플로우를 직관적으로 표현하는 UI/UX 설계가 필요합니다.

**핵심 문제점**:
- 회의록 중심의 네비게이션 구조
- 계층적 업무 구조의 시각적 표현
- 워크플로우 타입별 뷰 제공

## 3. 솔루션 시나리오

### 3.1 데이터베이스 스키마 설계

#### 3.1.1 회의록(Meeting) 테이블
```sql
- id (PK)
- title (회의 제목)
- content (회의 내용)
- meeting_date (회의 일시)
- created_by (생성자)
- created_at
- updated_at
```

#### 3.1.2 업무(Task) 테이블
```sql
- id (PK)
- meeting_id (FK, 회의록 연결)
- parent_task_id (FK, 상위 업무, NULL 가능)
- title (업무 제목)
- description (업무 설명)
- assignee_id (담당자, FK)
- due_date (마감일)
- progress (진행도, 0-100)
- workflow_type (워크플로우 타입: 'top-down', 'parallel', 'linear', 'sequential', 'iterative', 'ad-hoc', 'approval')
- status (상태: 'pending', 'in_progress', 'completed', 'cancelled')
- priority (우선순위: 'low', 'medium', 'high')
- created_by (생성자)
- created_at
- updated_at
```

#### 3.1.3 조직도(Organization) 테이블
```sql
- id (PK)
- user_id (FK)
- department (부서)
- position (직급)
- manager_id (상급자, FK, NULL 가능)
- created_at
- updated_at
```

#### 3.1.4 사용자(User) 테이블
```sql
- id (PK)
- email (이메일)
- password_hash (비밀번호 해시)
- name (이름)
- created_at
- updated_at
```

#### 3.1.5 활동이력(ActivityLog) 테이블
```sql
- id (PK)
- task_id (FK)
- user_id (FK)
- content (활동 내용)
- activity_type (활동 유형: 'report', 'comment', 'status_change')
- created_at
```

### 3.2 백엔드 API 구조

#### 3.2.1 회의록 API
```
GET    /api/meetings              # 회의록 목록 조회
GET    /api/meetings/:id          # 회의록 상세 조회
POST   /api/meetings              # 회의록 생성
PUT    /api/meetings/:id          # 회의록 수정
DELETE /api/meetings/:id          # 회의록 삭제
POST   /api/meetings/:id/tasks    # 회의록에서 업무 생성
```

#### 3.2.2 업무 API
```
GET    /api/tasks                 # 업무 목록 조회 (필터링 지원)
GET    /api/tasks/:id             # 업무 상세 조회 (하위업무 포함)
POST   /api/tasks                 # 업무 생성
PUT    /api/tasks/:id             # 업무 수정
DELETE /api/tasks/:id             # 업무 삭제
POST   /api/tasks/:id/subtasks    # 하위업무 생성
GET    /api/tasks/:id/hierarchy   # 업무 계층 구조 조회
PUT    /api/tasks/:id/progress    # 진행도 업데이트
```

#### 3.2.3 활동이력 API
```
GET    /api/tasks/:id/activities  # 업무별 활동이력 조회
POST   /api/tasks/:id/activities  # 활동이력 생성
PUT    /api/activities/:id        # 활동이력 수정
DELETE /api/activities/:id        # 활동이력 삭제
```

#### 3.2.4 조직도 API
```
GET    /api/organization          # 조직도 조회
GET    /api/organization/users    # 사용자 목록 조회
GET    /api/users/:id/tasks       # 사용자별 담당 업무 조회
```

### 3.3 프론트엔드 구조

#### 3.3.1 디렉토리 구조
```
src/
├── components/
│   ├── Meeting/
│   │   ├── MeetingList.jsx
│   │   ├── MeetingDetail.jsx
│   │   └── MeetingForm.jsx
│   ├── Task/
│   │   ├── TaskList.jsx
│   │   ├── TaskDetail.jsx
│   │   ├── TaskForm.jsx
│   │   ├── TaskHierarchy.jsx
│   │   └── TaskProgress.jsx
│   ├── ActivityLog/
│   │   ├── ActivityList.jsx
│   │   └── ActivityForm.jsx
│   ├── Organization/
│   │   └── OrganizationChart.jsx
│   └── common/
│       ├── Layout.jsx
│       └── Navigation.jsx
├── pages/
│   ├── MeetingsPage.jsx
│   ├── TasksPage.jsx
│   ├── DashboardPage.jsx
│   └── OrganizationPage.jsx
├── services/
│   └── api.js
├── context/
│   └── AuthContext.jsx
└── utils/
    └── helpers.js
```

#### 3.3.2 주요 페이지 흐름
1. **대시보드**: 전체 업무 현황 및 진행 상황
2. **회의록 페이지**: 회의록 목록 및 상세
3. **업무 페이지**: 업무 목록, 계층 구조, 워크플로우 뷰
4. **조직도 페이지**: 조직 구조 및 담당자 관리

### 3.4 구현 단계

#### 1단계: 프로젝트 기본 구조 설정
- Node.js 백엔드 프로젝트 초기화 (Express)
- React 프론트엔드 프로젝트 초기화
- 데이터베이스 선택 및 연결 설정
- 기본 인증 시스템 구축

#### 2단계: 데이터베이스 스키마 구현
- 데이터베이스 테이블 생성
- 관계 설정 (Foreign Key)
- 인덱스 설정 (성능 최적화)

#### 3단계: 회의록 관리 기능 구현
- 회의록 CRUD API
- 회의록 프론트엔드 컴포넌트
- 회의록에서 업무 생성 기능

#### 4단계: 업무 관리 핵심 기능 구현
- 업무 CRUD API
- 하위업무 생성 및 계층 구조 관리
- 담당자 할당 기능
- Due Date 및 진행도 관리

#### 5단계: 워크플로우 타입 지원 구현
- 워크플로우 타입별 로직 구현
- Top-Down 업무 하달 구조
- Parallel/Linear 워크플로우 처리

#### 6단계: 활동이력 관리 구현
- 활동이력 CRUD API
- 업무보고서 작성 기능
- 활동이력 조회 및 검색

#### 7단계: 조직도 통합
- 조직도 구조 표현
- 담당자 할당 UI
- 사용자별 업무 조회

#### 8단계: UI/UX 개선 및 반응형 디자인
- 반응형 레이아웃 구현
- 사용자 경험 개선
- 성능 최적화

## 4. 기대 효과

### 4.1 기능적 효과
- **회의록 중심 워크플로우**: 회의록에서 직접 업무가 생성되어 업무 추적성이 향상됩니다
- **계층적 업무 관리**: 무한 계층 구조로 복잡한 프로젝트도 체계적으로 관리 가능
- **한국 기업 문화 반영**: Top-Down 방식과 협업 워크플로우를 모두 지원하여 실제 업무에 바로 적용 가능
- **투명한 업무 진행**: 활동이력을 통한 업무 진행 상황의 가시성 확보

### 4.2 기술적 효과
- **확장 가능한 구조**: 모듈화된 설계로 기능 추가가 용이
- **성능 최적화**: 인덱스 및 쿼리 최적화로 대용량 데이터 처리 가능
- **유지보수성**: 명확한 구조로 코드 유지보수가 용이

### 4.3 사용자 경험 효과
- **직관적인 인터페이스**: 회의록 중심의 네비게이션으로 사용자 친화적
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 환경에서 사용 가능
- **실시간 업데이트**: 업무 상태 변경 시 즉시 반영

## 5. 기술 스택 상세

### 5.1 백엔드
- **Runtime**: Node.js (v18 이상)
- **Framework**: Express.js
- **ORM**: Prisma 또는 Sequelize (PostgreSQL) / Mongoose (MongoDB)
- **인증**: JWT (jsonwebtoken)
- **유효성 검증**: Joi 또는 express-validator

### 5.2 프론트엔드
- **Framework**: React 18+
- **상태 관리**: Context API 또는 Redux Toolkit
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios
- **UI 라이브러리**: Material-UI 또는 Ant Design
- **스타일링**: CSS Modules 또는 Styled Components

### 5.3 데이터베이스
**옵션 1: PostgreSQL** (권장)
- 관계형 데이터베이스로 계층 구조와 관계 관리에 적합
- 트랜잭션 지원으로 데이터 일관성 보장

**옵션 2: MongoDB**
- NoSQL로 유연한 스키마 관리
- JSON 형태로 직관적인 데이터 구조

### 5.4 개발 도구
- **버전 관리**: Git
- **패키지 관리**: npm 또는 yarn
- **빌드 도구**: Vite (프론트엔드)
- **코드 품질**: ESLint, Prettier

## 6. 다음 단계

이 설계 방향에 대해 어떻게 생각하시나요? 

특히 다음 사항에 대한 의견을 구하고 싶습니다:

1. **데이터베이스 선택**: PostgreSQL과 MongoDB 중 어떤 것을 선호하시나요?
2. **인증 방식**: JWT 기반 인증으로 충분한가요? (OAuth, SSO 등 추가 필요 여부)
3. **워크플로우 타입**: Parallel, Linear 외에 추가로 필요한 워크플로우 타입이 있나요?
4. **우선순위**: 어떤 기능부터 먼저 구현하는 것이 좋을까요?

피드백을 주시면 그에 맞춰 구체적인 구현을 시작하겠습니다.

