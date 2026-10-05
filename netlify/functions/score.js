// AfroCurl Clarity — protected Crown Score analysis
// Proprietary scoring logic stays server-side. Do not move this into browser code.

const INGREDIENT_DB = {
  // HUMECTANTS
  'glycerin':{name:'Glycerin',type:'humectant',petals:{porosity:1,elasticity:1,length:0,scalp:1},goodFor:['low','medium','high'],caution:[],effect:'Draws moisture into the hair shaft. Works best in humid environments.',fn:'Humectant'},
  'glycerine':{name:'Glycerine',type:'humectant',petals:{porosity:1,elasticity:1,length:0,scalp:1},goodFor:['low','medium','high'],caution:[],effect:'Draws moisture into the hair shaft.',fn:'Humectant'},
  'aloe vera':{name:'Aloe Vera',type:'humectant',petals:{porosity:1,elasticity:1,length:1,scalp:1},goodFor:['low','medium','high'],caution:[],effect:'Hydrates, soothes scalp, adds slip and shine.',fn:'Humectant'},
  'aloe barbadensis leaf juice':{name:'Aloe Vera',type:'humectant',petals:{porosity:1,elasticity:1,length:1,scalp:1},goodFor:['low','medium','high'],caution:[],effect:'Hydrates, soothes scalp, adds slip.',fn:'Humectant'},
  'panthenol':{name:'Panthenol (Pro-Vitamin B5)',type:'humectant',petals:{porosity:1,elasticity:2,length:1,scalp:1},goodFor:['low','medium','high'],caution:[],effect:'Penetrates the hair shaft, improves elasticity and moisture retention.',fn:'Humectant'},
  'honey':{name:'Honey',type:'humectant',petals:{porosity:1,elasticity:1,length:0,scalp:0},goodFor:['medium','high'],caution:['low'],effect:'Strong humectant; can cause hygral fatigue in high porosity hair if overused.',fn:'Humectant'},
  'sorbitol':{name:'Sorbitol',type:'humectant',petals:{porosity:1,elasticity:0,length:0,scalp:0},goodFor:['medium','high'],caution:[],effect:'Attracts and retains moisture.',fn:'Humectant'},
  // FATTY ALCOHOLS
  'cetyl alcohol':{name:'Cetyl Alcohol',type:'fatty_alcohol',petals:{porosity:1,elasticity:1,length:0,scalp:0},goodFor:['medium','high'],caution:['low'],effect:'Emollient and emulsifier. Can cause buildup on low porosity hair.',fn:'Fatty Alcohol'},
  'cetearyl alcohol':{name:'Cetearyl Alcohol',type:'fatty_alcohol',petals:{porosity:1,elasticity:1,length:0,scalp:0},goodFor:['medium','high'],caution:['low'],effect:'Softens and conditions. Blend of cetyl and stearyl alcohols.',fn:'Fatty Alcohol'},
  'stearyl alcohol':{name:'Stearyl Alcohol',type:'fatty_alcohol',petals:{porosity:1,elasticity:0,length:0,scalp:0},goodFor:['medium','high'],caution:['low'],effect:'Emollient. May build up on low porosity hair.',fn:'Fatty Alcohol'},
  // PROTEINS
  'hydrolyzed keratin':{name:'Hydrolysed Keratin',type:'protein',petals:{porosity:0,elasticity:2,length:1,scalp:0},goodFor:['high'],caution:['low'],effect:'Strengthens damaged hair. Can cause stiffness if hair is protein-sensitive.',fn:'Protein'},
  'hydrolyzed wheat protein':{name:'Hydrolysed Wheat Protein',type:'protein',petals:{porosity:0,elasticity:2,length:1,scalp:0},goodFor:['high'],caution:['low'],effect:'Adds strength and body. Good for fine or damaged hair.',fn:'Protein'},
  'hydrolyzed silk protein':{name:'Hydrolysed Silk Protein',type:'protein',petals:{porosity:0,elasticity:2,length:1,scalp:0},goodFor:['medium','high'],caution:[],effect:'Lightweight protein that adds shine and smoothness.',fn:'Protein'},
  'hydrolyzed collagen':{name:'Hydrolysed Collagen',type:'protein',petals:{porosity:0,elasticity:2,length:1,scalp:0},goodFor:['high'],caution:['low'],effect:'Strengthens and improves elasticity.',fn:'Protein'},
  // OILS
  'coconut oil':{name:'Coconut Oil',type:'oil',petals:{porosity:1,elasticity:1,length:2,scalp:1},goodFor:['high'],caution:['low'],effect:'Penetrating oil. Can cause dryness on low porosity hair by blocking moisture.',fn:'Oil'},
  'jamaican black castor oil':{name:'Jamaican Black Castor Oil',type:'oil',petals:{porosity:0,elasticity:0,length:2,scalp:2},goodFor:['medium','high'],caution:['fine'],effect:'Stimulates scalp circulation. Supports length retention.',fn:'Oil'},
  'castor oil':{name:'Castor Oil',type:'oil',petals:{porosity:0,elasticity:0,length:2,scalp:2},goodFor:['medium','high'],caution:[],effect:'Thick oil supporting scalp health and length retention.',fn:'Oil'},
  'argan oil':{name:'Argan Oil',type:'oil',petals:{porosity:1,elasticity:1,length:1,scalp:1},goodFor:['low','medium','high'],caution:[],effect:'Lightweight oil with antioxidants. Adds shine without heaviness.',fn:'Oil'},
  'jojoba oil':{name:'Jojoba Oil',type:'oil',petals:{porosity:1,elasticity:1,length:1,scalp:2},goodFor:['low','medium','high'],caution:[],effect:'Most similar to scalp\'s natural sebum. Balances moisture.',fn:'Oil'},
  'sweet almond oil':{name:'Sweet Almond Oil',type:'oil',petals:{porosity:1,elasticity:1,length:1,scalp:1},goodFor:['low','medium','high'],caution:[],effect:'Lightweight, nourishing. Good for all hair types.',fn:'Oil'},
  'olive oil':{name:'Olive Oil',type:'oil',petals:{porosity:1,elasticity:1,length:1,scalp:1},goodFor:['medium','high'],caution:['low'],effect:'Rich, penetrating oil. Can feel heavy on fine or low porosity hair.',fn:'Oil'},
  // BUTTERS
  'shea butter':{name:'Shea Butter',type:'butter',petals:{porosity:0,elasticity:1,length:2,scalp:1},goodFor:['high'],caution:['low','fine'],effect:'Rich emollient. Seals moisture but can build up on low porosity hair.',fn:'Butter'},
  'mango butter':{name:'Mango Butter',type:'butter',petals:{porosity:0,elasticity:1,length:1,scalp:0},goodFor:['medium','high'],caution:['low'],effect:'Rich, nourishing. Slightly lighter than shea.',fn:'Butter'},
  'cocoa butter':{name:'Cocoa Butter',type:'butter',petals:{porosity:0,elasticity:1,length:1,scalp:0},goodFor:['high'],caution:['low','fine'],effect:'Very rich emollient. Best for coarse, dry or high porosity hair.',fn:'Butter'},
  // SILICONES
  'dimethicone':{name:'Dimethicone',type:'silicone',petals:{porosity:-1,elasticity:0,length:0,scalp:-1},goodFor:[],caution:['all'],effect:'Non-water-soluble silicone. Builds up and blocks moisture over time.',fn:'Silicone'},
  'cyclomethicone':{name:'Cyclomethicone',type:'silicone',petals:{porosity:0,elasticity:0,length:0,scalp:0},goodFor:['low','medium','high'],caution:[],effect:'Evaporating silicone — lightweight and does not build up.',fn:'Silicone'},
  'amodimethicone':{name:'Amodimethicone',type:'silicone',petals:{porosity:0,elasticity:0,length:0,scalp:0},goodFor:['low','medium'],caution:['high'],effect:'Water-soluble silicone that improves slip without major buildup.',fn:'Silicone'},
  // SURFACTANTS / CLEANSERS
  'sodium lauryl sulfate':{name:'Sodium Lauryl Sulfate (SLS)',type:'surfactant',petals:{porosity:-1,elasticity:-1,length:-1,scalp:-1},goodFor:[],caution:['all'],effect:'Harsh surfactant. Strips natural oils, causes dryness and irritation.',fn:'Surfactant'},
  'sodium laureth sulfate':{name:'Sodium Laureth Sulfate (SLES)',type:'surfactant',petals:{porosity:-1,elasticity:0,length:-1,scalp:-1},goodFor:[],caution:['all'],effect:'Moderately harsh. Can cause dryness with frequent use.',fn:'Surfactant'},
  'cocamidopropyl betaine':{name:'Cocamidopropyl Betaine',type:'surfactant',petals:{porosity:1,elasticity:0,length:0,scalp:1},goodFor:['low','medium','high'],caution:[],effect:'Gentle, conditioning surfactant. Often paired with sulphates to reduce harshness.',fn:'Surfactant'},
  'sodium cocoyl isethionate':{name:'Sodium Cocoyl Isethionate',type:'surfactant',petals:{porosity:1,elasticity:0,length:0,scalp:1},goodFor:['low','medium','high'],caution:[],effect:'Very gentle, conditioning cleanser. Great for afro-textured hair.',fn:'Surfactant'},
  // SCALP
  'salicylic acid':{name:'Salicylic Acid',type:'scalp_active',petals:{porosity:0,elasticity:0,length:0,scalp:2},goodFor:['oily','flaking'],caution:[],effect:'Exfoliates scalp. Helps with flaking and product buildup.',fn:'Scalp Active'},
  'tea tree oil':{name:'Tea Tree Oil',type:'scalp_active',petals:{porosity:0,elasticity:0,length:0,scalp:2},goodFor:['oily','sensitive'],caution:[],effect:'Antimicrobial. Soothes scalp irritation and reduces flaking.',fn:'Scalp Active'},
  'zinc pyrithione':{name:'Zinc Pyrithione',type:'scalp_active',petals:{porosity:0,elasticity:0,length:0,scalp:2},goodFor:['flaking','oily'],caution:[],effect:'Anti-dandruff active. Reduces fungal growth on scalp.',fn:'Scalp Active'},
  // OCCLUSIVES
  'petrolatum':{name:'Petrolatum (Petroleum Jelly)',type:'occlusive',petals:{porosity:-1,elasticity:0,length:0,scalp:-1},goodFor:['high'],caution:['low','medium'],effect:'Seals moisture but blocks absorption. Best used sparingly on high porosity ends.',fn:'Occlusive'},
  'mineral oil':{name:'Mineral Oil',type:'occlusive',petals:{porosity:-1,elasticity:0,length:0,scalp:-1},goodFor:['high'],caution:['low'],effect:'Occlusive. Prevents moisture absorption if applied before water-based products.',fn:'Occlusive'},
  // PRESERVATIVES
  'phenoxyethanol':{name:'Phenoxyethanol',type:'preservative',petals:{porosity:0,elasticity:0,length:0,scalp:0},goodFor:['low','medium','high'],caution:[],effect:'Common preservative. Generally well-tolerated.',fn:'Preservative'},
  'sodium benzoate':{name:'Sodium Benzoate',type:'preservative',petals:{porosity:0,elasticity:0,length:0,scalp:0},goodFor:['low','medium','high'],caution:[],effect:'Preservative that maintains product safety and shelf life.',fn:'Preservative'},
  // FRAGRANCE / SENSITISERS
  'fragrance':{name:'Fragrance/Parfum',type:'sensitiser',petals:{porosity:0,elasticity:0,length:0,scalp:-1},goodFor:[],caution:['sensitive'],effect:'May cause scalp sensitivity or allergic reactions in some people.',fn:'Fragrance'},
  'parfum':{name:'Parfum (Fragrance)',type:'sensitiser',petals:{porosity:0,elasticity:0,length:0,scalp:-1},goodFor:[],caution:['sensitive'],effect:'May irritate sensitive scalp. Often contains undisclosed compounds.',fn:'Fragrance'},
};

