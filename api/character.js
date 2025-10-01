const { getCharacter, getCharacterEquipment } = require('./characters');

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

    const { serverName, characterName } = req.body;
    
    if (!serverName || !characterName) {
        return res.json({
            success: false,
            error: '서버명과 캐릭터명이 필요합니다.'
        });
    }

    try {
        // Supabase에서 캐릭터 정보 조회
        const character = await getCharacter(serverName, characterName);
        
        if (!character) {
            return res.json({
                success: false,
                error: '캐릭터를 찾을 수 없습니다.'
            });
        }

        // 캐릭터의 장비 정보 조회
        const equipment = await getCharacterEquipment(character.캐릭터아이디);

        res.json({
            success: true,
            characterId: character.캐릭터아이디,
            characterData: {
                server: character.서버명,
                name: character.캐릭터이름,
                level: character.레벨,
                class: character.클래스,
                equipment: equipment.map(item => ({
                    slot: item.부위,
                    itemName: item.items_info?.아이템이름 || '알 수 없음',
                    grade: item.items_info?.등급 || '일반',
                    option: item.items_info?.옵션명 || '',
                    value: item.items_info?.값 || 0
                })),
                lastUpdated: character.생성일
            }
        });
    } catch (error) {
        console.error('캐릭터 조회 오류:', error);
        res.json({
            success: false,
            error: '캐릭터 조회 중 오류가 발생했습니다.'
        });
    }
};
