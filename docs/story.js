// Minimal "story map" playback prototype.
// A narrative is a small JSON script: a sequence of {center, zoom, layers, caption}
// steps. It's compressed and carried in the URL fragment (#story=...), never sent
// to any server — matches Staccato's "Staff hands the User a link" model without
// needing a backend or POST.
//
// Staff's job (not implemented here) is to produce this JSON. This file only plays it.
//
// Target language list (intent to support, not all equally battle-tested):
// - UN's six official languages: en, fr, es, ru, zh, ar
// - de, ja: dwg7/this session's own working languages
// - it: FAO is headquartered in Rome — a deliberate nod to the host country,
//   not just UN-official coverage
// - sw: the harder regional challenge — DRC's own official language is French,
//   already in the UN set, so Swahili (actually spoken in the story's setting,
//   eastern DRC) is the one that genuinely stretches this
// Machine-translated by this session, not reviewed by native speakers — treat as
// a working demonstration of the mechanism, not publication-ready copy.

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "ru", label: "Русский" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "it", label: "Italiano" },
  { code: "sw", label: "Kiswahili" }
];

const SAMPLE_STORY = {
  title: {
    en: "DR Congo: A Small Mystery in Maize Storage",
    fr: "RD Congo : un petit mystère autour du stockage du maïs",
    es: "RD del Congo: un pequeño misterio sobre el almacenamiento de maíz",
    ru: "ДР Конго: небольшая загадка хранения кукурузы",
    zh: "刚果民主共和国:玉米仓储选址的小谜团",
    ar: "جمهورية الكونغو الديمقراطية: لغز صغير حول تخزين الذرة",
    de: "DR Kongo: Ein kleines Rätsel bei der Maislagerung",
    ja: "DRコンゴ:メイズ貯蔵をめぐる小さな謎",
    it: "RD del Congo: un piccolo mistero sullo stoccaggio del mais",
    sw: "DR Kongo: Fumbo dogo kuhusu uhifadhi wa mahindi"
  },
  steps: [
    {
      center: [29.44, 0.50], zoom: 8,
      layers: ["gaez-aez33"],
      caption: {
        en: "Right on the equator, in northeastern DR Congo. This area falls under GAEZ zone “3: Tropics, lowland, humid” — textbook favorable conditions for growing maize.",
        fr: "En plein sur l’équateur, dans le nord-est de la RD Congo. Cette zone appartient à la classe GAEZ « 3 : tropiques, basses terres, humide » — des conditions classiquement favorables à la culture du maïs.",
        es: "Justo sobre el ecuador, en el noreste de la RD del Congo. Esta zona pertenece a la clase GAEZ «3: trópicos, tierras bajas, húmedo» — condiciones clásicamente favorables para el cultivo de maíz.",
        ru: "Прямо на экваторе, на северо-востоке ДР Конго. Этот район относится к зоне GAEZ «3: тропики, низменность, влажный климат» — классически благоприятные условия для выращивания кукурузы.",
        zh: "地处赤道正下方，刚果民主共和国东北部。这一带属于GAEZ「3类：热带低地、湿润」区——教科书上公认适合种植玉米的典型区域。",
        ar: "على خط الاستواء تمامًا، في شمال شرق جمهورية الكونغو الديمقراطية. تقع هذه المنطقة ضمن تصنيف GAEZ رقم «3: مناطق استوائية منخفضة ورطبة» — وهي ظروف مثالية تقليدياً لزراعة الذرة.",
        de: "Direkt am Äquator, im Nordosten der DR Kongo. Dieses Gebiet gehört zur GAEZ-Zone „3: Tropen, Tiefland, feucht“ — klassischerweise günstige Bedingungen für Maisanbau.",
        ja: "赤道直下、DRコンゴ北東部。この一帯はGAEZ区分「3：熱帯低地・湿潤」——教科書的にはメイズ栗培に向くとされる典型的なゾーンです。",
        it: "Proprio sull'equatore, nel nord-est della RD del Congo. Quest'area rientra nella zona GAEZ «3: tropicale, pianura, umido» — condizioni tradizionalmente favorevoli per la coltivazione del mais.",
        sw: "Karibu kabisa na ikweta, kaskazini-mashariki mwa DR Kongo. Eneo hili liko chini ya eneo la GAEZ “3: tropiki, nchi tambarare, unyevunyevu” — hali zinazojulikana kuwa nzuri kwa kilimo cha mahindi."
      }
    },
    {
      center: [29.44, 0.50], zoom: 10,
      layers: ["gaez-aez33", "hih-cod-maize-score"],
      caption: {
        en: "Overlaying FAO's maize storage suitability score, this spot scores 57.4 — decent, but not outstanding.",
        fr: "En superposant le score d’adéquation au stockage du maïs de la FAO, ce point obtient 57,4 — correct, sans être exceptionnel.",
        es: "Al superponer el puntaje de idoneidad para almacenamiento de maíz de la FAO, este punto obtiene 57,4 — decente, pero no excepcional.",
        ru: "Наложив оценку пригодности для хранения кукурузы ФАО, получаем здесь 57,4 балла — неплохо, но не выдающийся результат.",
        zh: "叠加FAO的玉米仓储适宜性评分后，这一点得分为57.4——不差，但也算不上突出。",
        ar: "عند تركيب مؤشر ملاءمة تخزين الذرة الخاص بالفاو، تحصل هذه النقطة على 57.4 — درجة لا بأس بها لكنها ليست استثنائية.",
        de: "Legt man den FAO-Eignungswert für Maislagerung darüber, erreicht dieser Punkt 57,4 — solide, aber nicht herausragend.",
        ja: "FAOのメイズ貯蔵適地スコアを重ねると、この地点は57.4点。悪くはないが、突出して高いわけでもありません。",
        it: "Sovrapponendo il punteggio di idoneità allo stoccaggio del mais della FAO, questo punto ottiene 57,4 — discreto, ma non eccezionale.",
        sw: "Tukiweka alama ya ufaafu wa uhifadhi wa mahindi ya FAO juu yake, sehemu hii inapata alama 57.4 — si mbaya, lakini si ya juu sana pia."
      }
    },
    {
      center: [29.57, -0.87], zoom: 11,
      layers: ["hih-cod-maize-score", "hih-cod-maize-final"],
      caption: {
        en: "Yet the site FAO actually selected (the red polygon) lies about 150km to the south. Its GAEZ zone is “26: Land with severe soil/terrain limitations” — supposedly unfavorable — but it scores 65.5, actually higher than the site to the north.",
        fr: "Pourtant, le site réellement retenu par la FAO (le polygone rouge) se trouve à environ 150 km au sud. Sa classe GAEZ est « 26 : terres à fortes contraintes de sol/relief » — théoriquement défavorable — mais son score de 65,5 est en fait plus élevé que celui du site nord.",
        es: "Sin embargo, el sitio que la FAO eligió realmente (el polígono rojo) está unos 150 km al sur. Su clase GAEZ es «26: tierra con severas limitaciones de suelo/relieve» — supuestamente desfavorable — pero su puntaje de 65,5 es en realidad más alto que el del sitio norte.",
        ru: "Однако участок, который ФАО выбрала на самом деле (красный полигон), находится примерно на 150 км южнее. Его зона GAEZ — «26: земли с серьёзными почвенно-рельефными ограничениями» — считается неблагоприятной, но его оценка 65,5 на самом деле выше, чем у северного участка.",
        zh: "然而FAO实际选定的最终候选地点（红色多边形）却在南边约150公里处。这里GAEZ区分是「26类：土壤/地形存在严重制约的土地」——理论上不利，但评分65.5反而高于北边的地点。",
        ar: "لكن الموقع الذي اختارته الفاو فعليًا (المضلع الأحمر) يقع على بعد نحو 150 كم جنوبًا. تصنيف GAEZ هنا هو «26: أرض ذات قيود شديدة في التربة والتضاريس» — أي غير مواتية نظريًا — ومع ذلك حصلت على 65.5، وهي أعلى فعليًا من الموقع الشمالي.",
        de: "Der von der FAO tatsächlich ausgewählte Standort (das rote Polygon) liegt jedoch etwa 150 km weiter südlich. Die GAEZ-Zone dort ist „26: Land mit erheblichen Boden-/Geländeeinschränkungen“ — theoretisch ungünstig — dennoch liegt der Wert bei 65,5, höher als im nördlichen Gebiet.",
        ja: "ところが実際にFAOが選んだ最終候補地（赤いポリゴン）は、南へ約150km。ここのGAEZ区分は「26：深刻な土壌・地形制約のある土地」——教科書的には不利とされる土地なのに、スコアは65.5と、むしろ北側より高いのです。",
        it: "Tuttavia, il sito effettivamente scelto dalla FAO (il poligono rosso) si trova circa 150 km più a sud. La sua zona GAEZ è «26: terra con gravi limitazioni di suolo/terreno» — teoricamente sfavorevole — ma il suo punteggio di 65,5 è in realtà più alto di quello del sito settentrionale.",
        sw: "Hata hivyo, eneo ambalo FAO ilichagua hasa (mche mwekundu) liko takribani kilomita 150 kusini. Eneo la GAEZ hapa ni “26: ardhi yenye vikwazo vikubwa vya udongo/ardhi” — inayodhaniwa kuwa mbaya — lakini alama yake ya 65.5 ni ya juu zaidi kuliko eneo la kaskazini."
      }
    },
    {
      center: [29.57, -0.87], zoom: 11,
      layers: ["gaez-aez33", "hih-cod-maize-score", "hih-cod-maize-final"],
      caption: {
        en: "Why would the “constrained” land score higher? FAO's Hand-in-Hand scores are actually a GIS-based multi-criteria evaluation combining climatic suitability with accessibility and poverty-reduction priority. Given the Initiative's real mission — ending poverty and hunger (SDG1/SDG2) — it makes sense that a place which improves people's lives could be chosen even if it isn't agronomically ideal.",
        fr: "Pourquoi une terre « contrainte » obtient-elle un meilleur score ? En réalité, les scores du Hand-in-Hand de la FAO combinent, via une évaluation SIG multicritères, l’adéquation climatique, l’accessibilité et la priorité de réduction de la pauvreté. Au regard de la mission réelle de l’Initiative — éliminer la pauvreté et la faim (ODD1/ODD2) — il est logique qu’un lieu améliorant les conditions de vie soit retenu, même s’il n’est pas idéal sur le plan agronomique.",
        es: "¿Por qué una tierra «restringida» obtiene un puntaje más alto? En realidad, los puntajes de Hand-in-Hand de la FAO son una evaluación SIG multicriterio que combina la idoneidad climática con la accesibilidad y la prioridad de reducción de la pobreza. Dada la misión real de la Iniciativa —acabar con la pobreza y el hambre (ODS1/ODS2)— tiene sentido que se elija un lugar que mejora la vida de las personas, aunque no sea agronómicamente ideal.",
        ru: "Почему «ограниченная» земля получила более высокую оценку? На самом деле оценки Hand-in-Hand ФАО — это многокритериальная ГИС-оценка, сочетающая климатическую пригодность с доступностью и приоритетом сокращения бедности. Учитывая реальную миссию Инициативы — искоренение бедности и голода (ЦУР-1/ЦУР-2), — логично, что может быть выбрано место, улучшающее жизнь людей, даже если оно не идеально с агрономической точки зрения.",
        zh: "为什么「受制约」的土地反而得分更高？其实HIH的评分并非只看气候适宜性，而是结合可达性与减贫优先度的GIS多准则综合评估（据FAO资料）。从消除贫困与饥饿（SDG1/SDG2）这一Hand-in-Hand的真正使命出发，即使在农学上并非最理想，只要能实实在在改善人们生活的地方被选中，也就顺理成章了。",
        ar: "لماذا حصلت الأرض «المقيدة» على درجة أعلى؟ في الواقع، درجات مبادرة يدًا بيد التابعة للفاو هي تقييم متعدد المعايير قائم على نظم المعلومات الجغرافية، يجمع بين الملاءمة المناخية وإمكانية الوصول وأولوية الحد من الفقر. وبالنظر إلى المهمة الحقيقية للمبادرة — القضاء على الفقر والجوع (الهدفان 1 و 2 من أهداف التنمية المستدامة) — فمن المنطقي أن يُختار مكان يحسّن حياة الناس، حتى لو لم يكن مثاليًا من الناحية الزراعية.",
        de: "Warum erzielt das „eingeschränkte“ Land einen höheren Wert? Die Hand-in-Hand-Werte der FAO sind tatsächlich eine GIS-gestützte Multikriterien-Bewertung, die klimatische Eignung mit Erreichbarkeit und Priorität der Armutsbekämpfung kombiniert. Angesichts der eigentlichen Mission der Initiative — Beseitigung von Armut und Hunger (SDG1/SDG2) — ist es folgerichtig, dass ein Ort gewählt wird, der das Leben der Menschen verbessert, auch wenn er agronomisch nicht ideal ist.",
        ja: "なぜ「制約あり」の土地の方が高く評価されたのでしょうか？ 実はHIHのスコアは気候適性だけでなく、アクセス性や貧困削減の優先度も組み合わせたGISによる多基準評価です（FAO資料より）。貪困・飢餓解消（SDG1/SDG2）というHand-in-Handの本来のミッションに沿えば、「農業的には理想的でなくても、人々の生活改善に効く場所」が選ばれるのは自然なことなのです。",
        sw: "Kwa nini ardhi yenye “vikwazo” ilipata alama ya juu zaidi? Kwa kweli, alama za Hand-in-Hand za FAO ni tathmini ya vigezo vingi vya GIS inayochanganya ufaafu wa hali ya hewa na ufikiaji na kipaumbele cha kupunguza umaskini. Kwa kuzingatia dhamira halisi ya Mpango huu — kutokomeza umaskini na njaa (SDG1/SDG2) — ni jambo la kawaida kwamba mahali panapoboresha maisha ya watu paweza kuchaguliwa, hata kama si bora zaidi kikilimo."
      }
    }
  ]
};

