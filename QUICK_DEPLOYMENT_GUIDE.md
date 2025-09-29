# 🚀 빠른 배포 가이드

## 🎯 **즉시 사용 가능한 방법들**

배포 오류가 발생했지만, 팀원들과 공유할 수 있는 여러 방법이 있습니다!

## 🌐 **Option 1: 로컬 네트워크 공유 (즉시 가능)**

### 1.1 현재 IP 확인
```bash
# Windows
ipconfig

# macOS/Linux  
ifconfig
```

### 1.2 서버 시작
```bash
# 캐릭터 연동 시스템 시작
node character_web_interface.js
```

### 1.3 팀원들에게 공유
```
http://[YOUR_IP]:3002
예: http://192.168.1.100:3002
```

**장점**: 즉시 사용 가능, 설정 불필요
**단점**: 같은 네트워크에 있어야 함

## 📱 **Option 2: ngrok 터널링 (추천)**

### 2.1 ngrok 설치
```bash
# ngrok 다운로드 및 설치
# https://ngrok.com/download
```

### 2.2 터널 생성
```bash
# 서버 시작
node character_web_interface.js

# 다른 터미널에서
ngrok http 3002
```

### 2.3 공유 URL 사용
```
ngrok이 제공하는 URL 사용
예: https://abc123.ngrok.io
```

**장점**: 인터넷 어디서나 접근 가능
**단점**: ngrok 계정 필요 (무료)

## 🐳 **Option 3: Docker 배포**

### 3.1 Docker 이미지 빌드
```bash
# Docker 이미지 빌드
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

## ☁️ **Option 4: 클라우드 배포 (수동)**

### 4.1 GitHub에 코드 업로드
1. GitHub 저장소 생성
2. 코드 업로드
3. 팀원들에게 저장소 공유

### 4.2 팀원 로컬 실행
```bash
# 저장소 클론
git clone [저장소_URL]

# 의존성 설치
npm install

# 데이터베이스 설정
npm run setup

# 서버 시작
npm start
```

## 🎮 **즉시 테스트 가능한 방법**

### **로컬 테스트**
```bash
# 1. 기본 PoC 테스트
node poc_web_interface.js
# http://localhost:3000

# 2. 고급 분석 테스트  
node advanced_web_interface.js
# http://localhost:3001

# 3. 캐릭터 연동 테스트
node character_web_interface.js
# http://localhost:3002
```

### **팀원 공유용 링크**
```
기본 PoC: http://[YOUR_IP]:3000
고급 분석: http://[YOUR_IP]:3001  
캐릭터 연동: http://[YOUR_IP]:3002
```

## 📊 **팀원 사용 가이드**

### **기본 사용법**
1. **링크 접속**: 제공된 URL로 접속
2. **서버 선택**: 루시안, 카이젠, 아르카디아, 테스트
3. **캐릭터명 입력**: 임의의 캐릭터명 (예: 테스트캐릭터)
4. **추천 요청**: "던전 클리어가 어려워, 공격력이 부족해"
5. **결과 확인**: 맞춤형 추천 결과 확인

### **테스트 시나리오**
```
✅ 던전 클리어가 어려워, 공격력이 부족해
✅ PvP에서 자꾸 죽어, 생존이 안돼
✅ 마나가 부족해서 스킬을 못써
✅ 보스 레이드에서 딜링이 부족해
✅ 속도가 느려서 움직임이 답답해
```

## 🔧 **문제 해결**

### **포트 충돌**
```bash
# 포트 변경
set PORT=3003
node character_web_interface.js
```

### **데이터베이스 오류**
```bash
# 데이터베이스 재설정
npm run setup
```

### **의존성 오류**
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

## 📞 **지원 및 문의**

### **기술 지원**
- **이메일**: tech-support@tl-build-recommendation.com
- **Discord**: [팀 Discord 서버]
- **GitHub Issues**: [저장소 Issues]

### **팀 연락처**
- **프로젝트 리드**: [이름] - [연락처]
- **백엔드 개발자**: [이름] - [연락처]
- **프론트엔드 개발자**: [이름] - [연락처]

## 🎉 **즉시 실행 가능한 명령어**

```bash
# 1. 로컬 네트워크 공유
node character_web_interface.js
# http://[YOUR_IP]:3002

# 2. ngrok 터널링
ngrok http 3002
# https://abc123.ngrok.io

# 3. Docker 배포
docker-compose up -d
# http://localhost:3002
```

**팀원들과 함께 TL Build Recommendation System을 테스트해보세요! 🎮✨**