function parseIngredients(text){
  if(!text) return [];
  return text
    .split(/[,;]+/)
    .map(s=>s.trim())
    .filter(s=>s.length>1 && s.length<80);
}

function matchIngredient(raw){
  const lower = raw.toLowerCase().trim();
  for(const key of Object.keys(INGREDIENT_DB)){
    if(lower.includes(key) || key.includes(lower)) return {key, ...INGREDIENT_DB[key]};
  }
  return null;
}

function scoreIngredients(ingredientList, profile){
  let total = 0, count = 0, recognised = 0;
  const details = [];

  for(const raw of ingredientList){
    const match = matchIngredient(raw);
    if(match){
      recognised++;
      let pts = 0;
      const p = match.petals;
      // Positive signals
      if(p.porosity>0) pts += profile ? (profile.porosity==='high'?15:profile.porosity==='medium'?12:8) : 10;
      if(p.elasticity>0) pts += 10;
      if(p.length>0) pts += 8;
      if(p.scalp>0) pts += 8;
      if(p.elasticity===2) pts += 5;
      if(p.length===2) pts += 5;
      if(p.scalp===2) pts += 5;
      // Negative signals
      if(p.porosity<0) pts -= 20;
      if(p.scalp<0) pts -= 15;
      // Caution for profile
      if(profile && match.caution){
        if(match.caution.includes('all') || match.caution.includes(profile.porosity)) pts -= 18;
        if(match.caution.includes('sensitive') && profile.scalp && profile.scalp.includes('Sensitive')) pts -= 10;
      }
      total += pts;
      count++;
      details.push({raw, match, pts});
    } else {
      details.push({raw, match:null, pts:0});
    }
  }

  if(count===0) return {score:50, confidence:'low', details, recognised:0};
  const rawScore = 50 + (total / count);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const confidence = recognised < 3 ? 'low' : recognised < 8 ? 'medium' : 'high';
  return {score, confidence, details, recognised};
}

