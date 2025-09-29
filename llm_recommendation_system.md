# LLM 기반 개인화 빌드 추천 시스템 구현 방안

## 1. 시스템 아키텍처

### 전체 플로우
```
사용자 입력 → LLM 분석 → 데이터베이스 조회 → 추천 생성 → 결과 제공
```

### 핵심 컴포넌트
1. **사용자 입력 파싱 모듈**
2. **빌드 분석 엔진**
3. **LLM 추천 엔진**
4. **데이터베이스 연동**
5. **결과 포맷팅**

## 2. 사용자 입력 처리

### 입력 예시
```
"현재 레벨 55, 단검+스태프 조합으로 PvP 딜러를 하고 있어요. 
최근에 T3 보스 목걸이를 얻었는데, 기존 빌드에 어떻게 적용하면 좋을까요? 
현재 착용 중인 목걸이는 T2 세트 목걸이입니다."
```

### 파싱 결과
```json
{
  "user_profile": {
    "level": 55,
    "weapon_combo": ["dagger", "staff"],
    "role": "dps",
    "pvp_focus": true
  },
  "current_equipment": {
    "necklace": "necklace_aa_t2_set_001"
  },
  "new_item": {
    "item_id": "necklace_aa_t3_boss_001",
    "item_name": "T3 보스 목걸이"
  },
  "question_type": "equipment_upgrade"
}
```

## 3. LLM 분석 프로세스

### 3.1 현재 빌드 분석
```python
def analyze_current_build(user_profile, current_equipment):
    # 1. 현재 장비의 스탯 분석
    current_stats = get_item_stats(current_equipment)
    
    # 2. 인기 상위 빌드와 비교
    popular_builds = get_popular_builds(
        level=user_profile['level'],
        weapon_combo=user_profile['weapon_combo'],
        role=user_profile['role']
    )
    
    # 3. 현재 빌드의 강점/약점 파악
    build_analysis = {
        "strengths": identify_strengths(current_stats, popular_builds),
        "weaknesses": identify_weaknesses(current_stats, popular_builds),
        "stat_gaps": calculate_stat_gaps(current_stats, popular_builds)
    }
    
    return build_analysis
```

### 3.2 신규 아이템 분석
```python
def analyze_new_item(item_id, user_profile):
    # 1. 아이템 기본 정보 조회
    item_info = get_item_details(item_id)
    
    # 2. 스탯 변화 예측
    stat_changes = calculate_stat_changes(
        current_item=user_profile['current_equipment']['necklace'],
        new_item=item_id
    )
    
    # 3. 세트 효과 영향 분석
    set_effect_impact = analyze_set_effect_impact(
        current_set=user_profile['current_set'],
        new_item=item_id
    )
    
    # 4. 룬 시너지 분석
    rune_synergy = analyze_rune_synergy(
        current_runes=user_profile['current_runes'],
        new_item=item_id
    )
    
    return {
        "item_info": item_info,
        "stat_changes": stat_changes,
        "set_effect_impact": set_effect_impact,
        "rune_synergy": rune_synergy
    }
```

## 4. LLM 프롬프트 설계

### 4.1 메인 추천 프롬프트
```
당신은 Throne and Liberty 게임의 빌드 전문가입니다.

사용자 정보:
- 레벨: {user_level}
- 무기 조합: {weapon_combo}
- 역할: {role}
- PvP 집중도: {pvp_focus}

현재 빌드 분석:
{current_build_analysis}

신규 아이템 정보:
{new_item_analysis}

인기 상위 빌드 데이터:
{popular_builds_data}

다음과 같은 형식으로 추천을 제공해주세요:

1. **현재 빌드 평가**
   - 강점: [구체적 스탯과 수치]
   - 약점: [개선이 필요한 부분]

2. **신규 아이템 도입 효과**
   - 능력치 변화: [구체적 수치 변화]
   - 세트 효과 영향: [세트 보너스 변화]
   - 룬 시너지: [룬 조합 효과]

3. **추천 조치사항**
   - 즉시 적용 가능한 변경사항
   - 추가로 필요한 아이템
   - 스킬/전문화 조정 제안

4. **획득 경로 정보**
   - 아이템 획득 방법
   - 예상 비용/시간
   - 대안 아이템 제안
```

### 4.2 구체적 예시 응답
```
**현재 빌드 평가**
- 강점: 공격력 1,200 (상위 15%), 치명타 35% (상위 20%)
- 약점: 생존력 800 (하위 30%), PvP 방어력 부족

**신규 아이템 도입 효과**
- 능력치 변화: 
  * 공격력 +150 (+12.5%)
  * 생존력 +200 (+25%)
  * PvP 치명타 +8% (+23%)
- 세트 효과 영향: T2 세트 보너스 손실, T3 보스 아이템 단독 효과 획득
- 룬 시너지: 현재 룬과 시너지로 추가 +5% 공격력

**추천 조치사항**
1. 즉시 적용: T3 보스 목걸이 착용 권장
2. 추가 필요: T3 보스 반지로 교체하여 세트 효과 복구
3. 스킬 조정: 생존 스킬 우선순위 상향

**획득 경로 정보**
- T3 보스 목걸이: [특정 던전] 보스 드롭 (5% 확률)
- 예상 비용: 거래소 500만 골드
- 대안: T3 일반 목걸이 (성능 80% 수준)
```

