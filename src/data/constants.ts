import { PromptInputs, RegionalSlangItem } from "../types";

export const DEFAULT_MASCOT_PROMPT = `3D Pixar style, a heroic character made of a glowing plump golden liquid drop, confident expression, rosy cheeks. Wearing a green leaf cape with water droplets tied at the neck. Holding a small glowing twig with green leaves in the right hand. Holding a round golden shield in the left hand with clear typography text '[mascotName]' explicitly engraved on the shield. Surrounded by floating magical glowing particles, soft peach background, magical aura, highly detailed.`;

export const DEFAULT_GLOBAL_SAFETY_RULES = `[GLOBAL SAFETY & BRAND RULES]

All generated content must remain fully compliant with the advertising, monetization, and community guidelines of major platforms including Facebook, TikTok, YouTube, Google Ads, Instagram, and all mainstream social media ecosystems.

The AI must strictly avoid generating any content that may trigger platform rejection, reduced distribution, demonetization, account penalties, or unsafe-content classification.

1.1. STRICTLY PROHIBITED:

* graphic gore
* blood
* exposed organs
* disturbing medical imagery
* body horror
* parasites
* infected flesh
* realistic surgery visuals
* violent injury
* shocking fear-based visuals
* grotesque anatomy
* excessive suffering imagery
* self-harm content
* hateful or discriminatory elements
* sexually suggestive content
* misleading medical claims
* scam-style before/after transformations
* unsafe health guarantees
* prohibited substances or dangerous products
* copyrighted characters, logos, or protected intellectual property unless explicitly provided by the user

1.2. MEDICAL VISUALIZATION RULES:
All anatomy, stomach, inflammation, acid, bacteria, or health-related scenes must remain:

* stylized
* symbolic
* cinematic
* educational
* family-friendly
* non-graphic

Do NOT generate:

* realistic diseased organs
* hyper-realistic infections
* grotesque stomach interiors
* realistic medical trauma
* disgusting biological textures
* horror-style anatomy
* disturbing microscopic organisms

Use ONLY:

* soft glowing symbolic visualization
* Pixar-style abstraction
* cinematic lighting
* clean educational rendering
* emotionally engaging but advertiser-safe presentation

1.3. BRAND CONSISTENCY RULES:

* Maintain clean premium visual quality
* Preserve consistent character identity across all scenes
* Preserve consistent lighting style and color language
* Maintain family-friendly emotional storytelling
* Avoid chaotic compositions or misleading visual exaggeration
* Keep all typography clean, readable, and platform-safe

1.4. IMAGE GENERATION RULES:

* Generate ONLY a single cinematic composition unless explicitly requested otherwise
* Do NOT create collage layouts
* Do NOT recreate storyboard sheets
* Do NOT generate multiple panels
* Do NOT split the frame into thumbnails
* Do NOT duplicate characters unnecessarily

1.5. REFERENCE IMAGE RULES:
Reference images are used ONLY for:

* character identity
* facial consistency
* outfit consistency
* art style
* lighting mood
* color palette

Do NOT replicate:

* storyboard layouts
* frame grids
* collage compositions
* watermark structures
* UI elements
* embedded thumbnails

FINAL SAFETY REQUIREMENT:
All generated visuals must remain emotionally powerful, cinematic, and highly engaging while still being fully advertiser-safe, monetization-safe, family-friendly, and compliant with mainstream platform policies.`;

export const DEFAULT_GLOBAL_CHARACTER_RULES = `[GLOBAL CHARACTER CONSISTENCY & AUTHENTIC ANATOMY RULES]
IMPORTANT:
All recurring characters must remain visually IDENTICAL and anatomically AUTHENTIC across every scene, frame, image, and shot.

This is a continuous cinematic story using the SAME characters throughout the entire sequence.

2.1. MANDATORY CHARACTER CONSISTENCY & REALISTIC AESTHETICS:

* Maintain the EXACT same face: [characterFace]
* Maintain the EXACT same hairstyle: [characterHair]
* Maintain the EXACT same age and gender appearance: [characterAge], [characterGender]
* Mandatory Voice & Character Synchronization: The spoken voice profile ([voice]) MUST logically match the character's age ([characterAge]) and gender ([characterGender]). Never use a senior male voice for a young female lead character.
* Maintain the EXACT same clothing: [characterOutfit]
* Maintain the EXACT same visual identity and rendering style: [videoStyle]
* Mascot Character Identity: If Mascot is present, strictly lock [mascot] engraved on the golden shield with [mascotName].

DO NOT:

* generate cheap plastic doll faces, creepy oversized cartoon bug-eyes, silicone doll skin, or uncanny valley distortions
* change clothing or hairstyle
* change facial structure, gender, or age appearance ([characterAge], [characterGender])
* redesign the character or Mascot ([mascotName])
* generate alternative outfits
* create different versions of the same person
* reinterpret the character design
* randomly add accessories, strange makeup, or bobblehead proportions
* alter body proportions (strictly keep natural human anatomy with realistic posture)

The AI must treat recurring characters as LOCKED cinematic assets with persistent identity consistency and natural human beauty.

ALL scenes must look like they belong to the SAME high-end film production with the SAME characters.

If a character appears again later, the character must remain visually identical to previous scenes unless an explicit transformation is requested.

NO automatic wardrobe changes allowed.
NO automatic character redesign allowed.
NO cinematic reinterpretation allowed.
NO style drift allowed.

Character consistency and authentic facial aesthetics are ABSOLUTELY MANDATORY.

2.2. [VISUAL CONTINUITY RULES]

Maintain:

* identical rendering style: [videoStyle]
* refined human anatomy, lifelike skin shader with natural subsurface scattering and pores
* expressive human eye reflections with genuine emotional depth
* identical color grading (soft warm tones)
* identical cinematic tone
* identical lighting logic for the same environment
* identical character design language

DO NOT:

* recreate characters differently between scenes
* generate new outfits for recurring characters
* alter character silhouettes or body proportions
* distort facial anatomy or create uncanny plastic textures

All recurring characters must preserve 100% identity continuity across the full storyboard.

2.3. [STORYBOARD GENERATION RULES]

Generate ONLY ONE full-screen cinematic image per scene/panel.

DO NOT:

* recreate storyboard sheets
* generate multiple panels
* split images into frames
* create collage layouts
* generate thumbnail grids
* create comic page layouts
* add extra frames
* add storyboard borders

Single cinematic shot only.

Strict Aspect Ratio: --ar [aspectRatio] ([arOrientation]).`;

export const DEFAULT_SLANG_WORDS = `Miền Nam: nè, nghen, nha, coi bộ, êm ru, nhẹ bẫng, liền hà, thiệt tình, cả nhà mình ơi, chị em mình nè, bớt lo liền, nhẹ nhõm hẳn.
Miền Bắc: nhé, nhá, chuẩn bài, êm ru, nhẹ nhõm, cả nhà mình ạ, mình ơi, khéo mà, đấy nhé.
Miền Trung: nghen, rứa nì, thiệt ưng bụng, mấy bạn mình ơi, dịu liền hè.
Miền Tây: nghen, nè, êm re, nhẹ tênh, cả nhà mình ơi, bớt lo nghen.`;

export const DEFAULT_SAFE_WORDS = `QUY TẮC TỪ NGỮ AN TOÀN (SAFE WORDS RULES)
Tuân thủ nghiêm ngặt chính sách nền tảng (TikTok, FB, YT). CẤM sử dụng các từ: thuốc, chữa khỏi, bệnh nhân, điều trị, cam kết... Thay bằng: giải pháp, phục hồi, người dùng, hỗ trợ, xoa dịu, an tâm.`;

export const DEFAULT_PADDING_WORDS = `Axit dạ dày -> lượng axit dư thừa / axit dư trong dạ dày
Vi khuẩn HP -> vi khuẩn có hại trong dạ dày
Niêm mạc -> lớp niêm mạc bảo vệ / màng niêm mạc
Flavonoid / Tanin -> hoạt chất thảo mộc tự nhiên
Tâm vị / Môn vị -> vùng van co bóp dạ dày / van thắt thực quản`;

