# Questlog.gg Throne and Liberty 캐릭터 빌더 분석 결과

## 1. 페이지 구조 개요

### 기술 스택
- **프레임워크**: Nuxt.js (Vue.js 기반)
- **API**: tRPC (TypeScript RPC)
- **CDN**: Cloudflare를 통한 정적 자산 제공
- **인증**: Auth.js 기반 세션 관리

### 페이지 URL 구조
```
https://questlog.gg/throne-and-liberty/ko/character-builder/{character-slug}
```

## 2. API 엔드포인트 분석

### 주요 API 엔드포인트들
1. **`/api/trpc/characterBuilder.getCharacter`** - 특정 캐릭터 빌드 정보
2. **`/api/trpc/characterBuilder.getEquipmentItems`** - 장비 아이템 목록
3. **`/api/trpc/characterBuilder.getEquipmentItemSets`** - 장비 세트 정보
4. **`/api/trpc/characterBuilder.getEquipmentRunes`** - 룬 정보
5. **`/api/trpc/characterBuilder.getRuneSynergies`** - 룬 시너지 정보
6. **`/api/trpc/skillBuilder.getSkillSets`** - 스킬 세트 정보
7. **`/api/trpc/skillBuilder.getSkillTraits`** - 스킬 특성 정보
8. **`/api/trpc/weaponSpecialization.getWeaponSpecializations`** - 무기 전문화 정보
9. **`/api/trpc/characterBuilder.getAttributeStats`** - 속성 스탯 정보
10. **`/api/trpc/statFormat.getStatFormat`** - 스탯 포맷 정보

## 3. 데이터 구조 분석

### 캐릭터 정보
```json
{
  "character": {
    "name": "T3 Staff/Dagger - twitch.tv/SirDarkys",
    "url": "RepeatingChestMeditateTwilight",
    "level": 55,
    "privacy": "temp",
    "roleTags": ["dps"],
    "publisher": "ags"
  }
}
```

### 빌드 정보
```json
{
  "builds": [{
    "id": 7003911,
    "name": "T3 Staff/Dagger PvP BiS",
    "attributes": {
      "con": 0,
      "dex": 18,
      "int": 11,
      "per": 16,
      "str": 9
    },
    "equipment": [...],
    "skills": [...]
  }]
}
```

### 장비 아이템 구조
- **무기**: staff, dagger, sword, bow, crossbow, wand, spear, sword2h
- **방어구**: head, chest, hands, legs, feet (fabric, leather, plate)
- **액세서리**: necklace, ring, bracelet, belt, cloak, earring
- **티어**: t1, t2, t3, t4, t5 (일반, 보스, 레이드, 아레나 등)
- **세트**: 각 부위별 세트 아이템들

### 스킬 시스템
- **스킬 세트**: 180개 이상의 스킬 세트
- **스킬 특성**: 350개 이상의 스킬 특성
- **무기 전문화**: 490개 이상의 무기 전문화 옵션

## 4. 데이터 수집 전략

### 1단계: 기본 데이터 수집
```javascript
// 캐릭터 빌드 목록 수집
const characterBuilds = await fetch('/api/trpc/characterBuilder.getCharacterList');

// 장비 아이템 데이터 수집
const equipmentItems = await fetch('/api/trpc/characterBuilder.getEquipmentItems');

// 스킬 데이터 수집
const skillSets = await fetch('/api/trpc/skillBuilder.getSkillSets');
const skillTraits = await fetch('/api/trpc/skillBuilder.getSkillTraits');
```

### 2단계: 빌드 데이터 정규화
- 장비 아이템을 카테고리별로 분류
- 스킬과 무기 전문화를 빌드별로 매핑
- 속성 스탯과 장비 효과를 연결

### 3단계: LLM을 위한 데이터 구조화
```json
{
  "buildDatabase": {
    "characters": [...],
    "equipment": {
      "weapons": [...],
      "armor": [...],
      "accessories": [...]
    },
    "skills": [...],
    "stats": [...],
    "synergies": [...]
  }
}
```

## 5. 추천 시스템 구현 방안

### 데이터베이스 설계
1. **빌드 테이블**: 캐릭터 정보, 속성, 장비, 스킬
2. **아이템 테이블**: 장비 아이템 정보, 스탯, 효과
3. **스킬 테이블**: 스킬 정보, 효과, 쿨다운
4. **시너지 테이블**: 아이템/스킬 조합 효과

### LLM 프롬프트 구조
```
사용자 현재 상태:
- 레벨: 55
- 현재 장비: [장비 목록]
- 역할: DPS
- 신규 아이템: [아이템명]

추천 로직:
1. 현재 빌드 분석
2. 신규 아이템 효과 분석
3. 최적 조합 계산
4. 교체 아이템 제안
5. 근거 설명 생성
```

## 6. 기술적 구현 고려사항

### 웹 스크래핑
- **Rate Limiting**: API 호출 간격 조절 필요
- **세션 관리**: 인증 토큰 유지
- **데이터 업데이트**: 정기적인 데이터 동기화

### 데이터 처리
- **정규화**: 아이템명, 스킬명 통일
- **분류**: 카테고리별 데이터 구조화
- **관계 매핑**: 아이템-스킬-스탯 간 관계 정의

### LLM 통합
- **컨텍스트 관리**: 대용량 빌드 데이터 처리
- **프롬프트 최적화**: 효율적인 추천 로직 설계
- **응답 품질**: 일관성 있는 추천 결과 제공

## 7. 예상 서비스 구조

```
recommendation_based_llm/
├── data_collector/          # questlog.gg 데이터 수집
├── data_processor/          # 데이터 정규화 및 구조화
├── database/               # 빌드 데이터베이스
├── llm_service/           # LLM 추천 서비스
├── api/                   # REST API 서버
└── frontend/              # 사용자 인터페이스
```

## 8. 다음 단계

1. **데이터 수집기 개발**: questlog.gg API 연동
2. **데이터베이스 설계**: 빌드 데이터 저장 구조
3. **LLM 서비스 개발**: 추천 로직 구현
4. **API 서버 구축**: 사용자 요청 처리
5. **프론트엔드 개발**: 사용자 인터페이스

이 분석을 바탕으로 고급 플레이어를 위한 맞춤형 빌드 최적화 서비스를 구축할 수 있습니다.
