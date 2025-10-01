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
        // JSON 연산자 문제를 피하기 위해 간단한 조회로 변경
        let query = supabase
            .from('builds')
            .select('*')
            .eq('privacy', 'public')
            .order('rating_average', { ascending: false })
            .limit(10);

        const { data, error } = await query;

        if (error) {
            console.error('빌드 조회 오류:', error);
            return [];
        }

        // 클라이언트 사이드에서 필터링
        let filteredData = data || [];
        
        if (userRequest.includes('공격') || userRequest.includes('딜') || userRequest.includes('dps')) {
            filteredData = filteredData.filter(build => 
                build.role_tags && 
                Array.isArray(build.role_tags) && 
                build.role_tags.includes('dps')
            );
        } else if (userRequest.includes('생존') || userRequest.includes('방어') || userRequest.includes('tank')) {
            filteredData = filteredData.filter(build => 
                build.role_tags && 
                Array.isArray(build.role_tags) && 
                build.role_tags.includes('tank')
            );
        } else if (userRequest.includes('지원') || userRequest.includes('힐') || userRequest.includes('support')) {
            filteredData = filteredData.filter(build => 
                build.role_tags && 
                Array.isArray(build.role_tags) && 
                build.role_tags.includes('support')
            );
        }

        return filteredData.slice(0, 5);
    } catch (error) {
        console.error('빌드 조회 예외:', error);
        return [];
    }
}

// 아이템 추천 조회 - 개선된 버전
async function getItemRecommendations(characterId, userRequest) {
    try {
        console.log('아이템 추천 조회 시작, characterId:', characterId, 'userRequest:', userRequest);
        
        // 기본 쿼리 - 모든 아이템 조회
        let query = supabase
            .from('items_info')
            .select('*');

        // 사용자 요청에 따른 구체적인 필터링
        if (userRequest.includes('무기') || userRequest.includes('공격') || userRequest.includes('딜')) {
            query = query.eq('부위', '무기');
            console.log('무기 필터 적용');
        } else if (userRequest.includes('방어구') || userRequest.includes('생존') || userRequest.includes('방어')) {
            query = query.in('부위', ['투구', '상의', '하의', '신발', '장갑']);
            console.log('방어구 필터 적용');
        } else if (userRequest.includes('액세서리') || userRequest.includes('마나') || userRequest.includes('스킬')) {
            query = query.in('부위', ['목걸이', '반지', '팔찌', '벨트', '망토', '귀걸이']);
            console.log('액세서리 필터 적용');
        } else {
            // 기본적으로 모든 부위에서 추천
            console.log('전체 부위에서 추천');
        }

        // 등급별 필터링 (고급 아이템 우선)
        if (userRequest.includes('고급') || userRequest.includes('레어') || userRequest.includes('에픽')) {
            query = query.in('등급', ['레어', '에픽', '전설']);
            console.log('고급 등급 필터 적용');
        }

        const { data, error } = await query.limit(20); // 더 많은 아이템 조회

        if (error) {
            console.error('아이템 조회 오류:', error);
            return [];
        }

        const items = data || [];
        console.log('조회된 아이템 수:', items.length);

        // 동적 정렬 및 선택
        let sortedItems = [...items];
        
        // 값 기준으로 정렬하되, 약간의 랜덤성을 추가
        sortedItems.sort((a, b) => {
            const valueA = parseFloat(a.값) || 0;
            const valueB = parseFloat(b.값) || 0;
            const randomFactor = Math.random() * 0.1; // 10% 랜덤 요소
            return (valueB + randomFactor) - (valueA + randomFactor);
        });

        // 부위별로 균등하게 선택 (다양성 확보)
        const selectedItems = [];
        const slotCount = {};
        
        for (const item of sortedItems) {
            const slot = item.부위;
            if (!slotCount[slot]) {
                slotCount[slot] = 0;
            }
            
            // 각 부위당 최대 2개까지만 선택
            if (slotCount[slot] < 2) {
                selectedItems.push(item);
                slotCount[slot]++;
            }
            
            if (selectedItems.length >= 8) break; // 최대 8개 아이템
        }

        console.log('선택된 아이템 수:', selectedItems.length);
        return selectedItems;
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