export const DEFAULT_MANDATORY_IMAGE_RULES = `QUY TẮC HÌNH ẢNH AN TOÀN & ĐỒNG NHẤT BỐI CẢNH (MANDATORY IMAGE & CONTEXT RULES)

1. TUYỆT ĐỐI CẤM LỜI THOẠI TRONG PROMPT TẠO ẢNH (ZERO DIALOGUE IN IMAGE PROMPTS):
- Tuyệt đối CẤM gắn kèm '(Lời thoại: ...)', phụ đề (subtitles), bong bóng thoại (speech bubbles), chữ trích dẫn kịch bản hay bất kỳ câu thoại tiếng Việt/tiếng Anh nào vào nội dung prompt tạo ảnh.
- Prompt tạo ảnh chỉ thuần túy là miêu tả thị giác điện ảnh (Visual Scene Description) bằng tiếng Anh để đưa trực tiếp vào Midjourney / Flux / DALL-E.
- Lời thoại chỉ thuộc về phần Audio / Lồng tiếng hoặc trường 'dialogue' riêng biệt, KHÔNG BAO GIỜ dính vào chuỗi prompt hình ảnh.

2. ĐỊNH DANH CHUẨN XÁC "IMAGE 1", "IMAGE 2" ĐẾN "IMAGE N+1" (AVOID SCENE CONFUSION):
- Tất cả các prompt tạo ảnh đơn lẻ trong Bước 3 BẮT BUỘC đặt tên là 'Image 1', 'Image 2', ..., 'Image N+1' tương ứng với số panel trong Storyboard (N cảnh thoại -> N+1 ảnh mốc).
- TUYỆT ĐỐI KHÔNG dùng 'Scene 1', 'Scene 2' cho prompt tạo ảnh tĩnh để tránh nhầm lẫn với các Phân cảnh Video (Video Scenes ở Bước 5).

3. ĐỒNG NHẤT 100% BỐI CẢNH GIỮA STORYBOARD & ẢNH ĐƠN LẺ (STRICT STORYBOARD-TO-IMAGE DYNAMIC EXTRACTION):
- NGUYÊN TẮC KẾ THỪA ĐỘNG TỪNG PANEL (DYNAMIC PANEL-TO-IMAGE INHERITANCE):
  * Mỗi Image k (từ Image 1 đến Image N+1) BẮT BUỘC được trích xuất và kế thừa trực tiếp 1:1 từ chi tiết bối cảnh, hành động nhân vật, đồ vật/đạo cụ, ánh sáng và góc máy của Panel k tương ứng trong chuỗi Prompt Storyboard đã tạo ở Bước 2.
  * Mọi thay đổi hoặc tùy biến trong Prompt Storyboard (thay đổi địa điểm, bối cảnh phòng, màu sắc, góc máy, số lượng panel) BẮT BUỘC tự động phản ánh và đồng bộ chính xác sang danh sách Image Prompts đơn lẻ tương ứng ở Bước 3.
- TÍNH CHÂN THẬT CỦA BỐI CẢNH (LIVED-IN REALISTIC ENVIRONMENTS & ZERO FLAT BACKDROPS):
  * TUYỆT ĐỐI CẤM dùng phông nền trơn studio vô hồn (NO plain seamless paper backdrops / NO flat solid studio walls).
  * Mọi phân cảnh trong Storyboard và từng ảnh đơn lẻ BẮT BUỘC phải có bối cảnh môi trường sống động, chân thực, có chiều sâu không gian (architectural depth, natural window light, tangible furniture, realistic room props, layered background) bám sát tình huống kịch bản và bối cảnh [context].
- KẾ THỪA 100% DIỆN MẠO NHÂN VẬT & MASCOT:
  * Giữ nguyên vẹn 100% diện mạo khuôn mặt [characterFace], kiểu tóc [characterHair], trang phục [characterOutfit], tỷ lệ cơ thể và Mascot [mascotName] (nếu có) từ Storyboard sang từng ảnh đơn lẻ.

4. TIÊU CHUẨN AN TOÀN NỀN TẢNG (PLATFORM SAFETY RULES):
All generated visuals must be fully compliant with advertising and social media platform policies including Facebook, TikTok, YouTube, Google Ads, and Instagram.

Strictly prohibit:
- graphic gore
- excessive body horror
- exposed internal organs
- disturbing medical imagery
- violent injury
- blood
- grotesque anatomy
- shocking fear-based imagery
- misleading medical claims
- before-after scam style visuals
- sexually suggestive content
- hateful or discriminatory content
- unsafe or prohibited products

Maintain:
- family-friendly visuals
- advertiser-safe composition
- cinematic but non-disturbing presentation
- emotionally engaging without shock content
- stylized scientific/medical visualization only (clean 3D abstract models, soft volumetric lighting)
- clean Pixar-style artistic rendering

IMPORTANT:
Never generate imagery that could trigger ad rejection, limited reach, or platform safety violations.
Medical or anatomical scenes must remain stylized, symbolic, and non-graphic with soft glowing abstract visual representations.

5. LÀM SẠCH PROMPT HÌNH ẢNH & PROTOCOL TỰ KIỂM TRA (CLEAN PROMPT & SELF-CHECK PROTOCOL):
- TUYỆT ĐỐI CẤM TÊN FILE: Không chèn tên file (như image_0.png, image_1.png, image_4.png, ref_0.png...) vào prompt tạo ảnh/thumbnail/storyboard. Thay vào đó, hãy mô tả trực tiếp các đặc điểm thị giác.
- TUYỆT ĐỐI CẤM THAM SỐ Ở GIỮA CÂU: Mọi tham số Midjourney/Flux như '--ar [aspectRatio]' và '--v 6.1 --style raw' BẮT BUỘC chỉ đặt ở CUỐI CÙNG của prompt (at the very end).
- TUYỆT ĐỐI CẤM LỆNH HỆ THỐNG / META NOTES: Không đưa các câu lệnh như '(leaving 20% margins top and bottom)', 'IMPORTANT: Generate ONLY ONE...', '(as defined in image_4.png)', '(same appearance as in...)' vào nội dung prompt ảnh.
- PROTOCOL TỰ KIỂM TRA (SELF-CHECK TRƯỚC KHI XUẤT):
  [x] Tên phân đoạn là Image 1, Image 2, ..., Image N+1 (KHÔNG dùng Scene 1, Scene 2).
  [x] Chuỗi prompt hoàn toàn sạch, KHÔNG chứa '(Lời thoại: ...)' hoặc text thoại tiếng Việt.
  [x] Bối cảnh không gian sống động có chiều sâu, KHÔNG dùng phông nền trơn studio phẳng.
  [x] Tham số '--ar [aspectRatio] --v 6.1' nằm đúng ở cuối câu.
  [x] Bối cảnh và nhân vật của từng Image k trích xuất và kế thừa chính xác 1:1 từ Panel k của Storyboard.

6. QUY TẮC BẮT BUỘC RIÊNG CHO THUMBNAIL (STRICT NO-BRAND ON THUMBNAIL RULE):
- TUYỆT ĐỐI KHÔNG XUẤT HIỆN TÊN BRAND / LOGO THƯƠNG HIỆU TRÊN THUMBNAIL:
  * CẤM triệt để việc khắc, in hoặc hiển thị tên thương hiệu (Brand Name như "[mascotName]", tên sản phẩm, logo nhãn hàng) lên bất kỳ vị trí nào của ảnh Thumbnail.
  * CẤM hiển thị tên brand trên khiên của Mascot, trên quần áo nhân vật, trên bao bì chai lọ hay bất kỳ đạo cụ nào trong thumbnail.
  * Mascot trên Thumbnail (nếu có): Chỉ cầm khiên vàng trơn hoặc khiên chạm nổi họa tiết thảo mộc vàng óng (blank golden shield with subtle botanical relief pattern; strictly NO brand text, NO logo, NO brand typography on shield or props).
  * Text DUY NHẤT được phép xuất hiện trên Thumbnail là Tiêu đề Hook 3D Tiếng Việt (3-5 từ giật tít thu hút click, ví dụ: 'ÊM DẠ DÀY NGAY', 'HẾT Ợ CHUA ĐÊM', 'BỤNG ÊM RU') được render 3D nổi bật, và tiêu đề này TUYỆT ĐỐI KHÔNG ĐƯỢC CHỨA TÊN BRAND.`;

