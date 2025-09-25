export async function evaluateRecommendationTable(page, data) {
  page.evaluate((inputs) => {
    // Parse age category ("18-39", "40-64", "65+")
    function parseAge(cat) {
      if (cat.includes('-')) return parseInt(cat.split('-')[0], 10);
      if (cat.includes('+')) return parseInt(cat, 10);
      return Number(cat);
    }
    const age = parseAge(inputs.age_cat);

    // Reference HTML for reuse
    const smokingRefs = `
    <ul>
      <li>1. Anstey, K. J. et al. (2007)…<br>
         <em>Am J Epidemiol</em>, 166(4), 367–378. https://doi.org/10.1093/aje/kwm116</li>
      <li>2. Zhong, G. et al. (2015)…<br>
         <em>PloS One</em>, 10(3), e0118333. https://doi.org/10.1371/journal.pone.0118333</li>
      <li><a href="https://www.health.gov.au/topics/smoking-vaping-and-tobacco/how-to-quit">
         Australia Dept. of Health – Quit Smoking</a></li>
      <li><a href="https://www.who.int/tobacco/publications/building_capacity/training_package/treatingtobaccodependence/en/">
         WHO – Quit Smoking fact sheet</a></li>
    </ul>`;

    const diabetesRefs = `
    <ul>
      <li>1. Chatterjee et al. (2016)…<br>
         <em>Diabetes Care</em>, 39(2), 300–307. https://doi.org/10.2337/dc15-1588</li>
      <li><a href="https://www.diabetesaustralia.com.au">Diabetes Australia</a></li>
      <li><a href="https://www.who.int/news-room/fact-sheets/detail/diabetes">WHO Diabetes Fact Sheet</a></li>
    </ul>`;

    const weightRefs = `
    <ul>
      <li><a href="https://www.eatforhealth.gov.au">Australian Dietary Guidelines</a></li>
      <li><a href="https://www.health.gov.au/health-topics/healthy-weight">Dept. of Health – Healthy Weight Guide</a></li>
    </ul>`;

    const educationRefs = `
    <ul>
      <li><a href="https://www.tafensw.edu.au/digital">TAFE Digital</a></li>
      <li><a href="https://www.opencolleges.edu.au">Open Colleges</a></li>
      <li><a href="https://www.coursera.org">Coursera</a></li>
      <li><a href="https://www.futurelearn.com">FutureLearn</a></li>
    </ul>`;

    const cholesterolRefs = `
    <ul>
      <li>Anstey K. J., Ashby-Mitchell K., & Peters R. (2017)…<br>
         <em>J Alzheimers Dis</em>, 56(1), 215–228. https://doi.org/10.3233/JAD-160826</li>
      <li><a href="https://www.heartfoundation.org.au/your-heart/know-your-risks/blood-cholesterol">
         Heart Foundation – Cholesterol</a></li>
    </ul>`;

    const tbiRefs = `
    <ul>
      <li>Burke J. F. et al. (2013)…<br>
         <em>Neurology</em>, 81(1), 33–39. https://doi.org/10.1212/WNL.0b013e318297eecf</li>
      <li><a href="https://www.cdc.gov/traumatic-brain-injury/prevention/index.html">
         CDC – Preventing TBI</a></li>
    </ul>`;

    const afibRefs = `
    <ul>
      <li>Kalantarian S. et al. (2013)…<br>
         <em>Ann Intern Med</em>, 158(5 Pt 1), 338–346. https://doi.org/10.7326/0003-4819-158-5-201303050-00007</li>
      <li><a href="https://www.heartfoundation.org.au/your-heart/heart-conditions/atrial-fibrillation">
         Heart Foundation – AFib</a></li>
    </ul>`;

    const strokeRefs = `
    <ul>
      <li><a href="https://www.heartandstroke.ca/stroke/what-is-stroke/stroke-and-dementia">
         Heart & Stroke Canada – Stroke & Dementia</a></li>
      <li><a href="https://www.heart.org/en/news/2020/01/09/after-stroke-an-astounding-risk-of-heart-problems#">
         American Heart Association</a></li>
    </ul>`;

    const socialRefs = `
    <ul>
      <li>Kuiper J. S. et al. (2015)…<br>
         <em>Ageing Res Rev</em>, 22, 39–57. https://doi.org/10.1016/j.arr.2015.04.006</li>
      <li>Contact your local council for community events and meetups.</li>
    </ul>`;

    const physicalRefs = `
    <ul>
      <li>Blondell S. J. et al. (2014)…<br>
         <em>BMC Public Health</em>, 14, 510. https://doi.org/10.1186/1471-2458-14-510</li>
      <li>Paffenbarger R. S. Jr et al. (1978)…<br>
         <em>Am J Epidemiol</em>, 108(3), 161–175. https://doi.org/10.1093/oxfordjournals.aje.a112608</li>
      <li><a href="https://www.who.int/publications/i/item/9789240015128">WHO PA Guidelines</a></li>
    </ul>`;

    const cognitiveRefs = `
    <ul>
      <li>Latest evidence is still emerging; engage in new learning, complex tasks, regularly.</li>
      <li>Examples: reading, learning languages, board games, crosswords, musical instruments.</li>
    </ul>`;

    const hypertensionRefs = `
    <ul>
      <li><a href="https://www.heartfoundation.org.au">Heart Foundation</a></li>
      <li><a href="https://www.aihw.gov.au">AIHW</a></li>
      <li><a href="https://www.who.int/health-topics/hypertension">WHO Hypertension</a></li>
    </ul>`;

    const insomniaRefs = `
    <ul>
      <li>de Almondes K. M. et al. (2016)…<br>
         <em>J Psychiatr Res</em>, 77, 109–115. https://doi.org/10.1016/j.jpsychires.2016.02.021</li>
      <li><a href="https://www.sleephealthfoundation.org.au">Sleep Health Foundation</a></li>
    </ul>`;

    const alcoholRefs = `
    <ul>
      <li>NHMRC Australia Alcohol Guidelines – no more than 10 drinks/week, 4/day.</li>
      <li>Tips: <a href="https://drinkwise.org.au">DrinkWise</a></li>
    </ul>`;

    const depressionRefs = `
    <ul>
      <li>Beyond Blue – <a href="https://www.beyondblue.org.au">beyondblue.org.au</a></li>
      <li>Black Dog Institute – <a href="https://www.blackdoginstitute.org.au">blackdoginstitute.org.au</a></li>
      <li>Signs in older adults: <a href="https://www.nia.nih.gov/health/mental-and-emotional-health/depression-and-older-adults">NIA</a></li>
    </ul>`;

    const fishRefs = `
    <ul>
      <li>Zhang Y. et al. (2016)…<br>
         <em>Am J Clin Nutr</em>, 103(2), 330–340. https://doi.org/10.3945/ajcn.115.124081</li>
      <li>MIND diet info: <a href="https://www.healthline.com/nutrition/mind-diet">healthline.com</a></li>
    </ul>`;

    const fruitVegRefs = `
    <ul>
      <li>Wu Y. et al. (2015)…<br>
         <em>Nutrition Metab Cardiovasc Dis</em>, 25(2), 140–147. https://doi.org/10.1016/j.numecd.2014.10.004</li>
      <li>MIND diet info: <a href="https://www.healthline.com/nutrition/mind-diet">healthline.com</a></li>
    </ul>`;

    const heartAttackRefs = `
    <ul>
      <li>Deckers K. et al. (2017)…<br>
         <em>PloS One</em>, 12(9), e0184244. https://doi.org/10.1371/journal.pone.0184244</li>
      <li>Witt B. J. et al. (2006)…<br>
         <em>Am J Med</em>, 119(4), 354.e1–354.e9. https://doi.org/10.1016/j.amjmed.2005.10.058</li>
      <li><a href="https://www.heartfoundation.org.au/your-heart/heart-attack">HF – Heart Attack</a></li>
    </ul>`;

    const hearingRefs = `
    <ul>
      <li>Loughrey D. G. et al. (2018)…<br>
         <em>JAMA Otolaryngol Head Neck Surg</em>, 144(2), 115–126. https://doi.org/10.1001/jamaoto.2017.2513</li>
      <li>Horikawa C. et al. (2013)…<br>
         <em>JCEM</em>, 98(1), 51–58. https://doi.org/10.1210/jc.2012-2119</li>
      <li><a href="https://www.deafnessforum.org.au">Deafness Forum</a></li>
      <li><a href="https://www.healthdirect.gov.au/hearing-loss">Healthdirect</a></li>
    </ul>`;

    // Define all factors
    const config = [
      {
        label: 'Smoking',
        applies: inp => inp.smoking === 'current',
        recs: [
          {
            when: a => a <= 39,
            text: `Smoking is likely to increase your risk of developing chronic conditions like dementia later in life. Quitting smoking is strongly recommended for health reasons.`,
            refs: smokingRefs
          },
          {
            when: a => a >= 40,
            text: `Smoking is likely to increase your risk of developing dementia, heart attack, and diabetes. Quitting smoking is strongly recommended to improve heart and metabolic health. Support is available through healthcare providers, quitlines, and cessation programs to help you stop smoking successfully.`,
            refs: smokingRefs
          }
        ]
      },
      {
        label: 'Diabetes',
        applies: inp => inp.diabetes === 'yes',
        recs: [{
          when: _ => true,
          text: `A diagnosis of diabetes is linked to an increased risk of dementia, stroke, and heart attacks. It is recommended to follow a healthy lifestyle and take treatment as prescribed by your doctor to minimise your risk. Regular check ups and effective diabetes management play a key role in protecting your long‑term health.`,
          refs: diabetesRefs
        }]
      },
      {
        label: 'Underweight',
        applies: inp => inp.bmi === 'underweight',
        recs: [{
          when: _ => true,
          text: `Being underweight is linked to an increased risk of developing dementia and heart attack later in life. It is recommended to take steps toward achieving and maintaining a healthy weight through balanced nutrition, regular meals, and medical guidance if needed.`,
          refs: weightRefs
        }]
      },
      {
        label: 'Overweight',
        applies: inp => inp.bmi === 'overweight',
        recs: [{
          when: a => a <= 39,
          text: `Currently the evidence suggests that being overweight during mid life is associated with an increased risk of stroke, heart attack, and diabetes. For your overall health, it is recommended that you seek advice from your GP regarding your weight.`,
          refs: weightRefs
        }, {
          when: a => a >= 40,
          text: `Currently the evidence suggests that being overweight at your age is associated with an increased risk of stroke, heart attack, and diabetes. For your overall health, it is recommended that you seek advice from your GP regarding your weight.`,
          refs: weightRefs
        }]
      },
      {
        label: 'Obesity',
        applies: inp => inp.bmi === 'obese',
        recs: [{
          when: a => a <= 39,
          text: `Being obese in mid life is linked to an increased risk of stroke, heart attack and diabetes. Maintaining a healthy weight is recommended.`,
          refs: `
          <ul>
            <li>Pedditzi E. et al. (2016)…<br>
               <em>Age Ageing</em>, 45(1), 14–21. https://doi.org/10.1093/ageing/afv151</li>
            <li>Australian Dietary Guidelines</li>
            <li>Dept. of Health – Healthy Weight Guide</li>
            <li>WHO Physical Activity Guidelines</li>
          </ul>`
        }, {
          when: a => a >= 40,
          text: `Being obese is linked to an increased risk of stroke, heart attack and diabetes. Therefore, taking steps to maintain a healthy weight is recommended. This can include adopting a balanced diet, increasing physical activity, and seeking guidance from a healthcare professional or dietitian to create a sustainable and personalised plan.`,
          refs: `
          <ul>
            <li>Pedditzi E. et al. (2016)…<br>
               <em>Age Ageing</em>, 45(1), 14–21. https://doi.org/10.1093/ageing/afv151</li>
            <li>Australian Dietary Guidelines</li>
            <li>Dept. of Health – Healthy Weight Guide</li>
            <li>WHO Physical Activity Guidelines</li>
          </ul>`
        }]
      },
      {
        label: 'Education',
        applies: _ => true,
        recs: [
          {
            when: a => a <= 39,
            text: `Engaging in further education and mentally stimulating activities can help build your cognitive reserve, which may reduce the risk of developing health conditions such as dementia, stroke, heart attack, and diabetes.`,
            refs: educationRefs
          },
          {
            when: a => a >= 40,
            text: `A lower level of educational attainment is associated with an increased risk of dementia, stroke, heart attack, and diabetes. Engaging in further education and mentally stimulating activities may help reduce your risk of developing these conditions.`,
            refs: educationRefs
          }
        ]
      },
      {
        label: 'Cholesterol',
        applies: inp => inp.cholesterol !== 'normal',
        recs: [
          {
            when: a => a <= 39,
            text: `Having high cholesterol in midlife is linked to an increased risk of developing dementia, stroke, heart attack, and diabetes in later life. Maintaining a healthy diet and taking medication if prescribed by your doctor is recommended to maintain healthy cholesterol levels.`,
            refs: cholesterolRefs
          },
          {
            when: a => a >= 40,
            text: `Maintaining a healthy diet and taking medication if prescribed by your doctor is recommended to maintain healthy cholesterol levels.`,
            refs: cholesterolRefs
          }
        ]
      },
      {
        label: 'Traumatic Brain Injury',
        applies: inp => inp.tbi === 'yes',
        recs: [{
          when: _ => true,
          text: `Having a brain injury is linked to an increased risk of developing diabetes, stroke, and heart attack later in life. Consider taking steps to reduce the risk of sustaining another brain injury such as preventing falls, and managing any underlying health conditions that may contribute to injury risk.`,
          refs: tbiRefs
        }]
      },
      {
        label: 'Atrial Fibrillation',
        applies: inp => inp.afib === 'yes',
        recs: [{
          when: _ => true,
          text: `Having atrial fibrillation is linked to an increased risk of dementia, stroke, and heart attack later in life. Take medication as recommended by your doctor to help manage the condition and reduce these risks.`,
          refs: afibRefs
        }]
      },
      {
        label: 'Stroke',
        applies: inp => inp.stroke === 'yes',
        recs: [{
          when: _ => true,
          text: `Having a stroke is linked to an increased risk of dementia and heart attacks. Maintaining a healthy lifestyle and taking any medication prescribed by your doctor is recommended to reduce your risk of having further strokes.`,
          refs: strokeRefs
        }]
      },
      {
        label: 'Social engagement',
        applies: inp => inputs.companion < 3,
        recs: [{
          when: _ => true,
          text: `Maintaining strong social connections may help lower your risk of developing dementia, stroke, heart attack, and diabetes later in life. Consider staying socially active through community events or regular catch‑ups with loved ones.`,
          refs: socialRefs
        }]
      },
      {
        label: 'Physical activity',
        applies: _ => (inputs.vigorous + inputs.moderate + inputs.walk) < 150,
        recs: [{
          when: _ => true,
          text: `Low levels of physical activity are associated with the development of dementia and heart attack. To support brain and heart health, it is recommended to follow the national physical activity guidelines which generally suggest at least 150 minutes of moderate intensity exercise per week.`,
          refs: physicalRefs
        }]
      },
      {
        label: 'Cognitive engagement',
        applies: _ => (inputs.brain_training + inputs.books + inputs.games + inputs.museum) < 10,
        recs: [{
          when: _ => true,
          text: `Staying cognitively active throughout life may help to reduce your risk of dementia. Some evidence suggests that cognitive training might reduce the risk of cognitive decline and/or dementia. More research is needed to establish the benefits of computerised brain training activities.`,
          refs: cognitiveRefs
        }]
      },
      {
        label: 'Hypertension',
        applies: inp => inp.hbp === 'yes',
        recs: [{
          when: _ => true,
          text: `Having hypertension is linked to an increased risk of developing stroke, heart attack, and diabetes later in life. Maintaining a healthy lifestyle and taking any medications prescribed by your doctor is recommended.`,
          refs: hypertensionRefs
        }]
      },
      {
        label: 'Insomnia',
        applies: _ => (inputs.falling_asleep + inputs.staying_asleep + inputs.waking_early) > 0,
        recs: [{
          when: a => a < 65,
          text: `Healthy sleep habits may reduce your risk of developing dementia, stroke, heart attack, and diabetes in late‑life. If you have sleep problems it is recommended that you discuss your sleep patterns with your GP. Most adults need about 7–8 hours of sleep per night, but some individuals are healthy with less or more.`,
          refs: insomniaRefs
        }, {
          when: a => a >= 65,
          text: `Healthy sleep habits may reduce your risk of developing dementia, stroke, heart attack, and diabetes. It is recommended that you discuss your sleep patterns with your GP. Most adults need about 7–8 hours of sleep per night, but some individuals are healthy with less or more.`,
          refs: insomniaRefs
        }]
      },
      {
        label: 'Alcohol',
        applies: _ => inputs.alcohol > 1,
        recs: [{
          when: a => a < 40,
          text: `Excessive consumption of alcohol is associated with an increased risk of a stroke and heart attack later in life. Drink within the recommended limits for health.`,
          refs: alcoholRefs
        }, {
          when: a => a >= 40,
          text: `Excessive consumption of alcohol is associated with an increased risk of a stroke and heart attack. To support heart health and overall wellbeing, it is recommended to drink within recommended guidelines – no more than 10 standard drinks per week and no more than 4 on any single day.`,
          refs: alcoholRefs
        }]
      },
      {
        label: 'Depression',
        applies: _ => inputs.depressed > 0,
        recs: [{
          when: _ => true,
          text: `Experiencing depression is associated with an increased risk of developing dementia, stroke, heart attack, and diabetes later in life. Seeking appropriate support and treatment—such as speaking with a healthcare professional, accessing therapy, or considering medication—can help manage symptoms and improve overall wellbeing. Addressing depression early may also contribute to better long‑term heart and brain health.`,
          refs: depressionRefs
        }]
      },
      {
        label: 'Fish intake',
        applies: _ => inputs.fish_intake < 2,
        recs: [{
          when: a => a < 40,
          text: `Eating fish may help protect brain health and might reduce the risk of developing dementia and diabetes later in life. Maintaining a healthy and nutritious diet is recommended at all ages.`,
          refs: fishRefs
        }, {
          when: a => a >= 40,
          text: `Eating fish may help to lower risk of developing dementia and diabetes. Including fish as part of a balanced, nutritious diet may help support metabolic health as you age. Maintaining a healthy diet is recommended at all ages.`,
          refs: fishRefs
        }]
      },
      {
        label: 'Fruit & veg intake',
        applies: _ => inputs.fruitveg < 5,
        recs: [{
          when: _ => true,
          text: `A diet rich in fruits and vegetables has been linked to a lower risk of developing diabetes and heart attack later in life. It is recommended to follow a healthy, balanced diet that includes a variety of fruits and vegetables each day as part of an overall approach to maintaining good health and preventing chronic disease.`,
          refs: fruitVegRefs
        }]
      },
      {
        label: 'Heart attack',
        applies: inp => inp.heartattack === 'yes',
        recs: [{
          when: _ => true,
          text: `Having a history of heart attack is associated with an increased risk of developing dementia and stroke later in life. To reduce this risk, it is recommended to follow your doctor's advice, take prescribed medication as directed, and adopt healthy lifestyle habits such as eating a balanced diet and exercising regularly.`,
          refs: heartAttackRefs
        }]
      },
      {
        label: 'Hearing loss',
        applies: inp => inp.hearing_loss === 'yes',
        recs: [{
          when: _ => true,
          text: `Hearing loss is associated with an increased risk of developing dementia, stroke, heart attack, and diabetes later in life. It is recommended to have your hearing checked regularly, use hearing aids when needed and stay socially engaged to reduce the impact of hearing loss.`,
          refs: hearingRefs
        }]
      }
    ];

    // Build table rows
    const tbody = document.querySelector('.report-table tbody');
    const html = config
      .filter(f => f.applies(inputs))
      .map(f => {
        const branch = f.recs.find(r => r.when(parseAge(inputs.age_cat)));
        if (!branch) return "";
        const fullText = branch.text || '';
        // split before the "It is recommended" clause
        let desc = fullText, rec = '';
        let idx = fullText.indexOf('. ');
        if (idx !== -1) {
          idx += 2
          desc = fullText.slice(0, idx).trim();
          rec = fullText.slice(idx).trim();
        }

        return `
          <tr>
            <td>
              <strong>${f.label}:</strong><br>
              ${desc}
            </td>
            <td>
              ${rec}
            </td>
          </tr>
          <tr>
            <td class="full-span" colspan="2">
              ${branch.refs || ''}
            </td>
          </tr>
        `;
      })
      .join('');
    tbody.innerHTML = html;
  }, data.inputs);
}