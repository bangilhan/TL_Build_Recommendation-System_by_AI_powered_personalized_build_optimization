const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

// Supabase 연결 정보
const supabaseUrl = 'https://dycuolwtjaectfdzbopb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Y3VvbHd0amFlY3RmZHpib3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDIwODEsImV4cCI6MjA3NDgxODA4MX0.P8HaKFJwBdQGgkeRD_sjlvD0CL_QTxZGl4Hk784hwmY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateItemsData() {
    try {
        console.log('🚀 items_info 데이터 마이그레이션 시작...');
        
        const items = [];
        const csvContent = fs.readFileSync('items_info.csv', 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            const columns = line.split(',');
            if (columns.length >= 8) {
                items.push({
                    아이템아이디: parseInt(columns[0]),
                    아이템이름: columns[1],
                    부위: columns[2],
                    등급: columns[3],
                    옵션명: columns[4],
                    값: parseFloat(columns[5]) || 0,
                    생성일: columns[7] || new Date().toISOString()
                });
            }
        }

        console.log(`📊 총 ${items.length}개의 아이템 데이터를 읽었습니다.`);

        // 배치로 데이터 삽입
        const batchSize = 50;
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('items_info')
                .upsert(batch, { onConflict: '아이템아이디' });
            
            if (insertError) {
                console.error(`❌ 배치 ${i}-${i + batchSize} 삽입 실패:`, insertError);
            } else {
                console.log(`✅ 배치 ${i}-${i + batchSize} 삽입 완료`);
            }
        }

        console.log('🎉 items_info 데이터 마이그레이션 완료!');

    } catch (error) {
        console.error('❌ 마이그레이션 실패:', error);
    }
}

async function migrateBuildsData() {
    try {
        console.log('🚀 builds 데이터 마이그레이션 시작...');
        
        const questlogData = JSON.parse(fs.readFileSync('questlog_all_data.json', 'utf8'));
        const characters = questlogData.characters || [];
        
        console.log(`📊 총 ${characters.length}개의 빌드 데이터를 읽었습니다.`);

        // 빌드 데이터 변환
        const builds = characters.map(char => ({
            id: char.id,
            character_id: char.id,
            name: char.name,
            description: char.desc || '',
            level: char.level || 0,
            role_tags: char.roleTags || [],
            privacy: char.privacy || 'public',
            publisher: char.publisher || 'user',
            created_at: char.createdAt || new Date().toISOString(),
            updated_at: char.updatedAt || new Date().toISOString(),
            rating_average: char.ratingAverage || 0,
            rating_amount: char.ratingAmount || 0,
            view_count: 0,
            is_featured: false
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

async function migrateAllData() {
    await migrateItemsData();
    await migrateBuildsData();
}

migrateAllData();