export const DEFAULT_MANDATORY_AUDIO_RULES = `1. ĐỒNG BỘ & KHÓA CHẶT DANH TÍNH GIỌNG ĐỌC (LOCKED VOCAL IDENTITY & TIMBRE CONSISTENCY ACROSS ALL SCENES):
- NGUYÊN TẮC KHÓA HỒ SƠ GIỌNG ĐỌC (LOCKED VOCAL PROFILE):
  * Mọi nhân vật xuất hiện đều sở hữu 1 Profile giọng đọc cố định xuyên suốt gồm: Tên/Vai người nói, Giới tính, Độ tuổi thực tế ([characterAge]), Âm vực & Độ dày (Vocal Timbre: ấm, truyền cảm, tự nhiên), Khẩu âm vùng miền ([regionAccent]: Sài Gòn/Hà Nội/Đà Nẵng), Tốc độ nền (Base Pacing: 95-110 WPM), và Nhịp thở/Ngắt nghỉ (0.2s - 0.5s).
  * Kịch bản Độc thoại / Voiceover dẫn chuyện: Khóa DUY NHẤT 1 giọng đọc đồng bộ 100% với nhân vật chính/người dẫn chuyện ([characterGender], [characterAge] tuổi theo cấu hình [voice]). TUYỆT ĐỐI CẤM lệch giới tính, lệch độ tuổi hoặc lệch khẩu âm vùng miền giữa các cảnh.
  * Kịch bản Đối thoại (2 nhân vật trở lên, ví dụ Nhân vật chính & Bác sĩ/Chuyên gia/Mascot):
    + BẮT BUỘC chỉ định rõ Người nói (Speaker) cho từng câu thoại trong kịch bản.
    + MỖI NHÂN VẬT SỞ HỮU 1 PROFILE GIỌNG ĐỌC CỐ ĐỊNH RIÊNG BIỆT (khớp 100% giới tính, độ tuổi, âm sắc và vai trò).
    + TUYỆT ĐỐI CẤM dùng chéo giọng (thoại của Nhân vật A phải đúng giọng Nhân vật A, thoại của Nhân vật B phải đúng giọng Nhân vật B; không bị loạn giọng hay đổi giọng giữa các cảnh).

2. ĐỒNG BỘ BIẾN ĐIỆU CẢM XÚC CÓ ĐỊNH HƯỚNG QUA TỪNG CẢNH (CONTROLLED EMOTIONAL MODULATION WITHOUT VOCAL DRIFT):
- Sắc thái cảm xúc được điều chỉnh biến thiên tự nhiên theo mạch kịch bản nhưng BẮT BUỘC giữ nguyên 100% danh tính giọng (vẫn cùng một người nói, cùng âm sắc, cùng âm hưởng, cùng độ tuổi, cùng khẩu âm):
  * Cảnh Hook / Vấn đề (Cảnh 1): Sắc thái trăn trở, mệt mỏi, đặt câu hỏi đồng cảm (questioning, weary, empathetic sigh).
  * Cảnh Cơ chế / Khoa học (Cảnh 2): Sắc thái điềm tĩnh, phân tích rõ ràng, giải thích ân cần (calm, insightful, educational, clear chest resonance).
  * Cảnh Giải pháp Thói quen / Dinh dưỡng (Cảnh 3-4): Sắc thái ấm áp, khích lệ, tươi sáng và truyền cảm hứng (warm, encouraging, uplifting, practical).
  * Cảnh Chốt kết CTA & Thương hiệu (Cảnh 5 / N+1): Sắc thái tự tin, an tâm, nụ cười rạng rỡ trong giọng nói (confident, reassuring, authentic smile-in-the-voice).
- NGUYÊN TẮC BẮT BUỘC: "Naturally shifting emotional inflections across scenes WITHOUT changing vocal identity (same timbre, same resonance, same age, same accent, same breath pattern, same pitch baseline)".

3. ĐỒNG BỘ TUYỆT ĐỐI NGÔI XƯNG & ĐẠI TỪ NHÂN XƯNG (STRICT PRONOUN & ADDRESSING CONTINUITY):
- Toàn bộ lời thoại qua từng cảnh BẮT BUỘC dùng duy nhất 1 cặp đại từ nhân xưng đã chọn (ví dụ: 'mình - các bạn', 'tôi - bạn', 'em - anh/chị'...).
- TUYỆT ĐỐI CẤM đổi ngôi xưng lộn xộn giữa các cảnh (như Cảnh 1 xưng 'mình', Cảnh 2 xưng 'tôi', Cảnh 4 xưng 'em').

4. ĐỒNG BỘ THỜI LƯỢNG, NHỊP ĐỌC & CỬ ĐỘNG KHẨU HÌNH (AUDIO-VISUAL & LIP-SYNC HARMONIZATION):
- Tốc độ đọc chuẩn 95-110 WPM (từ/phút), điềm đạm, ân cần, nhịp nhàng.
- BẮT BUỘC chèn nhịp ngắt nghỉ 0.2s - 0.5s giữa các mệnh đề và dấu câu để tạo nhịp thở tự nhiên.
- Ràng buộc độ dài lời thoại: Mỗi cảnh 15 - 28 từ (tối đa 30 từ), vừa vặn chính xác với thời lượng khung hình 4s - 8s.

5. ĐỊNH NGHĨA CHUẨN VOICE PROMPT CHO TTS & VIDEO GEN AI (ELEVENLABS / MINIMAX / VEO 3 / KLING / SUNO):
- Định dạng xuất chuẩn cho mỗi Speaker:
  [Speaker Name]: Sound: [Gender, Age, Accent, Base Pacing WPM, Pitch/Resonance]. Voice: consistent [Primary Tone] throughout all segments — naturally shifting emotional inflections across scenes (Scene 1: [Emotion 1] -> Scene 2: [Emotion 2] -> Scene 3: [Emotion 3] -> Scene 4: [Emotion 4] -> Scene 5: [Emotion 5]) WITHOUT changing vocal identity. Same timbre, same resonance, same age, same accent, same breath pattern, same pacing baseline.

6. QUY TẮC THÍCH ỨNG ĐỘNG NGÔN TỪ THEO ĐỐI TƯỢNG, ĐỘ TUỔI & VÙNG MIỀN (DYNAMIC AUDIENCE & AUTHENTIC CONVERSATIONAL FLOW):
- NGUYÊN TẮC CHÍNH XÁC BỆNH LÝ & BÁM SÁT ĐÚNG NỖI ĐAU ĐỐI TƯỢNG (PATHOLOGY & CLINICAL ACCURACY ENGINE):
  * AI BẮT BUỘC phân tích chính xác cơ chế bệnh lý và triệu chứng theo đúng Tiêu đề ([title]) và Đối tượng ([targetAudience]):
    + NẾU LÀ VIÊM DẠ DÀY / VIÊM LOÉT MÃN TÍNH TÁI PHÁT (Gastritis / Peptic Ulcers):
      - Triệu chứng & Insight: Đau rát cồn cào, đau âm ỉ, quặn thắt vùng thượng vị (ngay chấn thủy/dưới ức), xót ruột khó chịu khi đói hoặc sau ăn, đầy trướng bụng, tái đi tái lại dai dẳng nhiều năm khiến người trung niên (45-55 tuổi) mệt mỏi, lo âu mất ngủ.
      - Cơ chế khoa học: Mất cân bằng giữa yếu tố tấn công (axit dư thừa, vi khuẩn HP, stress lo âu, ăn uống thất thường) và yếu tố bảo vệ (lớp màng nhầy niêm mạc bị bào mòn mỏng manh, ổ viêm loét tổn thương không kịp phục hồi).
      - Giải pháp: Ăn đúng giờ, sinh hoạt điều độ, kiêng cay nóng, và dùng thảo mộc tự nhiên giàu flavonoid/tanin giúp hỗ trợ làm lành ổ viêm, phục hồi lớp niêm mạc bảo vệ.
      - TUYỆT ĐỐI KHÔNG: Nhầm lẫn sang cơ chế giãn van cuống bao tử hay ợ chua trào ngược lên thực quản nếu chủ đề không nói về trào ngược (GERD).
    + NẾU LÀ TRÀO NGƯỢC DẠ DÀY THỰC QUẢN (GERD):
      - Triệu chứng & Cơ chế: Ợ chua, ợ nóng, nóng rát dọc xương ức dội ngược lên cổ họng, nghẹn cổ họng, nằm xuống bị trào axit; cơ chế do giãn cơ vòng thực quản (van tâm vị).
    + NẾU LÀ KẾT HỢP (Viêm dạ dày kèm trào ngược): Mới phân tích phối hợp cả hai cơ chế.
- NGUYÊN TẮC THOẠI TỰ NHIÊN & ĐÚNG CÚ PHÁP TIẾNG VIỆT NÓI (NATURAL SPOKEN VIETNAMESE FLOW):
  * Lời thoại phải tự nhiên, mượt mà, chân thật như người thật đang tâm sự chia sẻ kinh nghiệm sống.
  * TUYỆT ĐỐI CẤM gượng ép chèn từ ngữ lạ hoặc ghép cụm từ vô nghĩa vào câu làm gãy ngữ pháp.
  * Trợ từ và ngữ điệu vùng miền (như 'nè', 'nghen', 'nha', 'đó', 'coi bộ', 'êm ru', 'nhẹ nhõm', 'nhé', 'chuẩn bài', 'các bác') phải được dùng mềm mại, đúng ngữ cảnh như gia vị tự nhiên, giúp câu thoại gần gũi, ấm áp và truyền cảm.
- NGUYÊN TẮC THÍCH ỨNG ĐỘNG THEO ĐỐI TƯỢNG & ĐỘ TUỔI:
  * Hệ thống KHÔNG cố định một nhóm tuổi hay đối tượng cụ thể, mà BẮT BUỘC TỰ ĐỘNG PHÂN TÍCH MA TRẬN 3 YẾU TỐ:
    1. [characterAge] / [gender]: Độ tuổi & Giới tính nhân vật phát ngôn.
    2. [targetAudience]: Chân dung, tâm lý, nỗi đau, hoàn cảnh sống của nhóm người xem mục tiêu.
    3. [regionAccent] / Vùng miền: Khẩu âm, từ cảm thán và thói quen xưng hô bản địa.
  * NGUYÊN TẮC ĐỒNG ĐIỆU XÃ HỘI HỌC:
    + Nhân vật nói chuyện phải ĐÚNG ĐỘ TUỔI CỦA CHÍNH HỌ và GẦN GŨI VỚI ĐỐI TƯỢNG NGƯỜI XEM, tránh mọi sự lệch pha thế hệ (generation gap).
    + Tự động suy luận đại từ nhân xưng chuẩn xác (Ví dụ: 45-55 tuổi trung niên xưng 'cô/chú/bác/mình - cả nhà mình / các bác / anh chị em mình'; 25-40 tuổi xưng 'mình - các bạn / cả nhà mình'; 18-24 tuổi xưng 'mình / tụi mình').
    + Lời văn sâu sắc, văn minh, thấu hiểu, không làm quá hay than thở cường điệu hóa.
- TUYỆT ĐỐI TUÂN THỦ TỪ AN TOÀN Y TẾ & QUY TẮC VÙNG ĐỆM:
  * KHÔNG dùng các từ cấm y tế ('Thuốc', 'Chữa khỏi', 'Khỏi hẳn', 'Điều trị', 'Bệnh nhân', 'Cam kết 100%'). Bắt buộc thay bằng từ an toàn ('Giải pháp thảo mộc tự nhiên', 'Xoa dịu', 'Phục hồi', 'Người dùng/Bạn').
  * Đệm từ chuyên môn: Mọi thuật ngữ khoa học (Axit, Vi khuẩn HP, Niêm mạc, Flavonoid, Van tâm vị) phải diễn đạt mộc mạc, dễ hiểu, tránh thuật ngữ khô cứng.
  * Mỗi cảnh chứa 1-2 trợ từ/ngữ điệu vùng miền tự nhiên, phù hợp 100% với ngữ cảnh và đối tượng kịch bản.`;

export const DEFAULT_MANDATORY_VIDEO_RULES = `1. TỶ LỆ DỌC CHUẨN 9:16 TỐI ƯU VEO 3 / KLING / MIDJOURNEY: Tất cả video prompts và phân cảnh chuyển động phải tối ưu khung hình dọc 9:16.
2. THỜI LƯỢNG MỖI SCENE TỪ 4s - 8s: Mỗi cảnh kéo dài 4-8 giây, đủ để truyền tải 1 thông điệp súc tích và chuyển động thị giác rõ nét.
3. NGUYÊN TẮC ĐẠO DIỄN GÓC QUAY ĐIỆN ẢNH TÙY BIẾN THEO THỊ GIÁC & TÂM LÝ (DYNAMIC SCENE-AWARE CAMERA DIRECTING):
   - TUYỆT ĐỐI CẤM dùng các góc quay chung chung, vô thưởng vô phạt (ví dụ: "Medium shot", "Camera moves", "Close-up").
   - MỖI PHÂN CẢNH BẮT BUỘC PHẢI TỰ ĐỘNG TỔNG HỢP VÀ PHÂN TÍCH TỪ 3 NGUỒN DỮ LIỆU THỰC TẾ:
     (1) Lời thoại & Ý đồ kịch bản (Narrative intent & Dialogue hook)
     (2) Mô tả bối cảnh & nhân vật trong Storyboard Panel tương ứng (Storyboard Panel Extraction)
     (3) Cấu trúc hình ảnh trong Keyframe Image nguồn Bước 3 (Keyframe visual focal points)
   - BẮT BUỘC THIẾT KẾ GÓC QUAY BẮT TRỌN ĐIỂM HIGHLIGHT & INSIGHT THEO TỪNG VAI TRÒ KỊCH BẢN (KHÔNG GÁN CỨNG CHỦ ĐỀ):
     * Cảnh Hook / Vấn đề (Problem Hook): Sử dụng kỹ thuật đẩy máy kịch tính (Extreme Close-Up / Tight Choker Shot / Vertigo Push-In / Rack Focus) bắt trọn vi biểu cảm (micro-facial tension, giọt mồ hôi, ánh mắt, cử chỉ tay quằn quại hoặc bế tắc), làm nổi bật khoảnh khắc 'Stop-the-Scroll' và đánh trúng insight tâm lý cốt lõi của người xem.
     * Cảnh Cơ chế / Nguyên nhân gốc rễ (Root Cause & Mechanism): Sử dụng kỹ thuật chuyển động không gian 3D (Microscopic Macro Probe Lens / Dynamic 360-degree Orbital Arc Wrap / Slow Dimensional Dolly-Through) luồn sâu vào điểm nút cơ chế hoặc mô phỏng trung tâm, làm nổi bật khoảnh khắc tương phản trực quan giữa tác nhân gây hại và cấu trúc nền tảng.
     * Cảnh Giải pháp 1 (Thói quen / Chuyển biến đầu tiên): Sử dụng kỹ thuật nâng góc / lướt êm (Smooth Pedestal Rise / Dutch-Angle-to-Level Dolly Glide) bắt trọn khoảnh khắc giải tỏa căng thẳng (Visual Relief) và sự thích ứng nhẹ nhõm của nhân vật với thay đổi tích cực.
     * Cảnh Giải pháp 2 (Dinh dưỡng / Tác động ngoại sinh): Sử dụng kỹ thuật chuyển dịch tiêu điểm dứt khoát (Dynamic Top-Down Flatlay Tilt / Over-The-Shoulder Whip-Track / Parallax Sweep) từ yếu tố bất lợi sang giải pháp thanh lành, bắt trọn khoảnh khắc 'Thức tỉnh và hành động'.
     * Cảnh Giải pháp 3 & Chốt kết CTA (Hero Solution / Brand Seal / Peace of Mind): Sử dụng kỹ thuật tôn vinh vị thế (Heroic Low-Angle Arc Push-In / Golden-Hour Ascending Track) bao bọc nhân vật và biểu trưng thương hiệu trong trường hào quang chữa lành, bắt trọn thần sắc rạng rỡ và insight 'Tìm được niềm tin, an tâm tuyệt đối'.
4. TÍNH LIÊN TỤC VÀ ỔN ĐỊNH CHUYỂN ĐỘNG (MOTION CONTINUITY): Chuyển động cơ thể, làn da, cử chỉ tay chân mượt mà tự nhiên; TUYỆT ĐỐI CẤM hiện tượng biến dạng dị tật (no morphological warping/glitches), không chuyển cảnh giật cục.
5. HIỆU ỨNG VẬT LÝ & VI HẠT ÁNH SÁNG (PHYSICS & PARTICLES): Chuyển động dòng chảy vật lý, luồng sáng năng lượng bao bọc mượt mà; các đốm sáng ma thuật lơ lửng tạo cảm giác chữa lành và chiều sâu không gian điện ảnh.`;

