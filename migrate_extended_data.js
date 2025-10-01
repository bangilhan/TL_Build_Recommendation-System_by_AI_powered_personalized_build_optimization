const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase 연결 정보
const supabaseUrl = 'https://dycuolwtjaectfdzbopb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Y3VvbHd0amFlY3RmZHpib3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDIwODEsImV4cCI6MjA3NDgxODA4MX0.P8HaKFJwBdQGgkeRD_sjlvD0CL_QTxZGl4Hk784hwmY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateCharactersData() {
    try {
        console.log('🚀 characters 데이터 마이그레이션 시작...');
        
        const charactersData = JSON.parse(fs.readFileSync('questlog_characters.json', 'utf8'));
        console.log(`📊 총 ${charactersData.length}개의 캐릭터 데이터를 읽었습니다.`);

        // 캐릭터 데이터 변환
        const characters = charactersData.map(char => ({
            캐릭터아이디: char.id,
            캐릭터이름: char.name,
            서버명: '루시안', // 기본값
            레벨: char.level || 1,
            클래스: char.class || '미정',
            생성일: char.createdAt || new Date().toISOString()
        }));

        // 배치로 데이터 삽입
        const batchSize = 100;
        for (let i = 0; i < characters.length; i += batchSize) {
            const batch = characters.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('characters')
                .upsert(batch, { onConflict: '캐릭터아이디' });
            
            if (insertError) {
                console.error(`❌ 배치 ${i}-${i + batchSize} 삽입 실패:`, insertError);
            } else {
                console.log(`✅ 배치 ${i}-${i + batchSize} 삽입 완료`);
            }
        }

        console.log('🎉 characters 데이터 마이그레이션 완료!');

    } catch (error) {
        console.error('❌ 캐릭터 마이그레이션 실패:', error);
    }
}

async function migrateBuildsData() {
    try {
        console.log('🚀 builds 데이터 마이그레이션 시작...');
        
        const buildsData = JSON.parse(fs.readFileSync('questlog_builds.json', 'utf8'));
        console.log(`📊 총 ${buildsData.length}개의 빌드 데이터를 읽었습니다.`);

        // 빌드 데이터 변환
        const builds = buildsData.map(build => ({
            id: build.id,
            character_id: build.characterId,
            name: build.name,
            description: build.note || '',
            level: build.level || 0,
            role_tags: build.roleTags || [],
            privacy: build.privacy || 'public',
            publisher: build.publisher || 'user',
            created_at: build.createdAt || new Date().toISOString(),
            updated_at: build.updatedAt || new Date().toISOString(),
            rating_average: build.ratingAverage || 0,
            rating_amount: build.ratingAmount || 0,
            view_count: build.viewCount || 0,
            is_featured: build.isFeatured || false
        }));

        // 배치로 데이터 삽입
        const batchSize = 100;
        for (let i = 0; i < builds.length; i += batchSize) {
            const batch = builds.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('builds')
                .upsert(batch, { onConflict: 'id' });
            
            if (insertError) {
                console.error(`❌ 배치 ${i}-${i + batchSize} 삽입 실패:`, insertError);
            } else {
                console.log(`✅ 배치 ${i}-${i + batchSize} 삽입 완료`);
            }
        }

        console.log('🎉 builds 데이터 마이그레이션 완료!');

    } catch (error) {
        console.error('❌ 빌드 마이그레이션 실패:', error);
    }
}

async function migrateEquipmentItemsData() {
    try {
        console.log('🚀 equipment_items 데이터 마이그레이션 시작...');
        
        // TLCodex 데이터 파일들 확인
        const dataFiles = [
            'tlcodex_weapons.json',
            'tlcodex_armor.json',
            'tlcodex_accessories.json',
            'tlcodex_artifacts.json',
            'tlcodex_itemSets.json',
            'tlcodex_runes.json',
            'tlcodex_skills.json'
        ];

        let allItems = [];

        for (const file of dataFiles) {
            if (fs.existsSync(file)) {
                console.log(`📁 ${file} 처리 중...`);
                const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                
                if (Array.isArray(data)) {
                    allItems = allItems.concat(data);
                } else if (data.items && Array.isArray(data.items)) {
                    allItems = allItems.concat(data.items);
                }
            }
        }

        console.log(`📊 총 ${allItems.length}개의 장비 아이템 데이터를 읽었습니다.`);

        // 장비 아이템 데이터 변환
        const equipmentItems = allItems.map(item => ({
            id: item.id || item.itemId || `item_${Math.random().toString(36).substr(2, 9)}`,
            name_ko: item.name || item.nameKo || item.name_ko,
            name_en: item.nameEn || item.name_en,
            category: item.category || 'unknown',
            subcategory: item.subcategory || item.type || 'unknown',
            tier: item.tier || 't1',
            grade: item.grade || 'normal',
            material_type: item.materialType || item.material_type,
            level_requirement: item.levelRequirement || item.level_requirement || 1,
            image_url: item.imageUrl || item.image_url,
            description: item.description || '',
            is_set_item: item.isSetItem || item.is_set_item || false,
            set_id: item.setId || item.set_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // 배치로 데이터 삽입
        const batchSize = 100;
        for (let i = 0; i < equipmentItems.length; i += batchSize) {
            const batch = equipmentItems.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('equipment_items')
                .upsert(batch, { onConflict: 'id' });
            
            if (insertError) {
                console.error(`❌ 배치 ${i}-${i + batchSize} 삽입 실패:`, insertError);
            } else {
                console.log(`✅ 배치 ${i}-${i + batchSize} 삽입 완료`);
            }
        }

        console.log('🎉 equipment_items 데이터 마이그레이션 완료!');

    } catch (error) {
        console.error('❌ 장비 아이템 마이그레이션 실패:', error);
    }
}

async function migrateAllExtendedData() {
    await migrateCharactersData();
    await migrateBuildsData();
    await migrateEquipmentItemsData();
}

migrateAllExtendedData();
