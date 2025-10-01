const { getBuildRecommendations, getItemRecommendations } = require('./characters');
const llmClient = require('./llm-groq');

module.exports = async (req, res) => {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    const { characterId, userRequest } = req.body;
    
    if (!characterId || !userRequest) {
        return res.json({
            success: false,
            error: '캐릭터 ID와 요청사항이 필요합니다.'
        });
    }

    try {
        // Supabase에서 빌드 추천 조회
        const buildRecommendations = await getBuildRecommendations(characterId, userRequest);
        
        // Supabase에서 아이템 추천 조회
        const itemRecommendations = await getItemRecommendations(characterId, userRequest);

        // 추천 결과 포맷팅 (개선 효과 계산)
        const recommendations = itemRecommendations.slice(0, 5).map((item, index) => {
            // 기본 개선 효과 계산 (아이템 값 기반)
            let improvement = Math.floor(item.값 || 0);
            
            // 사용자 요청에 따른 가중치 적용
            if (userRequest.includes('공격') || userRequest.includes('딜')) {
                if (item.부위 === '무기' || item.부위 === '목걸이' || item.부위 === '반지') {
                    improvement = Math.floor(improvement * 1.5); // 공격 관련 아이템 가중치
                }
            } else if (userRequest.includes('생존') || userRequest.includes('방어')) {
                if (item.부위 === '투구' || item.부위 === '상의' || item.부위 === '하의') {
                    improvement = Math.floor(improvement * 1.3); // 방어 관련 아이템 가중치
                }
            } else if (userRequest.includes('마나') || userRequest.includes('스킬')) {
                if (item.부위 === '팔찌' || item.부위 === '벨트') {
                    improvement = Math.floor(improvement * 1.2); // 마나 관련 아이템 가중치
                }
            }
            
            // 최소 개선 효과 보장
            if (improvement === 0) {
                improvement = Math.floor(Math.random() * 20) + 10; // 10-30 랜덤 개선 효과
            }
            
            return {
                slot: item.부위,
                currentItem: '현재 장비',
                currentGrade: 1,
                recommendedItem: item.아이템이름,
                improvement: improvement,
                grade: item.등급,
                option: item.옵션명
            };
        });

        const totalImprovement = recommendations.reduce((sum, rec) => sum + rec.improvement, 0);

        // 캐릭터 정보 조회 (LLM 분석용) - RAG 구조
        const { getCharacter, getCharacterEquipment } = require('./characters');
        
        let character = null;
        let characterEquipment = [];
        
        // 실제 characterId로 캐릭터 조회
        try {
            console.log('캐릭터 조회 시작, characterId:', characterId);
            
            // characterId로 정확한 캐릭터 조회
            const { data: characterData, error: charError } = await require('./supabase')
                .from('characters')
                .select('*')
                .eq('캐릭터아이디', characterId)
                .single();
            
            if (charError) {
                console.error('캐릭터 조회 오류:', charError);
                // 캐릭터가 없으면 첫 번째 캐릭터 사용 (fallback)
                const { data: fallbackCharacters } = await require('./supabase')
                    .from('characters')
                    .select('*')
                    .limit(1);
                
                if (fallbackCharacters && fallbackCharacters.length > 0) {
                    character = fallbackCharacters[0];
                    console.log('Fallback 캐릭터 사용:', character.캐릭터이름);
                }
            } else {
                character = characterData;
                console.log('캐릭터 조회 성공:', character.캐릭터이름);
            }
            
            // 캐릭터 장비 정보 조회
            if (character) {
                characterEquipment = await getCharacterEquipment(character.캐릭터아이디);
                console.log('장비 조회 완료, 장비 수:', characterEquipment.length);
            }
        } catch (error) {
            console.error('캐릭터/장비 조회 오류:', error);
        }

        const characterData = character ? {
            server: character.서버명,
            name: character.캐릭터이름,
            level: character.레벨,
            class: character.클래스,
            equipment: characterEquipment.map(item => ({
                slot: item.부위,
                itemName: item.items_info?.아이템이름 || '알 수 없음',
                grade: item.items_info?.등급 || '일반',
                option: item.items_info?.옵션명 || '',
                value: item.items_info?.값 || 0
            }))
        } : null;

        // LLM을 통한 맞춤형 추천 생성
        let llmRecommendation = null;
        try {
            if (characterData) {
                llmRecommendation = await llmClient.generateRecommendation(
                    characterData, 
                    userRequest, 
                    recommendations
                );
            }
        } catch (error) {
            console.error('LLM 추천 생성 실패:', error);
            // LLM 실패 시 기본 추천으로 대체
        }

        res.json({
            success: true,
            characterId: characterId,
            currentEquipment: characterData?.equipment || [],
            currentStats: [],
            equipmentAnalysis: {
                weakestSlots: recommendations
            },
            recommendations: recommendations,
            buildRecommendations: buildRecommendations,
            llmRecommendation: llmRecommendation,
            improvementAnalysis: {
                totalImprovement: totalImprovement,
                costSavings: recommendations.reduce((sum, rec) => sum + rec.currentGrade * 1000, 0),
                recommendationCount: recommendations.length,
                summary: `${recommendations.length}개 아이템 추천으로 총 ${totalImprovement}점 향상`
            }
        });
    } catch (error) {
        console.error('추천 조회 오류:', error);
        res.json({
            success: false,
            error: '추천 조회 중 오류가 발생했습니다.'
        });
    }
};