export const DEFAULT_DIALOGUE_PROMPT_TEMPLATE = `Cấu trúc 5 cảnh chuẩn (Problem - Pain - Solution):
- Cảnh 1: Problem (Hook 3 giây đầu, chạm đúng nỗi đau thực tế thường ngày một cách chân thật, tự nhiên)
- Cảnh 2: Pain (Giải thích cơ chế khoa học dễ hiểu, chỉ ra các nguyên nhân gây khó chịu như stress, thức khuya, dư axit)
- Cảnh 3: Solution 1 (Giải pháp thói quen tự nhiên / sinh hoạt lành mạnh)
- Cảnh 4: Solution 2 (Giải pháp dinh dưỡng / thực dưỡng an lành, thanh đạm)
- Cảnh 5: Solution 3 (Giải pháp thảo mộc [mascotName] bảo vệ, phục hồi niêm mạc & mang lại giấc ngủ êm ái)

Ràng buộc lời thoại & đồng bộ giọng đọc đa phân cảnh (STRICT VOICE & CONVERSATIONAL NATURALNESS):
- LỜI THOẠI TỰ NHIÊN, TRÔI CHẢY, ĐÚNG PHONG CÁCH ĐÀM THOẠI HÀNG NGÀY:
  * Tuyệt đối KHÔNG gượng ép chèn cụm từ vô nghĩa làm sai cú pháp tiếng Việt. Trợ từ/ngữ điệu (nghen, nè, nha, coi bộ, êm ru, nhẹ nhõm, chuẩn bài...) được dùng tự nhiên như một người bạn thân tình chia sẻ.
  * Độ dài lý tưởng: 18-26 từ mỗi cảnh (tối đa 28 từ), nhịp đọc 95-110 WPM, phân câu mạch lạc với nhịp ngắt 0.2s - 0.5s để khi đọc TTS/AI Voice giọng đọc truyền cảm, có hồn.
- KHÓA PROFILE GIỌNG ĐỌC & ĐỒNG BỘ DANH TÍNH 100%:
  * Chỉ định rõ Người nói (Speaker) cho từng phân đoạn/câu thoại.
  * Độc thoại / Voiceover: Khóa 1 giọng đọc đồng bộ 100% với nhân vật ([characterGender] [characterAge] tuổi theo [voice]).
  * Đối thoại (2+ nhân vật): Mỗi nhân vật sở hữu 1 Profile giọng cố định riêng biệt khớp với giới tính, độ tuổi và vai trò (Tuyệt đối không dùng chéo giọng).
- ĐỒNG BỘ BIẾN ĐIỆU CẢM XÚC (EMOTION MODULATION WITHOUT VOCAL DRIFT):
  * Giọng đọc chuyển sắc thái tự nhiên qua từng cảnh (Cảnh 1 trăn trở -> Cảnh 2 điềm tĩnh khoa học -> Cảnh 3-4 ấm áp khích lệ -> Cảnh 5 tự tin an tâm) nhưng GIỮ NGUYÊN 100% DANH TÍNH GIỌNG (cùng âm sắc, cùng âm hưởng, cùng độ tuổi, cùng khẩu âm vùng miền).
- ĐỒNG BỘ NGÔI XƯNG & ĐẠI TỪ NHÂN XƯNG XUYÊN SUỐT:
  * Khóa duy nhất 1 cặp đại từ nhân xưng từ Cảnh 1 đến Cảnh cuối (không đổi từ 'mình' sang 'tôi' hay 'em').
- THÍCH ỨNG ĐỘNG NGÔN TỪ THEO ĐỐI TƯỢNG ([targetAudience]), ĐỘ TUỔI ([characterAge]) & VÙNG MIỀN ([regionAccent]):
  * Tự động điều chỉnh đại từ nhân xưng, từ ngữ cảm thán và phong cách trò chuyện khớp chính xác với chân dung nhân vật và đối tượng người xem.
  * Đảm bảo tính chân thực và đồng điệu xã hội học: Tránh lệch pha thế hệ; văn phong văn minh, gần gũi, đáng tin cậy.
- Áp dụng triệt để Quy tắc vùng đệm (Padding rule) cho các thuật ngữ y khoa/chuyên môn.
- Tuyệt đối tuân thủ Safe Words (CẤM thuốc, chữa khỏi, bệnh nhân, điều trị, cam kết...).

CẤU TRÚC KẾT QUẢ ĐẦU RA BẮT BUỘC XUẤT THEO 5 MỤC RÕ RÀNG:

## 1. VOICE SPECIFICATION (CHUẨN HÓA CHO AI VOICE / TTS)
[Định danh Profile giọng đọc chuẩn hóa cho Speaker]

## 2. BẢNG PHÂN CẢNH CHI TIẾT (STORYBOARD SCRIPT TABLE)
| Từ lóng vùng miền | Phân đoạn | Người nói (Speaker) | Bối cảnh / Hành động | Lời thoại (Kèm chỉ dẫn nhịp & sắc thái) |

## 3. GIẢI THÍCH CHIẾN LƯỢC KỊCH BẢN (BẮT BUỘC ĐỒNG NHẤT 100% VỚI ĐỐI TƯỢNG & DỮ LIỆU ĐẦU VÀO)
1. Đối tượng mục tiêu (Target Audience):
   * [targetAudience] - Phân tích chi tiết hành vi, bối cảnh sinh hoạt và nỗi đau của nhóm đối tượng này ở độ tuổi [characterAge]. Tuyệt đối KHÔNG tự ý thay đổi đối tượng sang nhóm khác.
2. Điểm chạm tâm lý (Psychological Triggers):
   * Đồng cảm sâu sắc (Empathy): Tái hiện chính xác cảm giác và nỗi đau gắn liền với chủ đề [title] và đối tượng [targetAudience].
   * Minh bạch khoa học (Logic): Phân tích nguyên nhân và cơ chế khoa học liên quan trực tiếp đến [title] một cách trực quan, khoa học.
   * Giải pháp khả thi (Actionable Hope): Lộ trình thói quen sinh hoạt và giải pháp thảo mộc thiên nhiên [mascotName] an toàn, lành tính.
3. Kỹ thuật Neo hình ảnh (Visual Anchoring):
   * Tone màu & Ánh sáng: Phù hợp phong cách thị giác [style].
   * Biểu tượng Mascot / Thảo mộc: [mascotName] bảo vệ và phục hồi niêm mạc.

## 4. TÁCH RIÊNG TOÀN BỘ HỘI THOẠI (DIALOGUE SCRIPT FOR RECORDING / TTS)
Trích xuất toàn bộ câu thoại của từng cảnh thành danh sách thoại thuần sạch sẽ, tự nhiên, đúng ngữ pháp đàm thoại (thuận tiện cho việc thu âm hoặc copy paste vào các phần mềm TTS / AI Voice / ElevenLabs / CapCut / Minimax). Format chi tiết:
- **Cảnh 1: [Tên phân đoạn]** ([Người nói] - [Sắc thái cảm xúc & nhịp điệu]):
  «[Câu thoại tự nhiên, trôi chảy, đúng cú pháp]» *(Số lượng từ)*
- **Cảnh 2: [Tên phân đoạn]** ([Người nói] - [Sắc thái cảm xúc & nhịp điệu]):
  «[Câu thoại tự nhiên, trôi chảy, đúng cú pháp]» *(Số lượng từ)*
- **Cảnh 3: [Tên phân đoạn]** ([Người nói] - [Sắc thái cảm xúc & nhịp điệu]):
  «[Câu thoại tự nhiên, trôi chảy, đúng cú pháp]» *(Số lượng từ)*
- **Cảnh 4: [Tên phân đoạn]** ([Người nói] - [Sắc thái cảm xúc & nhịp điệu]):
  «[Câu thoại tự nhiên, trôi chảy, đúng cú pháp]» *(Số lượng từ)*
- **Cảnh 5: [Tên phân đoạn]** ([Người nói] - [Sắc thái cảm xúc & nhịp điệu]):
  «[Câu thoại tự nhiên, trôi chảy, đúng cú pháp]» *(Số lượng từ)*

## 5. BẢNG KIỂM TRA TỰ ĐỘNG (SELF-CHECK PROTOCOL)
- [x] Cấu trúc 5 cảnh chuẩn...
- [x] Đồng bộ giọng đọc & đại từ...
- [x] Lời thoại tự nhiên, đúng cú pháp tiếng Việt...
- [x] Tuân thủ Safe Words...`;

export const DEFAULT_STORYBOARD_PROMPT_TEMPLATE = `[videoStyle] storyboard in one single master image, perfectly divided into a grid of vertical portrait panels (strictly vertical panels, NO horizontal split, --ar [aspectRatio]). High cinematic visual continuity, realistic human anatomy, and lived-in environmental realism.
- Visual Palette: Warm cinematic volumetric lighting, rich architectural & environmental depth, subtle floating luminous micro-particles, detailed physical textures, master 8K render.
- Locked Lead Character: [characterGender] [characterAge] years old, [characterFace], [characterHair], natural human posture, wearing [characterOutfit]. Maintain EXACT facial proportions and outfit across all panels (strictly NO plastic doll look, NO uncanny caricature).
- Locked Mascot Character: [mascot]
- Character Consistency Rules: [characterRules]
- Sequence of Panels (Panel 1 to Panel N+1 matching the script scenes in [context]):
  * Each panel sequentially illustrates the corresponding story phase with tangible lived-in environments, architectural depth, natural atmospheric lighting, and authentic character acting matching the script context.
  * Strictly NO plain studio backdrops or flat seamless paper walls.
--ar [aspectRatio] --v 6.1 --style raw`;

