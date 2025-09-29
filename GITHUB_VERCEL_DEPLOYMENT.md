# 🚀 GitHub + Vercel 배포 가이드

## 📋 **단계별 배포 과정**

### **Step 1: GitHub 저장소 생성**
1. **GitHub.com 접속**
2. **"New repository" 클릭**
3. **저장소 정보 입력**:
   - Repository name: `tl-build-recommendation-system`
   - Description: `TL Build Recommendation System - AI-powered personalized build optimization`
   - Public 선택 (무료)
   - README, .gitignore, license 체크 해제
4. **"Create repository" 클릭**

### **Step 2: 로컬 저장소 연결**
```bash
# GitHub 저장소 URL 복사 후
git remote add origin https://github.com/[YOUR_USERNAME]/tl-build-recommendation-system.git

# 브랜치 이름을 main으로 변경
git branch -M main

# 코드 푸시
git push -u origin main
```

### **Step 3: Vercel 배포**
1. **Vercel.com 접속**
2. **"Sign up" 또는 "Login"**
3. **"Import Project" 클릭**
4. **GitHub 저장소 선택**
5. **배포 설정**:
   - Framework Preset: Other
   - Build Command: `npm install`
   - Output Directory: `.`
   - Install Command: `npm install`
6. **"Deploy" 클릭**

## 🔧 **배포 설정 파일**

### **vercel.json** (이미 생성됨)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "character_web_interface.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "character_web_interface.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### **package.json** (이미 생성됨)
```json
{
  "name": "tl-build-recommendation-system",
  "version": "1.0.0",
  "description": "TL Build Recommendation System - AI-powered personalized build optimization",
  "main": "character_web_interface.js",
  "scripts": {
    "start": "node character_web_interface.js",
    "dev": "node character_web_interface.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "sqlite3": "^5.1.7",
    "body-parser": "^1.20.2"
  }
}
```

## 🎯 **배포 후 접근 URL**

### **Vercel 배포 URL**
```
https://tl-build-recommendation-system.vercel.app
```

### **커스텀 도메인 (선택사항)**
```
https://tl-build-recommendation.com
```

## 📱 **팀원 공유 방법**

### **1. 링크 공유**
```
메인 시스템: https://tl-build-recommendation-system.vercel.app
```

### **2. 사용 가이드 공유**
```markdown
# 팀원 사용 가이드

## 접속 방법
1. 브라우저에서 링크 접속
2. 서버 선택 (루시안, 카이젠, 아르카디아, 테스트)
3. 캐릭터명 입력 (예: 테스트캐릭터)
4. 추천 요청 입력
5. 결과 확인

## 예시 질문
- "던전 클리어가 어려워, 공격력이 부족해"
- "PvP에서 자꾸 죽어, 생존이 안돼"
- "마나가 부족해서 스킬을 못써"
```

## 🔄 **업데이트 배포**

### **자동 배포**
- GitHub에 코드 푸시 시 자동 배포
- Vercel이 변경사항 감지하여 자동 빌드

### **수동 배포**
```bash
# 코드 변경 후
git add .
git commit -m "Update: 새로운 기능 추가"
git push origin main

# Vercel에서 자동 배포 확인
```

## 🚨 **문제 해결**

### **일반적인 문제들**

#### 1. 빌드 실패
```bash
# 로컬에서 테스트
npm install
npm start
```

#### 2. 의존성 오류
```bash
# package.json 확인
# 필요한 의존성 추가
npm install [package-name]
```

#### 3. 포트 오류
```bash
# Vercel은 자동으로 PORT 환경변수 설정
# 코드에서 process.env.PORT 사용
```

## 📊 **모니터링**

### **Vercel 대시보드**
- 배포 상태 확인
- 성능 메트릭
- 에러 로그
- 사용자 통계

### **GitHub Actions (선택사항)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎉 **배포 완료 후**

### **팀원 테스트**
1. 링크 공유
2. 사용 가이드 제공
3. 피드백 수집
4. 개선사항 반영

### **다음 단계**
- 실제 API 연동
- 성능 최적화
- UI/UX 개선
- 모바일 지원

---

**GitHub + Vercel 배포로 팀원들과 쉽게 공유하세요! 🚀**
