# <img src="https://github.com/user-attachments/assets/c9ce2feb-8b0e-42eb-ba95-0e16eec610cb" alt="favicon" width="30" height="30"> TalentVerse BE

*TalentVerse BE Repository*

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
| **BE CORE**            | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)                                                                                                                                                                                                                                                                                                                                                                                                                                |
| BE                     | ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white) ![AMAZON EC2](https://img.shields.io/badge/Amazon%20EC2-FF9900?style=for-the-badge&logo=Amazon%20EC2&logoColor=white) ![AMAZON RDS](https://img.shields.io/badge/amazonrds-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white) ![AMAZON S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=Amazon%20S3&logoColor=white) ![ElasticSearch](https://img.shields.io/badge/-ElasticSearch-005571?style=for-the-badge&logo=elasticsearch) ![image](https://github.com/user-attachments/assets/f5b08098-d4ad-4222-9ad7-b462b0f1c3a5) ![image](https://github.com/user-attachments/assets/26e673f6-62ee-40a9-bde0-d1bcd73440ab) <img src="https://img.shields.io/badge/CDN-3693F3?style=for-the-badge&logo=icloud&logoColor=white"> |

&nbsp;

# 📁 폴더 구조 및 환경 변수

<details>
<summary>Directory Structure</summary>

```
📦src
 ┣ 📂auth
 ┃ ┣ 📂decorators
 ┃ ┃ ┗ user-info.decorator.ts
 ┃ ┣ 📂dtos
 ┃ ┃ ┣ email-conflict.dto.ts
 ┃ ┃ ┣ recovery-password.dto.ts
 ┃ ┃ ┣ sign-in.dto.ts
 ┃ ┃ ┣ sign-up.dto.ts
 ┃ ┃ ┗ verify-code.dto.ts
 ┃ ┣ 📂guards
 ┃ ┃ ┣ kakao-auth.guard.ts
 ┃ ┃ ┣ local-auth.guard.ts
 ┃ ┃ ┣ naver-auth.guard.ts
 ┃ ┃ ┗ refresh-token.guard.ts
 ┃ ┣ 📂interfaces
 ┃ ┃ ┗ jwt-payload.interface.ts
 ┃ ┣ 📂strategies
 ┃ ┃ ┣ jwt.strategy.ts
 ┃ ┃ ┣ kakao.strategy.ts
 ┃ ┃ ┣ local.strategy.ts
 ┃ ┃ ┣ naver.strategy.ts
 ┃ ┃ ┗ refresh.strategy.ts
 ┃ ┣ 📂types
 ┃ ┃ ┗ social.type.ts
 ┃ ┣ auth.controller.ts
 ┃ ┣ auth.module.ts
 ┃ ┗ auth.service.ts
 ┣ 📂aws
 ┃ ┣ aws.controller.ts
 ┃ ┣ aws.module.ts
 ┃ ┗ aws.service.ts
 ┣ 📂channel
 ┃ ┣ 📂dtos
 ┃ ┃ ┣ channel-id.dto.ts
 ┃ ┃ ┣ create-channel.dto.ts
 ┃ ┃ ┣ find-all-channels.dto.ts
 ┃ ┃ ┣ find-all-my-channels.dto.ts
 ┃ ┃ ┣ find-daily-insights.dto.ts
 ┃ ┃ ┣ find-monthly-insights.dto.ts
 ┃ ┃ ┣ summary-insight.dto.ts
 ┃ ┃ ┗ update-channel.dto.ts
 ┃ ┣ 📂entities
 ┃ ┃ ┗ channel.entity.ts
 ┃ ┣ 📂types
 ┃ ┃ ┗ insight-sort.type.ts
 ┃ ┣ channel.controller.ts
 ┃ ┣ channel.module.ts
 ┃ ┗ channel.service.ts
 ┣ 📂comment
 ┃ ┣ 📂dto
 ┃ ┃ ┣ create-comment.dto.ts
 ┃ ┃ ┣ pagination.dto.ts
 ┃ ┃ ┗ update-comment.dto.ts
 ┃ ┣ 📂entities
 ┃ ┃ ┣ comment-like.entity.ts
 ┃ ┃ ┗ comment.entity.ts
 ┃ ┣ comment.controller.ts
 ┃ ┣  comment.module.ts
 ┃ ┗  comment.service.ts
 ┣ 📂configs
 ┃ ┣ cache.config.ts
 ┃ ┣ database.config.ts
 ┃ ┗ env-validation.config.ts
 ┣ 📂constants
 ┃ ┗ page.constant.ts
 ┣ 📂insight
 ┃ ┣ 📂entities
 ┃ ┃ ┣ channel-daily-insight.entity.ts
 ┃ ┃ ┣ channel-monthly-insight.entity.ts
 ┃ ┃ ┣ daily-insight.entity.ts
 ┃ ┃ ┗ monthly-insight.entity.ts
 ┃ ┣ insight.module.ts
 ┃ ┗ insight.service.ts
 ┣ 📂library
 ┃ ┣ 📂dtos
 ┃ ┃ ┣ pagination.dto.ts
 ┃ ┃ ┗ read-comment.dto.ts
 ┃ ┣ 📂types
 ┃ ┃ ┗ order.types.ts
 ┃ ┣ library.controller.ts
 ┃ ┣ library.module.ts
 ┃ ┗ library.service.ts
 ┣ 📂mail
 ┃ ┣ 📂dtos
 ┃ ┃ ┗ 📂send-
 ┃ ┃ ┃ ┗ mail.dto.ts
 ┃ ┣ mail.controller.ts
 ┃ ┣ mail.module.ts
 ┃ ┗ mail.service.ts
 ┣ 📂notification
 ┃ ┣ 📂dtos
 ┃ ┃ ┗ FindAllNotifications-dto.ts
 ┃ ┣ 📂entities
 ┃ ┃ ┣ notification-settings.entity.ts
 ┃ ┃ ┗ notification.entity.ts
 ┃ ┣ notification.controller.ts
 ┃ ┣ notification.module.ts
 ┃ ┗ notification.service.ts
 ┣ 📂payments
 ┃ ┣ 📂dtos
 ┃ ┃ ┗ payment.dto.ts
 ┃ ┣ 📂types
 ┃ ┃ ┗ payment.type.ts
 ┃ ┣ payments.controller.ts
 ┃ ┣ payments.module.ts
 ┃ ┗ payments.service.ts
 ┣ 📂point
 ┃ ┣ 📂dtos
 ┃ ┃ ┗ make-choice.dto.ts
 ┃ ┣ 📂entities
 ┃ ┃ ┣ point-history.entity.ts
 ┃ ┃ ┣ point-menu-entity.ts
 ┃ ┃ ┗ point-order.entity.ts
 ┃ ┣ 📂types
 ┃ ┃ ┗ point-history.type.ts
 ┃ ┣ point.controller.ts
 ┃ ┣ point.module.ts
 ┃ ┗ point.service.ts
 ┣ 📂post
 ┃ ┣ 📂dto
 ┃ ┃ ┣ create-post.dto.ts
 ┃ ┃ ┣ find-all-post-by-channel-id.dto.ts
 ┃ ┃ ┗ update-post.dto.ts
 ┃ ┣ 📂entities
 ┃ ┃ ┣ category.entity.ts
 ┃ ┃ ┣ post-like.entity.ts
 ┃ ┃ ┣ post.entity.ts
 ┃ ┃ ┗ tag.entity.ts
 ┃ ┣ 📂types
 ┃ ┃ ┗ visibility.type.ts
 ┃ ┣ post.controller.ts
 ┃ ┣ post.module.ts
 ┃ ┗ post.service.ts
 ┣ 📂purchase
 ┃ ┣ 📂dto
 ┃ ┃ ┗ buy-post.dto.ts
 ┃ ┣ 📂entities
 ┃ ┃ ┗ purchase-list.entity.ts
 ┃ ┣ purchase.controller.ts
 ┃ ┣ purchase.module.ts
 ┃ ┗ purchase.service.ts
 ┣ 📂redis
 ┃ ┗ redis.service.ts
 ┣ 📂schedule-task
 ┃ ┣ schedule-task.controller.ts
 ┃ ┗ schedule-task.module.ts
 ┣ 📂search
 ┃ ┣ 📂dtos
 ┃ ┃ ┗ search.dto.ts
 ┃ ┣ 📂entities
 ┃ ┃ ┗ search.entity.ts
 ┃ ┣ 📂types
 ┃ ┃ ┗ field.type.ts
 ┃ ┣ search.controller.ts
 ┃ ┣ search.module.ts
 ┃ ┗ search.service.ts
 ┣ 📂series
 ┃ ┣ 📂dtos
 ┃ ┃ ┣ create-series-dto.ts
 ┃ ┃ ┣ find-all-series.dto.ts
 ┃ ┃ ┗ update-series-dto.ts
 ┃ ┣ 📂entities
 ┃ ┃ ┗ series.entity.ts
 ┃ ┣ series.controller.ts
 ┃ ┣ series.module.ts
 ┃ ┗ series.service.ts
 ┣ 📂subscribe
 ┃ ┣ 📂dtos
 ┃ ┃ ┣ find-all-subscribes.dto.ts
 ┃ ┃ ┗ subscribe.dto.ts
 ┃ ┣ 📂entities
 ┃ ┃ ┗ subscribe.entity.ts
 ┃ ┣ subscribe.controller.ts
 ┃ ┣ subscribe.module.ts
 ┃ ┗ subscribe.service.ts
 ┣ 📂user
 ┃ ┣ 📂dtos
 ┃ ┃ ┣ read-user-profile.dto.ts
 ┃ ┃ ┣ update-user-password.dto.ts
 ┃ ┃ ┗ update-user.dto.ts
 ┃ ┣ 📂entities
 ┃ ┃ ┗ user.entity.ts
 ┃ ┣ 📂types
 ┃ ┃ ┗ user-role.type.ts
 ┃ ┣ user.controller.ts
 ┃ ┣ user.module.ts
 ┃ ┗ user.service.ts
 ┣ 📂utils
 ┃ ┣ count.util.ts
 ┃ ┣ utils.module.ts
 ┃ ┗ utils.service.ts
 ┣ app.controller.ts
 ┣ app.module.ts
 ┣ main.ts
 ┣ sample.service.ts
 ┗ webhook.interceptor.ts
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

**BackEnd**

```
$ npm ci
$ npm run start:dev
```