export const DEFAULT_SCENE_PROMPT_TEMPLATE = `[videoStyle], single full-screen cinematic shot optimized for Midjourney / DALL-E / Flux, vertical portrait ratio (--ar [aspectRatio]).
- Number of Images (Image of Sences): Exactly N+1 standalone images (Image 1 to Image N+1) directly corresponding to Panel 1 to Panel N+1 of the Storyboard.
- Dynamic Panel Extraction & Continuity (Trích xuất & Kế thừa 1:1 từ Storyboard):
  * For each Image k (from Image 1 to Image N+1): Directly extract and faithfully inherit the exact setting, room architecture, props, lighting, character pose/emotion, and camera angle from Panel k of the Storyboard generated in Step 2.
  * If the Storyboard changes or is customized, every single corresponding Image prompt automatically updates to match its specific Panel.
- Environmental Realism & Lived-in Context: Strictly NO plain studio backdrops or flat seamless paper walls. Maintain tangible architectural depth, natural window light, and realistic physical props.
- Locked Characters: [characterGender] [characterAge] years old, [characterFace], [characterHair], wearing [characterOutfit] & [mascot]. Natural lifelike anatomy (strictly NO plastic doll face, NO uncanny bug-eyes).
- Character Consistency: [characterRules]
- No Dialogue on Image: NEVER render speech dialogue, spoken text, narration, dialogue quotes, subtitles, closed captions, or speech bubbles on the image. Images must remain 100% clean cinematic visual shots without text overlays.
- Composition: Single focused standalone image per prompt (Image 1 to Image N+1), NO grid splits, NO extra borders.`;

export const DEFAULT_THUMBNAIL_PROMPT_TEMPLATE = `A vibrant [videoStyle] vertical portrait thumbnail for a health video, featuring ultra-high visual contrast to stop the scroll. The central focus is [characterGender] ([characterAge] years old, [characterFace], [characterHair], wearing [characterOutfit]) smiling brightly and looking healthy, authentic, and relieved, holding glowing golden herbal leaves. Standing next to her is the heroic plump golden droplet mascot wearing a leaf cape, holding a small twig and a blank golden shield with delicate botanical relief (strictly NO brand text, NO logo, NO typography on shield or clothing). Rich atmospheric background with contrasting emerald green botanicals and warm golden glowing magical aura and floating particles, creating a powerful visual pop. Clean, bold 3D Vietnamese typography centered vertically reading: 'ÊM DẠ DÀY NGAY' (the ONLY text on the thumbnail; strictly NO brand name, NO commercial logo, NO brand typography anywhere). Warm cinematic lighting, highly detailed textures, smooth 8K render. --ar [aspectRatio] --v 6.1`;

export const DEFAULT_VEO_PROMPT_TEMPLATE = `[videoStyle], [arOrientation] video motion optimized for VEO 3 / Kling AI / Sora, cinematic volumetric lighting, rich environmental depth, smooth 8K rendering.
- Scene Duration: 4s - 8s per scene.
- Locked Characters: [characterGender] [characterAge] years old, [characterFace], [characterHair], wearing [characterOutfit] & [mascot].
- Character Rules: [characterRules]
- Voice Acting & Vocal Consistency (Đồng bộ Phân vai Giọng đọc & Nhân vật): [voice] (Locked fixed vocal identity for each speaking character matching gender/age/accent; maintain 100% vocal consistency and timbre across all scenes, naturally shifting emotional inflections without changing identity).
- Scalable Insight-Driven Camera & Highlight Motion Dynamics (Đạo diễn góc quay tùy biến đa kịch bản):
  * Analyze each scene's specific dialogue, emotional inflection, and the exact visual layout in its corresponding Storyboard Panel and Keyframe Image.
  * Direct specific optical camera movements (focal length, camera axis, push/pull speed, framing tight/wide) that maximize the psychological impact and visual climax of that exact scene (e.g. dramatic push-in on high-tension moments, dynamic dimensional macro/orbital rotation during core mechanism reveals, smooth pedestal glides during relief moments, decisive whip/tilt transitions during lifestyle shifts, and heroic low-angle ascending arc wraps for empowering conclusions).
  * Strictly avoid generic camera tags (e.g. do not just write 'Medium shot' or 'Camera pans').
- Fluid body motion and physics-based natural dynamics; strictly NO morphological warping, sudden glitches, or disfigured anatomy.
- Single full-screen cinematic shot only (--ar [aspectRatio]). NO multi-panel grids, NO borders.`;

export const DEFAULT_VIDEO_STYLE_PROMPT = `3D Pixar animation style, rich cinematic volumetric lighting, warm atmospheric lived-in environment with realistic depth, smooth 8K render, magical floating golden micro-particles, fluid physics, natural organic motion, ultra-detailed physical textures, vibrant healing color grading.`;

// Aliases for backwards compatibility
export const DEFAULT_IMAGE_PROMPT_TEMPLATE = DEFAULT_STORYBOARD_PROMPT_TEMPLATE;
export const DEFAULT_VIDEO_PROMPT_TEMPLATE = DEFAULT_VEO_PROMPT_TEMPLATE;

export const DEFAULT_INPUTS: PromptInputs = {
  title: "Bí quyết xoa dịu đau dạ dày, trào ngược ợ chua ban đêm",
  coreContent: "Vấn đề: trào ngược, nóng rát dạ dày do thức khuya, stress, ăn uống thất thường gây dư axit. Nỗi đau: 3 nguyên nhân (axit bào mòn niêm mạc, van tâm vị giãn nở, căng thẳng thần kinh). 3 Giải pháp: (1) Kê cao đầu giường 15 độ & ăn trước ngủ 3h; (2) Giảm cay nóng dầu mỡ, tăng rau xanh & nước ấm; (3) Sử dụng thảo mộc Trà Dây Bstar chứa Flavonoid & Tanin tự nhiên giúp bảo vệ và phục hồi niêm mạc.",
  style: "3D Pixar style, soft peach background, warm cinematic volumetric lighting, smooth 8K render, magical glowing particles",
  videoStylePrompt: "3D Pixar animation style, soft peach background, warm cinematic volumetric lighting, smooth 8K render, magical floating golden micro-particles, fluid physics, natural organic motion, ultra-detailed textures, vibrant healing color grading, clean studio lighting.",
  voice: "Southern Vietnamese Saigon female voice 25-34 years old, gentle warm and soothing tone, empathetic and friendly storytelling style, 105-110 wpm, 0.2-0.5s pauses. Sound: [Female, 28-32, Saigon accent, 105 wpm, empathetic]. Voice: consistent warm empathetic tone throughout all segments — naturally shifting between questioning, informing, persuading, soothing, firm, cautious, authentic, and engaging WITHOUT changing vocal identity. Same timbre, same resonance, same age 25-34, same Southern Vietnamese Saigon accent, same breath pattern, same pacing 105-110 wpm, same pitch modulation across all segments.",
  targetAudience: "Dân văn phòng, người thường xuyên làm việc khuya, ăn uống thất thường, hay bị ợ hơi, nóng rát dạ dày",
  context: "Bàn làm việc ấm cúng ban đêm, phòng ngủ thanh bình và mô phỏng 3D dạ dày trừu tượng phát sáng mềm mại",
  useMascot: true,
  mascotName: "Trà Dây Bstar",
  mascotPrompt: DEFAULT_MASCOT_PROMPT,
  characterAge: "25-34",
  characterGender: "Vietnamese female",
  femaleAge: "25-34",
  regionAccent: "south",
  pacingWpm: 105,
  aspectRatio: "9:16",
  globalSafetyRules: DEFAULT_GLOBAL_SAFETY_RULES,
  globalCharacterRules: DEFAULT_GLOBAL_CHARACTER_RULES,
  customSlangWords: DEFAULT_SLANG_WORDS,
  customSafeWords: DEFAULT_SAFE_WORDS,
  customPaddingWords: DEFAULT_PADDING_WORDS,
  mandatoryImageRules: DEFAULT_MANDATORY_IMAGE_RULES,
  mandatoryAudioRules: DEFAULT_MANDATORY_AUDIO_RULES,
  mandatoryVideoRules: DEFAULT_MANDATORY_VIDEO_RULES,
  dialoguePromptTemplate: DEFAULT_DIALOGUE_PROMPT_TEMPLATE,
  storyboardPromptTemplate: DEFAULT_STORYBOARD_PROMPT_TEMPLATE,
  scenePromptTemplate: DEFAULT_SCENE_PROMPT_TEMPLATE,
  imagePromptTemplate: DEFAULT_SCENE_PROMPT_TEMPLATE,
  thumbnailPromptTemplate: DEFAULT_THUMBNAIL_PROMPT_TEMPLATE,
  veoPromptTemplate: DEFAULT_VEO_PROMPT_TEMPLATE,
  videoPromptTemplate: DEFAULT_VEO_PROMPT_TEMPLATE,
  customNotes: "Nhấn mạnh cơ chế thảo mộc tự nhiên lành tính, không dùng bất kỳ từ cấm y tế nào.",
};

