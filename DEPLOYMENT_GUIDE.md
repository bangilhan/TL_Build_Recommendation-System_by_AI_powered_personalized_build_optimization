# 🚀 TL Build Recommendation System - Deployment Guide

## 📋 **배포 옵션 개요**

팀원들과 공유할 수 있는 여러 배포 옵션을 제공합니다:

1. **Heroku** (추천) - 무료, 쉬운 설정
2. **Vercel** - 빠른 배포, 무료
3. **GitHub Pages** - 정적 호스팅
4. **Docker** - 컨테이너 배포
5. **로컬 네트워크** - 팀 내부 공유

## 🌟 **Option 1: Heroku 배포 (추천)**

### 1.1 Heroku 계정 생성
```bash
# Heroku CLI 설치
npm install -g heroku

# Heroku 로그인
heroku login
```

### 1.2 앱 생성 및 배포
```bash
# 프로젝트 디렉토리에서
heroku create tl-build-recommendation

# 환경 변수 설정
heroku config:set NODE_ENV=production

# 배포
git add .
git commit -m "Initial deployment"
git push heroku main
```

### 1.3 앱 확인
```bash
# 앱 열기
heroku open

# 로그 확인
heroku logs --tail
```

**결과**: `https://tl-build-recommendation.herokuapp.com`

## ⚡ **Option 2: Vercel 배포**

### 2.1 Vercel CLI 설치
```bash
npm install -g vercel
```

### 2.2 배포
```bash
# 프로젝트 디렉토리에서
vercel

# 프로덕션 배포
vercel --prod
```

**결과**: `https://tl-build-recommendation.vercel.app`

## 🐳 **Option 3: Docker 배포**

### 3.1 Docker 이미지 빌드
```bash
# 이미지 빌드
docker build -t tl-build-recommendation .

# 컨테이너 실행
docker run -p 3002:3002 tl-build-recommendation
```

### 3.2 Docker Compose 사용
```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down
```

## 🌐 **Option 4: 로컬 네트워크 공유**

### 4.1 네트워크 IP 확인
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### 4.2 서버 시작
```bash
# 모든 인터페이스에서 접근 가능하도록 시작
node character_web_interface.js
```

### 4.3 팀원 접근
```
http://[YOUR_IP]:3002
예: http://192.168.1.100:3002
```

## 📱 **Option 5: GitHub Pages (정적 버전)**

### 5.1 정적 파일 생성
```bash
# 정적 HTML 파일 생성
node generate_static.js
```

### 5.2 GitHub Pages 설정
1. GitHub 저장소 생성
2. Settings > Pages
3. Source: Deploy from a branch
4. Branch: main, /docs

## 🔧 **배포 전 체크리스트**

### 필수 파일 확인
- [ ] `package.json` - 의존성 및 스크립트
- [ ] `Procfile` - Heroku용
- [ ] `vercel.json` - Vercel용
- [ ] `Dockerfile` - Docker용
- [ ] `README.md` - 프로젝트 문서
- [ ] `poc_mastery.db` - 데이터베이스 파일

### 환경 변수 설정
```bash
# Heroku
heroku config:set NODE_ENV=production
heroku config:set PORT=3002

# Vercel
vercel env add NODE_ENV production
vercel env add PORT 3002
```

## 🎯 **팀 공유 방법**

### 1. 링크 공유
```
메인 시스템: https://tl-build-recommendation.herokuapp.com
고급 분석: https://tl-build-recommendation-advanced.herokuapp.com
```

### 2. 사용 가이드 공유
```markdown
# 팀원 사용 가이드

## 기본 사용법
1. 브라우저에서 링크 접속
2. 서버 선택 (루시안, 카이젠, 아르카디아, 테스트)
3. 캐릭터명 입력
4. 추천 요청 입력
5. 결과 확인

## 예시 질문
- "던전 클리어가 어려워, 공격력이 부족해"
- "PvP에서 자꾸 죽어, 생존이 안돼"
- "마나가 부족해서 스킬을 못써"
```

### 3. 피드백 수집
```markdown
# 피드백 양식
- 사용한 기능: [기본/고급/캐릭터 연동]
- 만족도: [1-5점]
- 개선사항: [자유 입력]
- 버그 리포트: [자유 입력]
```

## 🚨 **문제 해결**

### 일반적인 문제들

#### 1. 포트 충돌
```bash
# 포트 변경
export PORT=3003
node character_web_interface.js
```

#### 2. 데이터베이스 오류
```bash
# 데이터베이스 재설정
npm run setup
```

#### 3. 의존성 오류
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 4. Heroku 배포 실패
```bash
# 로그 확인
heroku logs --tail

# 앱 재시작
heroku restart
```

## 📊 **모니터링**

### 성능 모니터링
```bash
# Heroku 메트릭
heroku ps

# Vercel 분석
vercel logs
```

### 사용자 피드백
- Google Forms 설문조사
- Discord 피드백 채널
- GitHub Issues

## 🔄 **업데이트 배포**

### 자동 배포 설정
```bash
# GitHub Actions 설정
# .github/workflows/deploy.yml 생성
```

### 수동 업데이트
```bash
# 코드 변경 후
git add .
git commit -m "Update: 새로운 기능 추가"
git push heroku main
```

## 📞 **지원 및 문의**

### 기술 지원
- **이메일**: tech-support@tl-build-recommendation.com
- **Discord**: [팀 Discord 서버]
- **GitHub Issues**: [저장소 Issues]

### 팀 연락처
- **프로젝트 리드**: [이름] - [연락처]
- **백엔드 개발자**: [이름] - [연락처]
- **프론트엔드 개발자**: [이름] - [연락처]

---

**배포 완료 후 팀원들과 함께 테스트해보세요! 🎮✨**