## 5. 데이터베이스 쿼리 예시

### 5.1 인기 상위 빌드 조회
```sql
SELECT 
    b.id, b.name, b.rating_average, b.view_count,
    be.item_id, be.slot,
    i.name_ko, i.tier, i.grade,
    s.stat_name, s.stat_value
FROM builds b
JOIN build_equipment be ON b.id = be.build_id
JOIN equipment_items i ON be.item_id = i.id
JOIN item_stats s ON i.id = s.item_id
WHERE b.level = ? 
  AND b.role_tags LIKE '%dps%'
  AND b.rating_average >= 4.0
ORDER BY b.rating_average DESC, b.view_count DESC
LIMIT 20;
```

### 5.2 아이템 획득 경로 조회
```sql
SELECT 
    i.name_ko,
    i.tier,
    i.grade,
    d.dungeon_name,
    d.boss_name,
    d.drop_rate,
    m.monster_name,
    m.location
FROM equipment_items i
LEFT JOIN item_drops d ON i.id = d.item_id
LEFT JOIN monster_drops m ON i.id = m.item_id
WHERE i.id = ?;
```

### 5.3 스탯 변화 계산
```sql
SELECT 
    current.stat_name,
    current.stat_value as current_value,
    new.stat_value as new_value,
    (new.stat_value - current.stat_value) as stat_change,
    (new.stat_value - current.stat_value) / current.stat_value * 100 as percentage_change
FROM item_stats current
JOIN item_stats new ON current.stat_name = new.stat_name
WHERE current.item_id = ? AND new.item_id = ?;
```

## 6. 구현 코드 예시

### 6.1 메인 추천 함수
```python
async def generate_build_recommendation(user_input):
    # 1. 사용자 입력 파싱
    user_profile = parse_user_input(user_input)
    
    # 2. 현재 빌드 분석
    current_analysis = await analyze_current_build(user_profile)
    
    # 3. 신규 아이템 분석
    new_item_analysis = await analyze_new_item(
        user_profile['new_item']['item_id'], 
        user_profile
    )
    
    # 4. 인기 빌드 데이터 조회
    popular_builds = await get_popular_builds(user_profile)
    
    # 5. LLM 추천 생성
    recommendation = await llm_recommend(
        user_profile=user_profile,
        current_analysis=current_analysis,
        new_item_analysis=new_item_analysis,
        popular_builds=popular_builds
    )
    
    # 6. 획득 경로 정보 추가
    acquisition_info = await get_acquisition_info(
        user_profile['new_item']['item_id']
    )
    
    return {
        "recommendation": recommendation,
        "acquisition_info": acquisition_info,
        "confidence_score": calculate_confidence(current_analysis, new_item_analysis)
    }
```

### 6.2 LLM 호출 함수
```python
async def llm_recommend(user_profile, current_analysis, new_item_analysis, popular_builds):
    prompt = build_recommendation_prompt(
        user_profile=user_profile,
        current_analysis=current_analysis,
        new_item_analysis=new_item_analysis,
        popular_builds=popular_builds
    )
    
    response = await openai.ChatCompletion.acreate(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 Throne and Liberty 빌드 전문가입니다."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000
    )
    
    return parse_llm_response(response.choices[0].message.content)
```

## 7. 고급 기능

### 7.1 실시간 빌드 비교
- 사용자 빌드와 인기 빌드 간 실시간 비교
- 스탯 차이를 시각적으로 표시
- 개선 우선순위 제안

### 7.2 시뮬레이션 기능
- 아이템 교체 시 능력치 변화 시뮬레이션
- 여러 아이템 조합의 효과 비교
- 최적 조합 자동 탐색

### 7.3 메타 추적
- 현재 메타 트렌드 분석
- 패치별 빌드 변화 추적
- 계절별 인기 빌드 추천

## 8. 성능 최적화

### 8.1 캐싱 전략
- 인기 빌드 데이터 캐싱 (1시간)
- 아이템 스탯 데이터 캐싱 (24시간)
- LLM 응답 캐싱 (유사한 질문)

### 8.2 데이터베이스 최적화
- 인덱스 최적화
- 쿼리 성능 튜닝
- 읽기 전용 복제본 활용

이 시스템을 통해 questlog.gg의 풍부한 데이터를 활용하여 정확하고 개인화된 빌드 추천을 제공할 수 있습니다!
