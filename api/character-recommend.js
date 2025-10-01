const { getBuildRecommendations, getItemRecommendations } = require('./characters');

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

        // 추천 결과 포맷팅
        const recommendations = itemRecommendations.slice(0, 5).map(item => ({
            slot: item.부위,
            currentItem: '현재 장비',
            currentGrade: 1,
            recommendedItem: item.아이템이름,
            improvement: Math.floor(item.값 || 0),
            grade: item.등급,
            option: item.옵션명
        }));

        const totalImprovement = recommendations.reduce((sum, rec) => sum + rec.improvement, 0);

        res.json({
            success: true,
            characterId: characterId,
            currentEquipment: [],
            currentStats: [],
            equipmentAnalysis: {
                weakestSlots: recommendations
            },
            recommendations: recommendations,
            buildRecommendations: buildRecommendations,
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
