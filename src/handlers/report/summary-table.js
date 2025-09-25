export async function evaluateSummaryTable(page, data) {
  await page.evaluate((inputs) => {
    // shorthand icons
    const CHK = '<span class="icon-check">✔</span> ';
    const TOOL = '<span class="icon-tool">🛠</span> ';

    // --- Normalisers & helpers
    const normStr = v => (typeof v === 'string' ? v.trim().toLowerCase() : v);
    const num = v => (typeof v === 'number' ? v : Number(v) || 0);

    // ---- 1) Demographic factors
    const goodDemo = [];
    const improveDemo = [];

    // edu
    if (normStr(inputs.edu_cat) === 'tertiary') {
      goodDemo.push('Your highest qualification was tertiary education');
    } else if (inputs.edu_cat) {
      improveDemo.push(`Your highest qualification was ${inputs.edu_cat} education`);
    }

    // optional messaging hooks (kept light, but present)
    // if (inputs.gender) {
    //   // e.g., tailor text if needed
    // }
    // if (inputs.age_cat) {
    //   // e.g., age-specific guidance
    // }

    // ---- 2) Medical risk factors
    const goodMed = [];
    const improveMed = [];

    // cholesterol overall
    if (normStr(inputs.cholesterol) === 'normal') goodMed.push('Normal cholesterol level');
    else if (inputs.cholesterol) improveMed.push('Abnormal cholesterol level');

    // lipid detail
    if (normStr(inputs.low_hdl) === 'yes') improveMed.push('Low HDL cholesterol');
    if (normStr(inputs.high_ldl) === 'yes') improveMed.push('High LDL cholesterol');

    // diabetes
    if (normStr(inputs.diabetes) === 'no') goodMed.push('No diabetes');
    else if (inputs.diabetes) improveMed.push('Having diabetes');

    // prior stroke
    if (normStr(inputs.stroke) === 'no') goodMed.push('No prior stroke');
    else if (inputs.stroke) improveMed.push('History of stroke');

    // traumatic brain injury
    if (normStr(inputs.tbi) === 'no') goodMed.push('No prior brain injury');
    else if (inputs.tbi) improveMed.push('Having prior brain injury');

    // hypertension
    if (normStr(inputs.hbp) === 'no') goodMed.push('No hypertension');
    else if (inputs.hbp) improveMed.push('Having high blood pressure');

    // atrial fibrillation
    if (normStr(inputs.afib) === 'no') goodMed.push('No atrial fibrillation');
    else if (inputs.afib) improveMed.push('Having atrial fibrillation');

    // prior heart attack
    if (normStr(inputs.heartattack) === 'no') goodMed.push('No history of heart attack');
    else if (inputs.heartattack) improveMed.push('History of heart attack');

    // hearing loss
    if (normStr(inputs.hearing_loss) === 'no') goodMed.push('No hearing loss');
    else if (inputs.hearing_loss) improveMed.push('Having hearing loss');

    // body-mass category
    const bmiCat = normStr(inputs.bmi);
    if (['normal', 'underweight'].includes(bmiCat)) {
      goodMed.push(`BMI in ${inputs.bmi} range`);
    } else if (bmiCat === 'overweight') {
      improveMed.push('Weight in the overweight range');
    } else if (bmiCat === 'obese') {
      improveMed.push('Weight in the obese range');
    } else if (inputs.bmi) {
      improveMed.push(`Your weight is in the ${inputs.bmi} range`);
    }

    // ---- 3) Lifestyle habits, sleep, mood, cognitive & social, and diet
    const goodLife = [];
    const improveLife = [];

    // alcohol (accept number or "low/moderate/high")
    const alc = inputs.alcohol;
    if (typeof alc === 'number') {
      if (alc <= 1) goodLife.push('You drink low to moderate levels of alcohol');
      else improveLife.push('High levels of alcohol consumption');
    } else if (typeof alc === 'string') {
      const a = normStr(alc);
      if (a === 'low' || a === 'moderate') goodLife.push('You drink low to moderate levels of alcohol');
      else if (a) improveLife.push('High levels of alcohol consumption');
    }

    // smoking: never / former / current
    const smoke = normStr(inputs.smoking);
    if (smoke === 'never') {
      goodLife.push('You do not smoke');
    } else if (smoke === 'former') {
      improveLife.push('Former smoker (benefits accrue with time since quitting)');
    } else if (smoke === 'current') {
      improveLife.push('Smoking is strongly discouraged');
    }

    // physical activity: sum minutes
    const phys = num(inputs.vigorous) + num(inputs.moderate) + num(inputs.walk);
    if (phys >= 150) {
      goodLife.push('You meet recommended physical activity');
    } else {
      improveLife.push('Low levels of physical activity');
    }

    // sleep (insomnia items – lightweight composite)
    const sleepScore =
      num(inputs.falling_asleep) +
      num(inputs.staying_asleep) +
      num(inputs.waking_early) +
      num(inputs.dissatisfaction);
    
    if (sleepScore <= 2) goodLife.push('Sleep concerns appear minimal');
    else improveLife.push('Sleep difficulties reported');

    // mood / affect composite (higher = worse; subtract positive “happy”)
    const moodKeys = [
      'noticeable', 'worried', 'interfere', 'bothered', 'mind', 'depressed',
      'effort', 'future', 'fearful', 'sleep', 'lonely', 'going'
    ];
    const moodScore = moodKeys.reduce((s, k) => s + num(inputs[k]), 0) - num(inputs.happy);
    if (moodScore <= 6) goodLife.push('No significant mood concerns indicated');
    else improveLife.push('Mood or wellbeing concerns indicated');

    // cognitive engagement (broader set)
    const cogCore = num(inputs.brain_training) + num(inputs.books) + num(inputs.games) + num(inputs.museum);
    const cogExtra =
      num(inputs.newspaper) + num(inputs.magazines) + num(inputs.emails) +
      num(inputs.social_media) + num(inputs.stimulating) + num(inputs.other_freq) +
      num(inputs.concert) + num(inputs.library);
    const totalCog = cogCore + cogExtra;
    if (totalCog >= 15) {
      goodLife.push('Strong overall cognitive enrichment');
    } else if (totalCog >= 8) {
      goodLife.push('Moderate cognitive enrichment');
    } else {
      improveLife.push('Low cognitive enrichment');
    }

    // social engagement: quantity + feelings
    if (num(inputs.companion) >= 3) {
      goodLife.push('You have regular social engagement');
    } else {
      improveLife.push('Low levels of social engagement');
    }
    const socialFeel = num(inputs.left_out) + num(inputs.isolated);
    if (socialFeel >= 3) improveLife.push('Feelings of social isolation reported');
    else goodLife.push('Low risk of social isolation.')

    // diet
    if (num(inputs.fruitveg) >= 1) goodLife.push('Regular fruit/vegetable intake');
    else improveLife.push('Low fruit/vegetable intake');

    if (num(inputs.fish_intake) >= 1) goodLife.push('Some fish intake reported');
    else improveLife.push('Low fish intake');

    // ---- 4) Environmental exposure
    const goodEnv = [];
    const improveEnv = [];

    if (normStr(inputs.pesticides) === 'yes') {
      improveEnv.push('Exposure to pesticides');
    } else {
      goodEnv.push('No pesticide exposure');
    }

    //–– helper to write lists into cells
    function fillList(idGood, idImprove, goodArr, impArr) {
      const g = document.getElementById(idGood);
      const i = document.getElementById(idImprove);
      if (g) g.innerHTML = goodArr.map(t => CHK + t).join('<br>');
      if (i) i.innerHTML = impArr.map(t => TOOL + t).join('<br>');
    }

    //–– populate the four rows
    fillList('demographic-factors-list-good', 'demographic-factors-list-improve', goodDemo, improveDemo);
    fillList('medical-risk-factors-list-good', 'medical-risk-factors-list-improve', goodMed, improveMed);
    fillList('lifestyle-habits-and-diet-list-good', 'lifestyle-habits-and-diet-list-improve', goodLife, improveLife);
    fillList('environmental-exposure-list-good', 'environmental-exposure-list-improve', goodEnv, improveEnv);

  }, data.inputs);

}