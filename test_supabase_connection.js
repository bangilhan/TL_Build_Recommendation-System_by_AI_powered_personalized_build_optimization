const { createClient } = require('@supabase/supabase-js');

// 제공해주신 Supabase 정보
const supabaseUrl = 'https://dycuolwtjaectfdzbopb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Y3VvbHd0amFlY3RmZHpib3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDIwODEsImV4cCI6MjA3NDgxODA4MX0.P8HaKFJwBdQGgkeRD_sjlvD0CL_QTxZGl4Hk784hwmY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('🔗 Supabase 연결 테스트 중...');
        
        // 간단한 쿼리로 연결 테스트
        const { data, error } = await supabase
            .from('items_info')
            .select('*')
            .limit(1);
            
        if (error) {
            console.log('❌ 연결 실패:', error.message);
            console.log('테이블이 없을 수 있습니다. 테이블을 생성하겠습니다...');
            
            // 테이블 생성 시도
            await createTables();
        } else {
            console.log('✅ 연결 성공!');
            console.log('데이터:', data);
        }
        
    } catch (err) {
        console.error('❌ 연결 오류:', err);
    }
}

async function createTables() {
    try {
        console.log('📦 테이블 생성 중...');
        
        // items_info 테이블 생성
        const { error: itemsError } = await supabase.rpc('exec', {
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
        
        if (itemsError) {
            console.log('items_info 테이블 생성 실패:', itemsError);
        } else {
            console.log('✅ items_info 테이블 생성 완료');
        }
        
        // characters 테이블 생성
        const { error: charsError } = await supabase.rpc('exec', {
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
        
        if (charsError) {
            console.log('characters 테이블 생성 실패:', charsError);
        } else {
            console.log('✅ characters 테이블 생성 완료');
        }
        
        // characters_items 테이블 생성
        const { error: charItemsError } = await supabase.rpc('exec', {
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
        
        if (charItemsError) {
            console.log('characters_items 테이블 생성 실패:', charItemsError);
        } else {
            console.log('✅ characters_items 테이블 생성 완료');
        }
        
    } catch (err) {
        console.error('❌ 테이블 생성 오류:', err);
    }
}

testConnection();

