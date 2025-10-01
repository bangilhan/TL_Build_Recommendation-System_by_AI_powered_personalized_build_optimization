const supabase = require('./supabase');

// 캐릭터 정보 조회
async function getCharacter(serverName, characterName) {
    try {
        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('서버명', serverName)
            .eq('캐릭터이름', characterName)
            .single();

        if (error) {
            console.error('캐릭터 조회 오류:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('캐릭터 조회 예외:', error);
        return null;
    }
}

// 캐릭터의 장비 정보 조회
async function getCharacterEquipment(characterId) {
    try {
        const { data, error } = await supabase
            .from('characters_items')
            .select(`
                *,
                items_info (
                    아이템이름,
                    부위,
                    등급,
                    옵션명,
                    값
                )
            `)
            .eq('캐릭터아이디', characterId);

        if (error) {
            console.error('장비 조회 오류:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('장비 조회 예외:', error);
        return [];
    }
}

// 빌드 추천 조회
async function getBuildRecommendations(characterId, userRequest) {
    try {
        // 사용자 요청에 따른 빌드 필터링
        let query = supabase
            .from('builds')
            .select('*')
            .eq('privacy', 'public')
            .order('rating_average', { ascending: false });

        // 역할 태그로 필터링 (예: dps, tank, support)
        if (userRequest.includes('공격') || userRequest.includes('딜') || userRequest.includes('dps')) {
            query = query.contains('role_tags', ['dps']);
        } else if (userRequest.includes('생존') || userRequest.includes('방어') || userRequest.includes('tank')) {
            query = query.contains('role_tags', ['tank']);
        } else if (userRequest.includes('지원') || userRequest.includes('힐') || userRequest.includes('support')) {
            query = query.contains('role_tags', ['support']);
        }

        const { data, error } = await query.limit(5);

        if (error) {
            console.error('빌드 조회 오류:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('빌드 조회 예외:', error);
        return [];
    }
}

// 아이템 추천 조회
async function getItemRecommendations(characterId, userRequest) {
    try {
        let query = supabase
            .from('items_info')
            .select('*')
            .order('값', { ascending: false });

        // 사용자 요청에 따른 필터링
        if (userRequest.includes('무기')) {
            query = query.eq('부위', '무기');
        } else if (userRequest.includes('방어구')) {
            query = query.in('부위', ['투구', '상의', '하의', '신발', '장갑']);
        } else if (userRequest.includes('액세서리')) {
            query = query.in('부위', ['목걸이', '반지', '팔찌', '벨트', '망토', '귀걸이']);
        }

        const { data, error } = await query.limit(10);

        if (error) {
            console.error('아이템 조회 오류:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('아이템 조회 예외:', error);
        return [];
    }
}

module.exports = {
    getCharacter,
    getCharacterEquipment,
    getBuildRecommendations,
    getItemRecommendations
};