function scoreTier(s){
  if(s>=85) return {tier:'Sovereign Approved',color:'#1a7a4a',bg:'#e6f9f0',desc:'Highly aligned with your hair profile.'};
  if(s>=65) return {tier:'Supportive Choice',color:'#2d3a8c',bg:'#e8eeff',desc:'Generally beneficial with minor considerations.'};
  if(s>=40) return {tier:'Mixed Balance',color:'#7a5c1a',bg:'#fff8e6',desc:'Contains both supportive and conflicting ingredients.'};
  return {tier:'Reactive Risk',color:'#7a1a2a',bg:'#ffeef0',desc:'Likely to disrupt moisture or protein balance.'};
}



function publicTier(s){
  if(s>=85) return {tier:'Excellent Match',desc:'Highly aligned with your current hair profile.'};
  if(s>=65) return {tier:'Good Match',desc:'Generally supportive, with some considerations depending on how you use it.'};
  if(s>=40) return {tier:'Use with Awareness',desc:'A mixed fit. Some ingredients may support your hair while others may need more mindful use.'};
  return {tier:'Poor Match',desc:'This formulation may be less aligned with your current hair profile and needs.'};
}

exports.handler = async (event) => {
  const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers,body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,headers,body:JSON.stringify({error:'Method not allowed'})};
  try{
    const body=JSON.parse(event.body||'{}');
    const ingredients=typeof body.ingredients==='string'?body.ingredients:'';
    const profile=body.profile&&typeof body.profile==='object'?body.profile:null;
    if(!ingredients.trim()) return {statusCode:400,headers,body:JSON.stringify({error:'Ingredients are required.'})};
    const ingList=parseIngredients(ingredients);
    const analysis=scoreIngredients(ingList,profile);
    const tier=publicTier(analysis.score);
    const supportive=analysis.details.filter(d=>d.match&&d.pts>5).slice(0,10).map(d=>({name:d.match.name,effect:d.match.effect}));
    const caution=analysis.details.filter(d=>d.match&&d.pts<0).slice(0,6).map(d=>({name:d.match.name,effect:d.match.effect,type:d.match.type}));
    const factors=[];
    if(profile?.porosity) factors.push('Your '+String(profile.porosity).toLowerCase()+' porosity profile influenced how moisture-supporting and heavier ingredients were interpreted.');
    if(profile?.elasticity) factors.push('Your elasticity profile was considered when interpreting strengthening and conditioning ingredients.');
    if(Array.isArray(profile?.scalp)&&profile.scalp.length) factors.push('Your scalp needs were considered when flagging ingredients that may need extra awareness.');
    if(Array.isArray(profile?.goals)&&profile.goals.length) factors.push('Your current hair goals provide context for how useful this product may be within your routine.');
    return {statusCode:200,headers,body:JSON.stringify({score:analysis.score,confidence:analysis.confidence,recognised:analysis.recognised,totalIngredients:ingList.length,tier:tier.tier,summary:tier.desc,supportive,caution,unknownCount:analysis.details.filter(d=>!d.match).length,factors:factors.slice(0,4)})};
  }catch(err){
    console.error('Score function error:',err);
    return {statusCode:500,headers,body:JSON.stringify({error:'Analysis failed. Please try again.'})};
  }
};