export const PRESET_TEMPLATES: { name: string; tag: string; description: string; data: PromptInputs }[] = [
  {
    name: "Trà Dây Bstar - Trào Ngược Dạ Dày",
    tag: "Tiêu hóa & Dạ dày",
    description: "Kịch bản chuẩn 5 cảnh giải thích cơ chế axit dư thừa & thảo mộc Trà Dây bảo vệ niêm mạc",
    data: { ...DEFAULT_INPUTS },
  },
  {
    name: "Dưỡng Tâm Thảo Mộc - Giấc Ngủ Sâu",
    tag: "Giấc ngủ & Thần kinh",
    description: "Giải pháp thư giãn thần kinh, xua tan âu lo và phục hồi giấc ngủ tự nhiên",
    data: {
      ...DEFAULT_INPUTS,
      title: "Giải pháp êm dịu cho người hay trằn trọc, mất ngủ về đêm",
      coreContent: "Vấn đề: Trằn trọc 2-3 tiếng không ngủ được do hormone Cortisol tăng cao vì căng thẳng. Nỗi đau: Ánh sáng xanh điện thoại, ăn quá no ban đêm, tuần hoàn máu kém. 3 Giải pháp: (1) Ngâm chân nước ấm thảo mộc 15 phút; (2) Tắt điện thoại trước ngủ 45 phút, tập thở 4-7-8; (3) Uống trà thảo mộc hoa cúc tâm sen Trà Dây Bstar giúp thư giãn thần kinh nhẹ nhàng.",
      style: "3D Pixar style, deep cozy indigo and soft lavender twilight, dreamy glowing stars, magical warm floating dust",
      videoStylePrompt: "3D Pixar style, deep cozy indigo and soft lavender twilight, dreamy glowing stars, magical warm floating dust, gentle soothing motion, cinematic 8K render",
      voice: "Southern Vietnamese Saigon female voice 30-40 years old, gentle whispering cadence, melodious comforting warmth, 90-100 wpm",
      targetAudience: "Người làm việc trí óc, phụ nữ hay lo âu, khó vào giấc ngủ",
      context: "Phòng ngủ ấm áp ánh đèn ngủ dịu nhẹ, ban công ngập ánh trăng êm ả",
      mascotName: "Trà Dây Bstar An Thần",
      characterAge: "28-35",
      characterGender: "Vietnamese female",
      femaleAge: "28-35",
      regionAccent: "south",
      pacingWpm: 95,
      customNotes: "Nhấn mạnh thư giãn tinh thần tự nhiên, không cam kết an thần cưỡng bức.",
    },
  },
  {
    name: "Thảo Dược Dưỡng Gan - Tươi Tắn Làn Da",
    tag: "Thải độc & Gan mật",
    description: "Xoa dịu nóng trong, mụn nhọt và thanh lọc cơ thể từ gốc",
    data: {
      ...DEFAULT_INPUTS,
      title: "Bí quyết thanh lọc nóng trong, giải độc gan cho người hay thức khuya",
      coreContent: "Vấn đề: Cơ thể bốc hỏa, nổi mụn, mẩn ngứa và hơi thở nóng nực. Nỗi đau: Thức đêm làm việc, ăn đồ chiên rán cay nồng, độc tố tích tụ quá tải ở gan. 3 Giải pháp: (1) Uống đủ 2 lít nước ấm rải đều trong ngày; (2) Đi ngủ trước 23h để gan tự phục hồi sinh học; (3) Bổ sung chiết xuất thảo mộc Atiso & Trà Dây Bstar giàu Silymarin tự nhiên.",
      style: "3D Pixar style, fresh emerald green and golden sunlight, crisp morning dew drops, botanical serenity",
      videoStylePrompt: "3D Pixar style, fresh emerald green and golden sunlight, crisp morning dew drops, botanical serenity, fluid organic healing motion, 8k",
      voice: "Northern Vietnamese Hanoi female voice 28-35 years old, clear crisp articulation, inspiring friendly medical educator tone, 110 wpm",
      targetAudience: "Nhân viên văn phòng, người hay thức khuya, ăn uống nhiều dầu mỡ đồ cay nóng",
      context: "Không gian bếp xanh mát ngập tràn cây cối và bình minh rạng rỡ",
      mascotName: "Trà Dây Bstar Thanh Mát",
      characterAge: "25-30",
      characterGender: "Vietnamese female",
      femaleAge: "25-30",
      regionAccent: "north",
      pacingWpm: 110,
      customNotes: "Tập trung thói quen lành mạnh và thảo mộc mát gan.",
    },
  },
  {
    name: "Dưỡng Khớp Linh Hoạt - Vận Động Êm Ái",
    tag: "Xương khớp",
    description: "Giúp người đau mỏi vai gáy, khớp gối khô kêu lục cục nhẹ nhõm",
    data: {
      ...DEFAULT_INPUTS,
      title: "Giải pháp xoa dịu đau mỏi vai gáy và khô khớp gối cho dân văn phòng",
      coreContent: "Vấn đề: Ngồi lì 8 tiếng khiến cổ vai gáy cứng đờ, khớp gối lục cục khi đứng lên. Nỗi đau: Sai tư thế ngồi, thiếu dịch khớp bôi trơn, thoái hóa do ít vận động. 3 Giải pháp: (1) Đứng dậy kéo giãn cơ gân 5 phút sau mỗi 1 tiếng; (2) Bổ sung thực phẩm giàu Omega 3 & Collagen; (3) Dùng thảo mộc dưỡng khớp Trà Dây Bstar giúp lưu thông khí huyết.",
      style: "3D Pixar style, energizing soft morning glow, clean ergonomic modern workspace, floating vitality sparkles",
      videoStylePrompt: "3D Pixar style, energizing soft morning glow, clean ergonomic modern workspace, floating vitality sparkles, smooth natural dynamic movement, 8k",
      voice: "Central Vietnamese Da Nang male voice 40-55 years old, hearty warm and reassuring tone, rhythmic and engaging, 105 wpm",
      targetAudience: "Dân văn phòng, người ngồi nhiều một chỗ, ít vận động, hay đau mỏi cơ xương",
      context: "Góc làm việc hiện đại tràn ngập ánh sáng và công viên tập thể dục rợp bóng cây",
      mascotName: "Trà Dây Bstar Khớp Khỏe",
      characterAge: "30-40",
      characterGender: "Vietnamese female",
      femaleAge: "30-40",
      regionAccent: "central",
      pacingWpm: 105,
      customNotes: "Khuyến khích vận động kéo giãn kết hợp thảo mộc tự nhiên.",
    },
  },
];

export const REGIONAL_SLANG_BANK: RegionalSlangItem[] = [
  // Miền Nam
  { word: "Coi bộ", group: "Chuyển ý", region: "Miền Nam", meaning: "Dường như, có vẻ như (chuyển đoạn mượt mà)", example: "Coi bộ áp lực công việc làm dạ dày tiết nhiều axit dư rồi nghen!" },
  { word: "Thiệt tình", group: "Cảm thán", region: "Miền Nam", meaning: "Thật sự là (đồng cảm sâu sắc)", example: "Thiệt tình, cứ nằm xuống là cổ họng lại nóng rát bứt rứt." },
  { word: "Nhẹ bẫng / Nhẹ nhõm hẳn", group: "Nhấn mạnh", region: "Miền Nam", meaning: "Rất nhẹ nhõm, dễ chịu", example: "Làm theo cách này là cái bao tử nhẹ bẫng liền hà!" },
  { word: "Êm ru", group: "Nhấn mạnh", region: "Miền Nam", meaning: "Êm ái, ngủ ngon, không còn cồn cào", example: "...giúp dạ dày được bảo vệ và cả nhà mình ngủ êm ru nghen!" },
  { word: "Cả nhà mình ơi / Chị em mình nè", group: "Gọi người xem", region: "Miền Nam", meaning: "Kêu gọi thân mật, ấm áp phù hợp độ tuổi 25-45", example: "Cả nhà mình ơi, đừng chủ quan khi bụng cứ cồn cào về đêm nghen!" },
  { word: "Liền hà", group: "Câu đệm", region: "Miền Nam", meaning: "Ngay lập tức (trợ từ tự nhiên)", example: "...uống ly nước ấm là thấy cái bụng dịu xuống liền hà." },
  { word: "Nghen", group: "Câu đệm", region: "Miền Nam", meaning: "Nhé, nha (cuối câu tạo sự ân cần)", example: "...nhớ chăm sóc dạ dày mỗi ngày nghen!" },
  { word: "Nè nghen / Nè", group: "Câu đệm", region: "Miền Nam", meaning: "Này nhé (thu hút sự chú ý nhẹ nhàng)", example: "Để mình mách cho mẹo nhỏ cực kỳ hiệu quả nè!" },

  // Miền Bắc
  { word: "Chuẩn bài", group: "Nhấn mạnh", region: "Miền Bắc", meaning: "Rất đúng đắn, chính xác, hiệu quả", example: "...kết hợp hai cách này là chuẩn bài luôn đó cả nhà mình ạ!" },
  { word: "Nhẹ nhõm hẳn", group: "Nhấn mạnh", region: "Miền Bắc", meaning: "Dễ chịu, thoải mái", example: "...hệ tiêu hóa được xoa dịu, cảm giác nhẹ nhõm hẳn." },
  { word: "Khéo mà", group: "Chuyển ý", region: "Miền Bắc", meaning: "Có khả năng là, cẩn thận kẻo", example: "Căng thẳng kéo dài khéo mà làm dạ dày tổn thương lúc nào không hay." },
  { word: "Khổ nỗi", group: "Chuyển ý", region: "Miền Bắc", meaning: "Khó khăn là, nguyên nhân thường gặp", example: "Khổ nỗi, công việc bận rộn nên cứ ăn uống muộn màng." },
  { word: "Cả nhà mình ạ / Các bác ạ", group: "Gọi người xem", region: "Miền Bắc", meaning: "Xưng hô tôn trọng, gần gũi", example: "Cả nhà mình ạ, chỉ cần thay đổi thói quen nhỏ thôi là khác liền!" },
  { word: "Nhá / Nhé", group: "Câu đệm", region: "Miền Bắc", meaning: "Nhé (thân thiện, gắn kết)", example: "...nhớ giữ ấm bụng trước khi đi ngủ nhá!" },
  { word: "Đấy nhé", group: "Câu đệm", region: "Miền Bắc", meaning: "Đấy nha (khẳng định nhẹ nhàng)", example: "Đấy nhé, lắng nghe cơ thể để luôn an tâm mỗi ngày!" },

  // Miền Trung
  { word: "Thiệt ưng bụng", group: "Nhấn mạnh", region: "Miền Trung", meaning: "Rất hài lòng, rất êm ái", example: "...uống xong tách trà thảo mộc là thiệt ưng bụng luôn." },
  { word: "Rứa nì", group: "Câu đệm", region: "Miền Trung", meaning: "Như thế này này", example: "Cứ làm đúng theo các bước rứa nì là êm ru." },
  { word: "Mấy bạn mình ơi", group: "Gọi người xem", region: "Miền Trung", meaning: "Bạn bè thân thiết, đồng cảm", example: "Mấy bạn mình ơi, đừng thức khuya nhiều mà hại bao tử nghen!" },

  // Miền Tây
  { word: "Êm re / Êm ru", group: "Nhấn mạnh", region: "Miền Tây", meaning: "Rất êm ái, phẳng lặng, dễ chịu", example: "...uống vô là cái bụng êm re tới sáng luôn." },
  { word: "Nhẹ tênh", group: "Nhấn mạnh", region: "Miền Tây", meaning: "Cực kỳ nhẹ nhõm", example: "...dạ dày nhẹ tênh, không còn cảm giác đầy ứ khó chịu." },
  { word: "Bà con mình ơi", group: "Gọi người xem", region: "Miền Tây", meaning: "Thân thương, mộc mạc", example: "Bà con mình ơi, nhớ ăn tối sớm đặng bụng kịp tiêu hóa nghen!" },
];

export const SAFE_WORDS_DICTIONARY = [
  { banned: "Thuốc", replacement: "Giải pháp / Thảo mộc tự nhiên / Dưỡng chất", reason: "Chính sách quảng cáo cấm tự nhận là thuốc kê đơn hoặc cam kết dược lý" },
  { banned: "Chữa khỏi / Khỏi hẳn", replacement: "Xoa dịu / Phục hồi / Cải thiện rõ rệt", reason: "Cấm cam kết trị dứt điểm 100%" },
  { banned: "Bệnh nhân", replacement: "Người dùng / Người gặp tình trạng này / Bạn", reason: "Tránh gán nhãn bệnh lý nặng nề gây kích động tiêu cực" },
  { banned: "Điều trị", replacement: "Hỗ trợ chăm sóc / Nuôi dưỡng / Làm dịu", reason: "Thuật ngữ lâm sàng dễ bị bóp tương tác" },
  { banned: "Cam kết 100%", replacement: "Được kiểm nghiệm / Minh chứng khoa học", reason: "Tuyên bố phóng đại bị phạt vi phạm thương mại" },
  { banned: "Bệnh tật kinh hoàng", replacement: "Sự khó chịu thường gặp", reason: "Cấm hình ảnh và ngôn từ dọa dẫm gây sợ hãi (fear-mongering)" },
];