function encodeStory(story) {
  const json = JSON.stringify(story);
  return LZString.compressToEncodedURIComponent(json);
}

function decodeStory(encoded) {
  const json = LZString.decompressFromEncodedURIComponent(encoded);
  return json ? JSON.parse(json) : null;
}

// staccato-spec ADR 0004 (one-shot fragment hand-off): a fragment-carried intent
// MUST be read at most once and cleared via history.replaceState before any
// rendering derived from it occurs, so a URL copied after the map renders is
// indistinguishable from one with no fragment at all — not bookmarkable/replayable
// map state. Shared by every fragment-carried key this Cartographer accepts
// (#intent=, #story=, #q=) rather than reimplemented per key — D21/D22 already
// found and fixed a real ADR-0004 compliance bug from exactly this kind of
// duplication. Lives here (loaded first, before map_intent.js) so every reader
// can call it regardless of script order; actual calls only happen inside
// init()'s map.on("load", ...), by which point every script has already loaded.
//
// The whole hash is treated as ONE key's value (not "&"-split into multiple
// coexisting top-level keys) — found the hard way while adding #q=: unlike
// #intent=/#story= (opaque LZString blobs with no literal "&" inside), #q='s
// own value is itself a multi-param blob using "&" as an internal delimiter
// (req=...&lat=...&lng=...), which collides with any scheme that treats "&"
// as a top-level key separator. The old multi-key "&"-joined design existed
// only to coexist with MapLibre's own hash:"map" reflection (removed, D22) —
// with that gone, none of #intent=/#story=/#q= are ever actually combined in
// one URL (each is a complete, standalone hand-off), so there's nothing left
// to preserve after clearing: the whole hash is consumed and cleared as a unit.
function readAndClearFragmentKey(key) {
  const raw = location.hash.replace(/^#/, "");
  if (!raw.startsWith(key + "=")) return null;
  const value = raw.slice(key.length + 1);
  history.replaceState(null, "", location.pathname + location.search);
  return value;
}

function getStoryFromUrl() {
  const encoded = readAndClearFragmentKey("story");
  if (encoded === null) return null;
  try {
    return decodeStory(decodeURIComponent(encoded));
  } catch (e) {
    console.error("failed to decode story from URL", e);
    return null;
  }
}

function setStoryInUrl(story) {
  const encoded = encodeStory(story);
  const raw = location.hash.replace(/^#/, "");
  const parts = raw ? raw.split("&").filter((p) => !p.startsWith("story=")) : [];
  parts.push("story=" + encoded);
  location.hash = parts.join("&");
}

function pickLang(field, lang) {
  if (typeof field === "string") return field; // backward-compat: plain string caption
  return field[lang] || field.en || Object.values(field)[0];
}
