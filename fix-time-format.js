const fs = require('fs');
const path = require('path');

function walk(dir, done) {
    let results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        let pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
}

walk(path.join(__dirname, 'src'), function (err, results) {
    if (err) throw err;
    let count = 0;
    results.filter(f => f.endsWith('.tsx')).forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        // Regex to match `hour: '2-digit', minute: '2-digit'` and append `hour12: false`
        const regex = /(hour:\s*['"]2-digit['"]\s*,\s*minute:\s*['"]2-digit['"])/g;
        let newContent = content.replace(regex, (match) => {
            // Avoid duplicating hour12 if it's already there
            return `${match},\n                                      hour12: false`;
        });
        if (newContent !== content) {
            fs.writeFileSync(file, newContent);
            console.log('Updated', file);
            count++;
        }
    });
    console.log('Total files updated:', count);
});