export const PADDING_WORDS_EXAMPLES = [
  { term: "Axit dạ dày", padded: "mấy cái chất axit dư thừa này nè", explanation: "Làm mềm thuật ngữ hóa học, chống bẻ giọng AI" },
  { term: "Vi khuẩn HP", padded: "mấy cái con vi sinh vật bé xíu", explanation: "Trừu tượng hóa, tránh gây sợ hãi" },
  { term: "Niêm mạc", padded: "cái lớp niêm mạc bảo vệ phía trong", explanation: "Tạo cảm giác sinh hoạt đời thường" },
  { term: "Flavonoid / Tanin", padded: "cái hoạt chất thảo mộc quý giá", explanation: "Dễ nghe, nhấn mạnh nguồn gốc tự nhiên" },
  { term: "Tâm vị / Môn vị", padded: "cái van ngăn ở ngay cuống bao tử", explanation: "Hình tượng hóa trực quan cho người xem đại chúng" },
];

export interface RegionalAccentOption {
  id: "south" | "north" | "central" | "west";
  label: string;
  shortLabel: string;
  regionName: string;
  description: string;
  defaultPacing: number;
  icon?: string;
}

export const REGIONAL_ACCENT_OPTIONS: RegionalAccentOption[] = [
  {
    id: "south",
    label: "Miền Nam: Giọng Sài Gòn / Nam Bộ",
    shortLabel: "Miền Nam (Sài Gòn)",
    regionName: "Miền Nam",
    description: "Giọng Sài Gòn ấm áp, truyền cảm, gần gũi, tự nhiên",
    defaultPacing: 105,
    icon: "🌴",
  },
  {
    id: "north",
    label: "Miền Bắc: Giọng Hà Nội / Bắc Bộ",
    shortLabel: "Miền Bắc (Hà Nội)",
    regionName: "Miền Bắc",
    description: "Giọng Hà Nội chuẩn xác, rõ ràng, tin cậy, mạch lạc",
    defaultPacing: 110,
    icon: "🏛️",
  },
  {
    id: "central",
    label: "Miền Trung: Giọng Đà Nẵng / Miền Trung",
    shortLabel: "Miền Trung (Đà Nẵng)",
    regionName: "Miền Trung",
    description: "Giọng Miền Trung chân thành, ấm áp, đượm tình, mộc mạc",
    defaultPacing: 105,
    icon: "🌊",
  },
  {
    id: "west",
    label: "Miền Tây: Giọng Sông Nước Nam Bộ",
    shortLabel: "Miền Tây (Sông Nước)",
    regionName: "Miền Tây",
    description: "Giọng Miền Tây ngọt ngào, thân thương, mộc mạc, hào sảng",
    defaultPacing: 100,
    icon: "🌾",
  },
];

/**
 * Tự động khớp giọng đọc (Voice Prompt) hoàn hảo dựa trên Vùng miền được chọn + Giới tính & Độ tuổi nhân vật
 */
export function matchRegionalVoice(
  region: "south" | "north" | "central" | "west" = "south",
  gender: string = "Vietnamese female",
  age: string = "25-34"
): { voice: string; pacingWpm: number; label: string; shortLabel: string; genderLabel: string; toneDescription: string } {
  const activeAge = (age || "25-34").trim();
  const lowerGender = (gender || "Vietnamese female").toLowerCase();
  const isMale = (lowerGender.includes("male") && !lowerGender.includes("female")) || lowerGender.includes("nam");

  // Kiểm tra độ tuổi (lớn tuổi / trung niên / trẻ)
  const isSenior = /(?:5[5-9]|[6-9][0-9]|lớn|cao tuổi|senior|ông|bà)/i.test(activeAge);
  const isMiddle = /(?:3[5-9]|4[0-9]|5[0-4]|trung niên|middle)/i.test(activeAge);

  let pacingWpm = 105;
  let voicePrompt = "";
  let toneDescription = "";

  if (region === "north") {
    pacingWpm = isSenior ? 90 : isMale ? 105 : 110;
    if (isMale) {
      toneDescription = isSenior ? "trầm ấm uy tín, chững chạc kể chuyện" : "chững chạc, tin cậy, tự tin và truyền cảm";
      voicePrompt = `Northern Vietnamese Hanoi male voice ${activeAge} years old, authoritative confident trustworthy and warm tone, ${pacingWpm} wpm, 0.2-0.5s pauses. Sound: [Male, ${activeAge}, Northern Vietnamese Hanoi accent, ${pacingWpm} wpm, trustworthy, resonant, chest resonance]. Voice: consistent confident and caring tone throughout all segments — naturally shifting emotional inflections without changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Hanoi accent, same breath pattern, same pacing ${pacingWpm} wpm across all segments.`;
    } else {
      toneDescription = isSenior ? "mẹ đôn hậu, chuẩn mực ấm áp" : "truyền cảm, rõ ràng chuẩn xác, năng động";
      voicePrompt = `Northern Vietnamese Hanoi female voice ${activeAge} years old, clear crisp articulation, inspiring friendly educator tone, ${pacingWpm} wpm, 0.2-0.5s pauses. Sound: [Female, ${activeAge}, Northern Vietnamese Hanoi accent, ${pacingWpm} wpm, clear crisp articulation, inspiring, chest resonance]. Voice: consistent articulate and friendly tone throughout all segments — naturally shifting emotional inflections without changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Hanoi accent, same breath pattern, same pacing ${pacingWpm} wpm across all segments.`;
    }
  } else if (region === "central") {
    pacingWpm = isSenior ? 88 : 105;
    if (isMale) {
      toneDescription = "ấm áp, chân thành, hào sảng và gần gũi";
      voicePrompt = `Central Vietnamese Da Nang male voice ${activeAge} years old, hearty warm and reassuring tone, rhythmic and engaging, ${pacingWpm} wpm, 0.2-0.5s pauses. Sound: [Male, ${activeAge}, Central Vietnamese accent, ${pacingWpm} wpm, hearty reassuring, chest resonance]. Voice: consistent warm authentic tone throughout all segments — naturally shifting emotional inflections without changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Da Nang accent, same breath pattern, same pacing ${pacingWpm} wpm across all segments.`;
    } else {
      toneDescription = "dịu dàng, đượm tình, thủ thỉ ngọt ngào";
      voicePrompt = `Central Vietnamese Da Nang/Hue female voice ${activeAge} years old, gentle sincere melodious tone, sweet and empathetic, ${pacingWpm} wpm, 0.2-0.5s pauses. Sound: [Female, ${activeAge}, Central Vietnamese accent, ${pacingWpm} wpm, sincere melodious, gentle, chest resonance]. Voice: consistent sincere empathetic tone throughout all segments — naturally shifting emotional inflections without changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Central accent, same breath pattern, same pacing ${pacingWpm} wpm across all segments.`;
    }
  } else if (region === "west") {
    pacingWpm = isSenior ? 85 : 98;
    if (isMale) {
      toneDescription = "chân chất, mộc mạc, hào sảng phóng khoáng";
      voicePrompt = `Mekong Delta Western Vietnamese male voice ${activeAge} years old, cheerful rustic friendly storytelling tone, ${pacingWpm} wpm, 0.2-0.5s pauses. Sound: [Male, ${activeAge}, Mekong Delta Western accent, ${pacingWpm} wpm, cheerful rustic, resonant, chest resonance]. Voice: consistent cheerful authentic tone throughout all segments — naturally shifting emotional inflections without changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Western accent, same breath pattern, same pacing ${pacingWpm} wpm across all segments.`;
    } else {
      toneDescription = "ngọt ngào, đằm thắm, mộc mạc thân thương";
      voicePrompt = `Mekong Delta Western Vietnamese female voice ${activeAge} years old, sweet gentle storytelling tone, smiling voice, rustic and warm, ${pacingWpm} wpm, 0.2-0.5s pauses. Sound: [Female, ${activeAge}, Mekong Delta Western accent, ${pacingWpm} wpm, sweet gentle rustic, chest resonance]. Voice: consistent sweet hospitable tone throughout all segments — naturally shifting emotional inflections without changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Western accent, same breath pattern, same pacing ${pacingWpm} wpm across all segments.`;
    }
  } else {
    // Default: South (Miền Nam - Sài Gòn)
    if (isMale) {
      if (isSenior) {
        pacingWpm = 88;
        toneDescription = "trầm ấm, kể chuyện từng trải, an tâm";
        voicePrompt = `Southern Vietnamese Saigon male voice ${activeAge} years old, deep warm soothing, ${pacingWpm} wpm, grandfatherly storytelling style, 0.2-0.5s pauses. Sound: [Male, ${activeAge}, Southern Vietnamese Saigon accent, ${pacingWpm} wpm, deep warm soothing, chest resonance]. Voice: consistent grandfatherly warm storytelling tone throughout all segments — naturally shifting emotional inflections without changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Saigon accent, same breath pattern, same pacing ${pacingWpm} wpm across all segments.`;
      } else {
        pacingWpm = 105;
        toneDescription = "ấm áp, thân thiện, đồng cảm và tự nhiên";
        voicePrompt = `Southern Vietnamese Saigon male voice ${activeAge} years old, warm storytelling tone, friendly and engaging, ${pacingWpm} wpm, 0.2-0.5s pauses. Sound: [Male, ${activeAge}, Southern Vietnamese Saigon accent, ${pacingWpm} wpm, warm friendly, chest resonance]. Voice: consistent warm empathetic tone throughout all segments — naturally shifting emotional inflections without changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Saigon accent, same breath pattern, same pacing ${pacingWpm} wpm across all segments.`;
      }
    } else {
      if (isSenior) {
        pacingWpm = 95;
        toneDescription = "dịu dàng, thủ thỉ, ân cần người mẹ";
        voicePrompt = `Southern Vietnamese Saigon mature female voice ${activeAge} years old, gentle maternal comforting cadence, warm soothing tone, ${pacingWpm} wpm, 0.2-0.5s pauses. Sound: [Female, ${activeAge}, Southern Vietnamese Saigon accent, ${pacingWpm} wpm, maternal warm comforting, chest resonance]. Voice: consistent gentle motherly tone throughout all segments — naturally shifting emotional inflections without changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Saigon accent, same breath pattern, same pacing ${pacingWpm} wpm across all segments.`;
      } else {
        pacingWpm = 105;
        toneDescription = "ấm áp, truyền cảm, đồng cảm và nhẹ nhàng";
        voicePrompt = `Southern Vietnamese Saigon female voice ${activeAge} years old, gentle warm and soothing tone, empathetic and friendly storytelling style, ${pacingWpm} wpm, 0.2-0.5s pauses. Sound: [Female, ${activeAge}, Southern Vietnamese Saigon accent, ${pacingWpm} wpm, warm empathetic, chest resonance]. Voice: consistent gentle empathetic tone throughout all segments — naturally shifting emotional inflections without changing vocal identity. Same timbre, same resonance, same age ${activeAge}, same Saigon accent, same breath pattern, same pacing ${pacingWpm} wpm across all segments.`;
      }
    }
  }

  const regionObj = REGIONAL_ACCENT_OPTIONS.find((r) => r.id === region) || REGIONAL_ACCENT_OPTIONS[0];
  const genderText = isMale ? "Nam" : "Nữ";

  return {
    voice: voicePrompt,
    pacingWpm,
    label: `${regionObj.shortLabel} • ${genderText} (${activeAge}t) - ${toneDescription} [${pacingWpm} wpm]`,
    shortLabel: `${genderText} ${activeAge}t • ${pacingWpm} wpm`,
    genderLabel: isMale ? `Nam chính (${activeAge} tuổi)` : `Nữ chính (${activeAge} tuổi)`,
    toneDescription,
  };
}

