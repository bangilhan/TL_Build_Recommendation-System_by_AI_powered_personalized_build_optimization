const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

// Supabase 연결 정보
const supabaseUrl = 'https://dycuolwtjaectfdzbopb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Y3VvbHd0amFlY3RmZHpib3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDIwODEsImV4cCI6MjA3NDgxODA4MX0.P8HaKFJwBdQGgkeRD_sjlvD0CL_QTxZGl4Hk784hwmY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateToSupabase() {
    try {
        console.log('🚀 Supabase 마이그레이션 시작...');

        // 1. items_info 테이블 생성 및 데이터 삽입
        console.log('📦 items_info 테이블 생성 중...');
        const { error: createItemsError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS items_info (
                    아이템아이디 INTEGER PRIMARY KEY,
                    아이템이름 VARCHAR(255) NOT NULL,
                    부위 VARCHAR(100),
                    등급 VARCHAR(50),
                    옵션명 VARCHAR(100),
                    값 DECIMAL(10,2),
                    생성일 TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        });

        if (createItemsError) {
            console.error('items_info 테이블 생성 실패:', createItemsError);
            return;
        }

        // CSV 데이터 읽기 및 삽입
        console.log('📊 items_info 데이터 삽입 중...');
        const items = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream('items_info.csv')
                .pipe(csv())
                .on('data', (row) => {
                    items.push({
                        아이템아이디: parseInt(row['아이템아이디']),
                        아이템이름: row['아이템이름'],
                        부위: row['부위'],
                        등급: row['등급'],
                        옵션명: row['옵션명'],
                        값: parseFloat(row['값']) || 0,
                        생성일: row['생성일'] || new Date().toISOString()
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // 배치로 데이터 삽입
        const batchSize = 100;
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('items_info')
                .upsert(batch, { onConflict: '아이템아이디' });
            
            if (insertError) {
                console.error(`배치 ${i}-${i + batchSize} 삽입 실패:`, insertError);
            } else {
                console.log(`✅ 배치 ${i}-${i + batchSize} 삽입 완료`);
            }
        }

        // 2. characters 테이블 생성
        console.log('👤 characters 테이블 생성 중...');
        const { error: createCharsError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS characters (
                    캐릭터아이디 SERIAL PRIMARY KEY,
                    캐릭터이름 VARCHAR(100) NOT NULL,
                    서버명 VARCHAR(100),
                    레벨 INTEGER DEFAULT 1,
                    클래스 VARCHAR(50),
                    생성일 TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        });

        if (createCharsError) {
            console.error('characters 테이블 생성 실패:', createCharsError);
        }

        // 3. characters_items 테이블 생성
        console.log('⚔️ characters_items 테이블 생성 중...');
        const { error: createCharItemsError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS characters_items (
                    착용아이디 SERIAL PRIMARY KEY,
                    캐릭터아이디 INTEGER NOT NULL,
                    아이템아이디 INTEGER NOT NULL,
                    부위 VARCHAR(100) NOT NULL,
                    착용일 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (캐릭터아이디) REFERENCES characters(캐릭터아이디) ON DELETE CASCADE,
                    FOREIGN KEY (아이템아이디) REFERENCES items_info(아이템아이디) ON DELETE RESTRICT,
                    UNIQUE(캐릭터아이디, 부위)
                );
            `
        });

        if (createCharItemsError) {
            console.error('characters_items 테이블 생성 실패:', createCharItemsError);
        }

        // 4. 샘플 캐릭터 데이터 삽입
        console.log('👥 샘플 캐릭터 데이터 삽입 중...');
        const sampleCharacters = [
            { 캐릭터이름: '아르테미스', 서버명: '루시안', 레벨: 50, 클래스: '궁수' },
            { 캐릭터이름: '발키리', 서버명: '루시안', 레벨: 45, 클래스: '전사' },
            { 캐릭터이름: '레이븐', 서버명: '루시안', 레벨: 48, 클래스: '마법사' },
            { 캐릭터이름: '드레이크', 서버명: '루시안', 레벨: 52, 클래스: '성기사' },
            { 캐릭터이름: '세라핀', 서버명: '루시안', 레벨: 47, 클래스: '도적' }
        ];

        const { data: insertedChars, error: insertCharsError } = await supabase
            .from('characters')
            .insert(sampleCharacters)
            .select();

        if (insertCharsError) {
            console.error('캐릭터 데이터 삽입 실패:', insertCharsError);
        } else {
            console.log('✅ 캐릭터 데이터 삽입 완료:', insertedChars);
        }

        // 5. 샘플 장비 데이터 삽입
        console.log('⚔️ 샘플 장비 데이터 삽입 중...');
        const sampleEquipment = [
            { 캐릭터아이디: 1, 아이템아이디: 423, 부위: '무기' },
            { 캐릭터아이디: 1, 아이템아이디: 425, 부위: '투구' },
            { 캐릭터아이디: 1, 아이템아이디: 426, 부위: '상의' },
            { 캐릭터아이디: 1, 아이템아이디: 427, 부위: '신발' },
            { 캐릭터아이디: 1, 아이템아이디: 428, 부위: '목걸이' }
        ];

        const { error: insertEquipError } = await supabase
            .from('characters_items')
            .insert(sampleEquipment);

        if (insertEquipError) {
            console.error('장비 데이터 삽입 실패:', insertEquipError);
        } else {
            console.log('✅ 장비 데이터 삽입 완료');
        }

        console.log('🎉 Supabase 마이그레이션 완료!');

    } catch (error) {
        console.error('❌ 마이그레이션 실패:', error);
    }
}

migrateToSupabase();

