const fs = require('fs');
const all = require('./lcus_all_questions.json');

const map = {};

all.data.allQuestionsRaw.forEach((el) => {
  map[el.titleSlug] = el;
});

fs.writeFileSync('./lcus_all_questions_map.json', JSON.stringify(map), {
  encoding: 'utf8',
});