export interface RegionalVoiceOption {
  id: string;
  label: string;
  shortLabel: string;
  region: "south" | "north" | "central" | "west";
  pacingWpm: number;
  voice: string;
}

export const REGIONAL_VOICE_OPTIONS: RegionalVoiceOption[] = [
  {
    id: "south",
    label: "Miền Nam: Giọng Sài Gòn / Nam Bộ (Tự động khớp giới tính & tuổi)",
    shortLabel: "Miền Nam (Sài Gòn)",
    region: "south",
    pacingWpm: 105,
    voice: matchRegionalVoice("south", "Vietnamese female", "25-34").voice,
  },
  {
    id: "north",
    label: "Miền Bắc: Giọng Hà Nội / Bắc Bộ (Tự động khớp giới tính & tuổi)",
    shortLabel: "Miền Bắc (Hà Nội)",
    region: "north",
    pacingWpm: 110,
    voice: matchRegionalVoice("north", "Vietnamese female", "25-34").voice,
  },
  {
    id: "central",
    label: "Miền Trung: Giọng Đà Nẵng / Miền Trung (Tự động khớp giới tính & tuổi)",
    shortLabel: "Miền Trung (Đà Nẵng)",
    region: "central",
    pacingWpm: 105,
    voice: matchRegionalVoice("central", "Vietnamese female", "25-34").voice,
  },
  {
    id: "west",
    label: "Miền Tây: Giọng Sông Nước Nam Bộ (Tự động khớp giới tính & tuổi)",
    shortLabel: "Miền Tây (Sông Nước)",
    region: "west",
    pacingWpm: 100,
    voice: matchRegionalVoice("west", "Vietnamese female", "25-34").voice,
  },
];

export interface VideoStyleOption {
  id: string;
  label: string;
  shortLabel: string;
  badge: string;
  prompt: string;
}

export const VIDEO_STYLE_OPTIONS: VideoStyleOption[] = [
  {
    id: "cinematic_realistic",
    label: "🎬 Realistic Cinematic 8K - Người thật chân thực, Điện ảnh cao cấp",
    shortLabel: "Realistic 8K Live-Action (Người thật)",
    badge: "Người thật 8K",
    prompt: "Photorealistic 8K live-action cinematic style, authentic human actors, refined natural skin micro-textures, beautiful catchlight in eyes, natural hair strands, warm cinematic volumetric lighting, 85mm prime lens depth of field, rich lived-in environmental depth, high-end commercial aesthetic (strictly NO plastic cartoon look, NO CGI doll face)",
  },
  {
    id: "pixar_soft_peach",
    label: "✨ 3D Disney/Pixar Cao Cấp - Soft Peach & Volumetric 8K (Chuẩn Feature Film)",
    shortLabel: "3D Pixar Cao Cấp (8K)",
    badge: "3D Feature Film",
    prompt: "High-end Disney Pixar 3D feature animation style, refined human facial anatomy, lifelike subsurface scattering skin shader, expressive authentic eye reflections, beautifully groomed hair strands, soft peach background, warm cinematic volumetric lighting, master 8K render, floating golden micro-particles, fluid physics, (strictly NO cheap plastic doll face, NO uncanny bug-eyes)",
  },
  {
    id: "semi_realistic_3d",
    label: "💎 Semi-Realistic 3D Metahuman (Unreal Engine 5 / Midjourney v6)",
    shortLabel: "Semi-Realistic 3D Metahuman",
    badge: "Metahuman 3D",
    prompt: "Semi-realistic 3D Metahuman cinematic style, Unreal Engine 5 Octane render, photorealistic human proportions blended with stylized cinematic lighting, hyper-detailed skin pores and realistic fabric weave, Ray-traced soft shadows, 8K master quality",
  },
  {
    id: "pixar_warm_amber",
    label: "🌟 3D Pixar - Golden Amber & Emerald Sparkles",
    shortLabel: "3D Pixar Golden Amber",
    badge: "Pixar Amber",
    prompt: "High-end 3D feature animation style, warm golden amber illumination, natural human facial balance, lifelike skin shader, cinematic depth of field, floating luminescent micro-particles, vibrant emerald accents, ultra-smooth 8k render",
  },
  {
    id: "claymation_3d",
    label: "🎨 3D Claymation - Thủ công Stop-Motion ấm cúng",
    shortLabel: "3D Claymation Stop-motion",
    badge: "Claymation",
    prompt: "Handmade 3D claymation stop-motion style, tactile polymer clay textures, soft studio tabletop lighting, warm pastel tones, depth of field, charming craft character aesthetic, 8k",
  },
  {
    id: "ghibli_anime",
    label: "🌿 Anime Studio Ghibli - Màu nước thanh bình",
    shortLabel: "Anime Studio Ghibli",
    badge: "Anime Ghibli",
    prompt: "Studio Ghibli anime aesthetic, lush hand-painted watercolor backgrounds, warm nostalgic afternoon sunlight, cel-shaded soft character design, whimsical organic vibes, highly detailed",
  },
  {
    id: "motion_flat_2d",
    label: "📊 2D Flat Vector & Infographic Hiện Đại",
    shortLabel: "2D Flat Motion Vector",
    badge: "2D Vector",
    prompt: "Modern 2D flat vector animation, isometric health infographic style, clean pastel color palette, smooth geometric shapes, minimal elegant aesthetic, 4k vector",
  },
  {
    id: "medical_3d_hologram",
    label: "🔬 3D Hologram Y Khoa Phát Sáng Công Nghệ Cao",
    shortLabel: "3D Hologram Dạ Dày",
    badge: "3D Hologram",
    prompt: "High-tech 3D medical visualization, transparent glowing anatomical stomach hologram, golden and cyan bio-luminescent particles, sleek dark studio aesthetic, 8k octane render",
  },
];

export interface AspectRatioOption {
  id: "9:16" | "16:9";
  label: string;
  shortLabel: string;
  description: string;
  badge: string;
  iconType: "vertical" | "horizontal";
}

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  {
    id: "9:16",
    label: "9:16 - Khung dọc (TikTok, YouTube Shorts, Reels)",
    shortLabel: "9:16 (Dọc Shorts/TikTok)",
    description: "Tỷ lệ chuẩn 1080x1920 cho TikTok, Shorts, Reels, Storyboard dọc",
    badge: "9:16 Dọc",
    iconType: "vertical",
  },
  {
    id: "16:9",
    label: "16:9 - Khung ngang (YouTube Video, TV, Web)",
    shortLabel: "16:9 (Ngang Widescreen)",
    description: "Tỷ lệ chuẩn 1920x1080 Widescreen Cinematic cho YouTube dài, TV",
    badge: "16:9 Ngang",
    iconType: "horizontal",
  },
];

export interface CharacterGenderOption {
  id: string;
  label: string;
  shortLabel: string;
  value: string;
  group?: "Đơn lẻ" | "Cặp đôi / Nhóm" | "Theo độ tuổi";
}

export const CHARACTER_GENDER_OPTIONS: CharacterGenderOption[] = [
  { id: "female_std", label: "Nữ (Vietnamese female)", shortLabel: "Nữ", value: "Vietnamese female", group: "Đơn lẻ" },
  { id: "male_std", label: "Nam (Vietnamese male)", shortLabel: "Nam", value: "Vietnamese male", group: "Đơn lẻ" },
  { id: "both_couple", label: "Cả Nam & Nữ (Cặp đôi / Vợ chồng / Duo)", shortLabel: "Cả Nam & Nữ (Cặp đôi)", value: "Both Vietnamese female and male (Couple / Duo)", group: "Cặp đôi / Nhóm" },
  { id: "both_colleagues", label: "Cả Nam & Nữ (Đồng nghiệp / Bạn bè)", shortLabel: "Cả Nam & Nữ (Đồng nghiệp)", value: "Both Vietnamese female and male (Colleagues / Friends)", group: "Cặp đôi / Nhóm" },
  { id: "both_family", label: "Cả Gia Đình (Nam, Nữ & Trẻ nhỏ)", shortLabel: "Cả Gia Đình (Nam, Nữ)", value: "Vietnamese family (Male, Female & children)", group: "Cặp đôi / Nhóm" },
  { id: "female_young", label: "Nữ trẻ (20-28 tuổi)", shortLabel: "Nữ trẻ (20-28)", value: "Young adult Vietnamese female (20-28)", group: "Theo độ tuổi" },
  { id: "male_young", label: "Nam trẻ (20-28 tuổi)", shortLabel: "Nam trẻ (20-28)", value: "Young adult Vietnamese male (20-28)", group: "Theo độ tuổi" },
  { id: "female_middle", label: "Nữ trung niên (35-50 tuổi)", shortLabel: "Nữ trung niên (35-50)", value: "Middle-aged Vietnamese female (35-50)", group: "Theo độ tuổi" },
  { id: "male_middle", label: "Nam trung niên (35-50 tuổi)", shortLabel: "Nam trung niên (35-50)", value: "Middle-aged Vietnamese male (35-50)", group: "Theo độ tuổi" },
  { id: "female_senior", label: "Nữ lớn tuổi (55-70 tuổi)", shortLabel: "Nữ lớn tuổi (55-70)", value: "Senior Vietnamese woman (55-70)", group: "Theo độ tuổi" },
  { id: "male_senior", label: "Nam lớn tuổi (55-70 tuổi)", shortLabel: "Nam lớn tuổi (55-70)", value: "Senior Vietnamese man (55-70)", group: "Theo độ tuổi" },
  { id: "flexible", label: "Linh hoạt phân vai theo từng cảnh", shortLabel: "Linh hoạt", value: "Flexible (Both female and male as per scene role)", group: "Cặp đôi / Nhóm" },
];


