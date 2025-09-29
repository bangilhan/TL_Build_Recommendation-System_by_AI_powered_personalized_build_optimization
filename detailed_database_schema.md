# Throne and Liberty 빌드 추천 시스템 - 상세 데이터베이스 스키마

## 1. 빌드 테이블 (builds)

### 기본 정보
```sql
CREATE TABLE builds (
    id BIGINT PRIMARY KEY,
    character_id BIGINT,
    name VARCHAR(255),
    description TEXT,
    level INT,
    role_tags JSON, -- ["dps", "tank", "support"]
    privacy VARCHAR(20), -- "public", "private", "temp"
    publisher VARCHAR(50), -- "ags", "user"
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    rating_average DECIMAL(3,2),
    rating_amount INT,
    view_count INT,
    is_featured BOOLEAN DEFAULT FALSE
);
```

### 수집 가능한 구체적 항목들
- **캐릭터 기본 정보**: 이름, 레벨, 역할 태그, 설명
- **메타데이터**: 생성일, 수정일, 평점, 조회수
- **공개 설정**: 공개/비공개, 출처 (공식/사용자)
- **인기도 지표**: 평점, 평가 수, 조회수, 추천 여부

## 2. 아이템 테이블 (equipment_items)

### 기본 구조
```sql
CREATE TABLE equipment_items (
    id VARCHAR(100) PRIMARY KEY, -- 예: "staff_aa_t3_boss_001"
    name_ko VARCHAR(255),
    name_en VARCHAR(255),
    category VARCHAR(50), -- "weapon", "armor", "accessory"
    subcategory VARCHAR(50), -- "staff", "head", "necklace"
    tier VARCHAR(10), -- "t1", "t2", "t3", "t4", "t5"
    grade VARCHAR(20), -- "normal", "boss", "raid", "arena", "set"
    material_type VARCHAR(20), -- "fabric", "leather", "plate" (방어구만)
    level_requirement INT,
    image_url VARCHAR(500),
    description TEXT,
    is_set_item BOOLEAN DEFAULT FALSE,
    set_id VARCHAR(100), -- 세트 아이템인 경우
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 수집 가능한 구체적 항목들

#### 무기 아이템 (Weapons)
- **스태프**: staff_aa_t1_nomal_001 ~ staff_aa_t5_boss_003
- **단검**: dagger_aa_t1_nomal_001 ~ dagger_aa_t5_boss_003
- **검**: sword_aa_t1_nomal_001 ~ sword_aa_t5_boss_004
- **활**: bow_aa_t1_nomal_001 ~ bow_aa_t3_boss_001
- **석궁**: crossbow_aa_t1_nomal_001 ~ crossbow_aa_t5_boss_003
- **완드**: wand_aa_t1_nomal_001 ~ wand_aa_t5_boss_005
- **창**: spear_aa_t1_normal_000 ~ spear_aa_t3_boss_001
- **양손검**: sword2h_aa_t1_nomal_001 ~ sword2h_aa_t5_boss_003
- **오브**: orb_aa_t1_normal_001 ~ orb_aa_t3_boss_001

#### 방어구 아이템 (Armor)
- **머리**: head_fabric/leather/plate_aa_t1~t3_normal/boss/set_001~005
- **가슴**: chest_fabric/leather/plate_aa_t1~t3_normal/boss/set_001~005
- **장갑**: hands_fabric/leather/plate_aa_t1~t3_normal/boss/set_001~005
- **다리**: legs_fabric/leather/plate_aa_t1~t3_normal/boss/set_001~005
- **발**: feet_fabric/leather/plate_aa_t1~t3_normal/boss/set_001~005

#### 액세서리 아이템 (Accessories)
- **목걸이**: necklace_aa_t1_nomal_001 ~ necklace_aa_t3_boss_005
- **반지**: ring_aa_t1_nomal_001 ~ ring_aa_t3_arena_004
- **팔찌**: bracelet_aa_t1_nomal_001 ~ bracelet_aa_t3_boss_006
- **벨트**: belt_aa_t1_nomal_001 ~ belt_aa_t3_boss_006
- **망토**: cloak_aa_t1_nomal_001 ~ cloak_aa_t3_nomal_004
- **귀걸이**: earring_aa_t1_normal_001 ~ earring_aa_t3_boss_002

## 3. 아이템 스탯 테이블 (item_stats)

```sql
CREATE TABLE item_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id VARCHAR(100),
    stat_name VARCHAR(100), -- "str", "dex", "int", "per", "con", "hp_max", "attack_power_main_hand" 등
    stat_value DECIMAL(10,2),
    stat_type VARCHAR(50), -- "base", "bonus", "set_bonus", "rune_bonus"
    FOREIGN KEY (item_id) REFERENCES equipment_items(id)
);
```

### 수집 가능한 구체적 스탯들 (총 200개 이상)

#### 기본 속성 (Primary Attributes)
- **str**: 힘 (Strength)
- **dex**: 민첩 (Dexterity) 
- **int**: 지능 (Intelligence)
- **per**: 지각 (Perception)
- **con**: 체력 (Constitution)

#### 생명력 관련
- **hp_max**: 최대 생명력
- **hp_regen**: 생명력 재생
- **stamina_max**: 최대 스태미나
- **stamina_regen**: 스태미나 재생

#### 공격 관련
- **attack_power_main_hand**: 주무기 공격력
- **attack_power_off_hand**: 보조무기 공격력
- **attack_speed_main_hand**: 주무기 공격속도
- **attack_range_main_hand**: 주무기 사거리
- **melee_critical_attack**: 근접 치명타
- **range_critical_attack**: 원거리 치명타
- **magic_critical_attack**: 마법 치명타

#### 방어 관련
- **melee_armor**: 근접 방어력
- **range_armor**: 원거리 방어력
- **magic_armor**: 마법 방어력
- **shield_block_chance**: 방패 막기 확률

#### 정확도/회피 관련
- **melee_accuracy**: 근접 정확도
- **range_accuracy**: 원거리 정확도
- **magic_accuracy**: 마법 정확도
- **melee_evasion**: 근접 회피
- **range_evasion**: 원거리 회피
- **magic_evasion**: 마법 회피

#### PvP 관련
- **pvp_melee_critical_attack**: PvP 근접 치명타
- **pvp_range_critical_attack**: PvP 원거리 치명타
- **pvp_magic_critical_attack**: PvP 마법 치명타
- **pvp_damage_dealt_modifier**: PvP 피해량 증가
- **pvp_damage_taken_modifier**: PvP 피해량 감소

#### 보스 관련
- **boss_melee_critical_attack**: 보스 근접 치명타
- **boss_range_critical_attack**: 보스 원거리 치명타
- **boss_magic_critical_attack**: 보스 마법 치명타

#### 이동/기타
- **movement_speed_modifier**: 이동속도 증가
- **skill_cooldown_modifier**: 스킬 쿨다운 감소
- **gathering_speed**: 채집 속도
- **adjust_exp_acquired**: 경험치 획득 증가
- **adjust_gold_acquired**: 골드 획득 증가

## 4. 스킬 테이블 (skills)

```sql
CREATE TABLE skills (
    id VARCHAR(100) PRIMARY KEY,
    name_ko VARCHAR(255),
    name_en VARCHAR(255),
    skill_set_id VARCHAR(100),
    weapon_type VARCHAR(50), -- "staff", "dagger", "sword" 등
    skill_type VARCHAR(50), -- "active", "passive", "ultimate"
    cooldown DECIMAL(5,2), -- 초 단위
    cost_type VARCHAR(20), -- "mana", "stamina", "none"
    cost_amount INT,
    range_type VARCHAR(20), -- "melee", "range", "self", "area"
    range_value DECIMAL(5,2),
    description TEXT,
    effects JSON, -- 스킬 효과들
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 수집 가능한 구체적 항목들
- **스킬 세트**: 180개 이상의 스킬 세트
- **스킬 특성**: 350개 이상의 스킬 특성
- **무기별 스킬**: 각 무기 타입별 전용 스킬들
- **스킬 효과**: 데미지, 버프, 디버프, 치유 등

## 5. 스킬 특성 테이블 (skill_traits)

```sql
CREATE TABLE skill_traits (
    id VARCHAR(100) PRIMARY KEY,
    name_ko VARCHAR(255),
    name_en VARCHAR(255),
    skill_id VARCHAR(100),
    trait_type VARCHAR(50), -- "damage", "cooldown", "range", "effect"
    trait_value DECIMAL(10,2),
    description TEXT,
    requirements JSON, -- 특성 활성화 조건
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);
```

## 6. 무기 전문화 테이블 (weapon_specializations)

```sql
CREATE TABLE weapon_specializations (
    id VARCHAR(100) PRIMARY KEY,
    name_ko VARCHAR(255),
    name_en VARCHAR(255),
    weapon_type VARCHAR(50),
    specialization_type VARCHAR(50), -- "damage", "defense", "utility"
    level_requirement INT,
    effects JSON, -- 전문화 효과들
    prerequisites JSON, -- 선행 조건들
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 수집 가능한 구체적 항목들
- **무기 전문화**: 490개 이상의 전문화 옵션
- **무기별 전문화**: 각 무기 타입별 전용 전문화들
- **전문화 효과**: 공격력, 방어력, 유틸리티 등

## 7. 빌드 장비 테이블 (build_equipment)

```sql
CREATE TABLE build_equipment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    build_id BIGINT,
    item_id VARCHAR(100),
    slot VARCHAR(50), -- "main_hand", "off_hand", "head", "chest" 등
    position INT, -- 장비 슬롯 순서
    runes JSON, -- 장착된 룬들
    enhancements JSON, -- 강화 정보
    FOREIGN KEY (build_id) REFERENCES builds(id),
    FOREIGN KEY (item_id) REFERENCES equipment_items(id)
);
```

## 8. 빌드 스킬 테이블 (build_skills)

```sql
CREATE TABLE build_skills (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    build_id BIGINT,
    skill_id VARCHAR(100),
    skill_level INT,
    is_active BOOLEAN DEFAULT TRUE,
    position INT, -- 스킬 슬롯 순서
    FOREIGN KEY (build_id) REFERENCES builds(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);
```

## 9. 빌드 속성 테이블 (build_attributes)

```sql
CREATE TABLE build_attributes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    build_id BIGINT,
    str INT DEFAULT 0,
    dex INT DEFAULT 0,
    int INT DEFAULT 0,
    per INT DEFAULT 0,
    con INT DEFAULT 0,
    total_points INT, -- 총 투자 가능한 속성 포인트
    FOREIGN KEY (build_id) REFERENCES builds(id)
);
```

## 10. 룬 시너지 테이블 (rune_synergies)

```sql
CREATE TABLE rune_synergies (
    id VARCHAR(100) PRIMARY KEY,
    name_ko VARCHAR(255),
    name_en VARCHAR(255),
    synergy_type VARCHAR(50), -- "attack", "defense", "assist"
    required_runes JSON, -- 필요한 룬들
    effects JSON, -- 시너지 효과들
    description TEXT
);
```

### 수집 가능한 구체적 항목들
- **룬 시너지**: 40개 이상의 룬 시너지 조합
- **시너지 타입**: 공격, 방어, 보조별 시너지
- **룬 조합**: 특정 룬들의 조합으로 발동되는 효과

## 11. 아이템 세트 테이블 (item_sets)

```sql
CREATE TABLE item_sets (
    id VARCHAR(100) PRIMARY KEY,
    name_ko VARCHAR(255),
    name_en VARCHAR(255),
    set_type VARCHAR(50), -- "armor", "accessory", "weapon"
    pieces JSON, -- 세트 구성 아이템들
    set_bonuses JSON, -- 2개, 3개, 4개, 5개 착용 시 보너스
    description TEXT
);
```

## 12. 스탯 포맷 테이블 (stat_formats)

```sql
CREATE TABLE stat_formats (
    stat_name VARCHAR(100) PRIMARY KEY,
    display_name_ko VARCHAR(255),
    display_name_en VARCHAR(255),
    stat_type VARCHAR(50), -- "primary", "secondary", "special"
    display_format VARCHAR(50), -- "percentage", "flat", "rating"
    description TEXT
);
```

## 데이터 수집 우선순위

### 1단계 (핵심 데이터)
- 빌드 기본 정보 (builds)
- 아이템 기본 정보 (equipment_items)
- 아이템 스탯 (item_stats)
- 빌드 장비 구성 (build_equipment)

### 2단계 (확장 데이터)
- 스킬 정보 (skills, skill_traits)
- 무기 전문화 (weapon_specializations)
- 빌드 스킬 구성 (build_skills)

### 3단계 (고급 데이터)
- 룬 시너지 (rune_synergies)
- 아이템 세트 (item_sets)
- 스탯 포맷 (stat_formats)

이 스키마를 통해 questlog.gg의 모든 빌드 데이터를 체계적으로 수집하고 관리할 수 있으며, LLM을 통한 정확한 빌드 추천이 가능합니다.
