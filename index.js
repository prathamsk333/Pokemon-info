const express = require('express');
const fs = require('fs');
const superagent = require('superagent');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const html = fs.readFileSync('./index.html', 'utf-8');
const pokedata = fs.readFileSync('./pokedetails.html', 'utf-8');

const replacedata = (temp, data) => {
  let output = temp.replace(
    /<%pokepic%>/g,
    data.sprites.other.home.front_default
  );
  output = output.replace(/<%pokemon%>/g, data.name);
  const poketypes = data.types.map((ele) => ele.type.name);
  output = output.replace(/<%poketype%>/g, poketypes);
  output = output.replace(/<%pokeweight%>/g, data.weight);
  output = output.replace(/<%height%>/g, data.height);
  return output;
};

app.use(express.static('/'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  const outlet = html.replace(/{%error%}/g, '');
  res.end(outlet);
});

app.post('/submit', (req, res) => {
  const pokename = req.body.pokemonName;
  if (!pokename) {
    const errdisplay = html.replace(
      /{%error%}/g,
      'please enter a pokemom name...'
    );
    return res.send(errdisplay);
  }
  console.log(pokename);
  const data = superagent
    .get(`https://pokeapi.co/api/v2/pokemon/${pokename}`)
    .end((err, pokeres) => {
      if (err) {
        const display = html.replace(
          /{%error%}/g,
          'Please enter a valid pokemon ...!'
        );
        return res.send(display);
      }
      final = replacedata(pokedata, pokeres.body);
      res.send(final);
    });
});

app.listen(port, () => {
  console.log('server is running on port 3000');
});
