# docker 이미지 정의
FROM node:20

# /app 이라는 폴더에서 프로젝트를 실행할 예정이므로 mkdir명령어로 생성
RUN mkdir -p /app

# /app 이라는 폴더에서 프로젝트 실행
WORKDIR /app

# Dockerfile이 위치한 폴더의 모든 내용을 /app으로 복사
COPY . .

# 프로젝트에서 사용한 패키지를 package.json을 통해 모두 설치
RUN npm install

# 프로젝트 빌드
RUN npm run build

# 사용할 포트 
EXPOSE 3001

# 빌드 이후에 dist 라는 폴더에 main.js가 생성되므로 해당 파일 실행
CMD [ "node", "dist/main.js"]