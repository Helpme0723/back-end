# <img src="https://github.com/user-attachments/assets/c9ce2feb-8b0e-42eb-ba95-0e16eec610cb" alt="favicon" width="30" height="30"> TalentVerse BE

_TalentVerse BE Repository_

&nbsp;

# 📌 프로젝트 주요 기능

- **포스트 구매 및 열람**

  - 구매한 포스트라면 해당 포스트가 비공개되거나 삭제되어도 열람할 수 있도록 구현

- **일간 / 월간 통계**

  - 채널별로 일간, 월간 통계를 볼 수 있도록 구현

- **검색**

  - ElasticSearch를 활용하여 오타가 나더라도 보정된 검색 결과를 반환받을 수 있게 구현

- **검색어 랭킹**

  - 최근 1시간 사이에 가장 많이 검색된 검색어를 확인할 수 있도록 구현

- **알림**

  - 작성한 포스트에 댓글이 달리거나, 포스트 혹은 댓글에 좋아요, 누군가가 내 채널을 구독한다면 알림이 오고, 해당 타입의 알림을 받을지 설정할 수 있도록 구현

- **결제**
  - 포트원을 사용하여 포인트를 결제하여 포스트 구매에 사용할 수 있도록 구현

&nbsp;

# 💻 BE 기술 스택

| **Tech**    | **Stack**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BE CORE** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)                                                                                                                                                                                                                                                                                                                                                                                                                                |
| BE          | ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white) ![AMAZON EC2](https://img.shields.io/badge/Amazon%20EC2-FF9900?style=for-the-badge&logo=Amazon%20EC2&logoColor=white) ![AMAZON RDS](https://img.shields.io/badge/amazonrds-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white) ![AMAZON S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=Amazon%20S3&logoColor=white) ![ElasticSearch](https://img.shields.io/badge/-ElasticSearch-005571?style=for-the-badge&logo=elasticsearch) ![image](https://github.com/user-attachments/assets/f5b08098-d4ad-4222-9ad7-b462b0f1c3a5) ![image](https://github.com/user-attachments/assets/26e673f6-62ee-40a9-bde0-d1bcd73440ab) <img src="https://img.shields.io/badge/CDN-3693F3?style=for-the-badge&logo=icloud&logoColor=white"> |

&nbsp;

# 📁 폴더 구조 및 환경 변수

<details>
<summary>Directory Structure</summary>

```
📦src
 ┣ 📂auth // 인증 및 인가
 ┣ 📂aws // 이미지 업로드
 ┣ 📂channel // 채널 생성 및 관리
 ┣ 📂comment // 댓글 생성 및 관리
 ┣ 📂configs // DB 연결 및 환경 변수 검증
 ┣ 📂insight // 통계 관리
 ┣ 📂library // 보관함
 ┣ 📂mail // 인증 이메일 발송
 ┣ 📂notification // 알림 및 알림 설정
 ┣ 📂payments // 포인트 결제
 ┣ 📂point // 포인트 사용 내역 조회
 ┣ 📂purchase // 포스트 구매
 ┣ 📂redis // 검색어 랭킹 데이터 관리
 ┣ 📂schedule-task // Cron 관리
 ┣ 📂search // 검색
 ┣ 📂series // 시리즈 생성 및 관리
 ┣ 📂subscribe // 구독
 ┣ 📂user // 유저 정보 관리
 ┣ 📂utils // 유틸리티 함수
 ┣ app.controller.ts
 ┣ app.module.ts
 ┣ main.ts
 ┗ webhook.interceptor.ts // Sentry 및 슬랙 알림
```

</details>

<details>
<summary>Env example</summary>

```
SERVER_PORT=

# DB

DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_SYNC=
DB_TYPE=

#JWT
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES=
HASH_ROUND=10

#S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
ELASTICSEARCH_NODE=
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

#NODEMAILER
NODEMAILER_HOST=
NODEMAILER_PORT=
NODEMAILER_USER=
NODEMAILER_PASSWORD=

#REDIS
REDIS_HOST=
REDIS_PORT=
REDIS_USERNAME=
REDIS_PASSWORD=

#FRONT-END-URL
PRODUCTION_URL=
DEVELOP_URL=

#NAVER-SOCIAL-LOGIN
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_CALLBACK_URL=
SOCIAL_REDIRECT_URL=

#SENTRY
SENTRY_DSN=
SLACK_WEBHOOK=
#KAKAO-SOCIAL-LOGIN
KAKAO_REST_API_KEY=
KAKAO_CALLBACK_URI=
KAKAO_CLIENT_SECRET=

#PORTONE
PORTONE_REST_API_KEY=
PORTONE_SECRET_KEY=

#CDN
CDN_DOMAIN=

```

</details>

&nbsp;

# 🚀시작 가이드

**installation**

```
$ git clone https://github.com/Helpme0723/back-end.git
$ cd back-end
```

**copy**

```
.env
```

**BackEnd**

```
$ npm ci
$ npm run start:dev
```
