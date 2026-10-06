const fs = require('node:fs');

try {
  const data = fs.readFileSync('./task.json', 'utf8');
  console.log(data);
} catch (err) {
  console.error(err);
}

// const content = 'Some content!';
// fs.writeFile('./task.json', content, err => {
//   if (err) {
//     console.error(err);
//   } else {
//     // file written successfully
//   }
// });

console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
