/**
 * Patches metro/package.json to add missing exports required by Node.js 22+.
 * Expo SDK 54 + Metro 0.83 + Node.js 22 = ERR_PACKAGE_PATH_NOT_EXPORTED
 * because @expo/cli uses require('metro/src/lib/TerminalReporter') which
 * is not in metro's exports field.
 *
 * Run automatically via postinstall.
 */
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '../node_modules/metro/package.json');

if (!fs.existsSync(pkgPath)) {
  console.log('patch-metro: metro not found, skipping.');
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const missing = {
  './src/lib/TerminalReporter': './src/lib/TerminalReporter.js',
  './src/lib/*': './src/lib/*.js',
  './src/Server': './src/Server.js',
};

let patched = false;
for (const [key, val] of Object.entries(missing)) {
  if (!pkg.exports[key]) {
    pkg.exports[key] = val;
    patched = true;
  }
}

if (patched) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('patch-metro: metro/package.json patched for Node.js 22 compatibility.');
} else {
  console.log('patch-metro: package.json already patched.');
}

// Patch metro/src/Server.js: suppress ENOENT spam from <anonymous> symbolication
const serverPath = path.join(__dirname, '../node_modules/metro/src/Server.js');
if (fs.existsSync(serverPath)) {
  let src = fs.readFileSync(serverPath, 'utf8');
  const original = '} catch (error) {\n          console.error(error);\n        }';
  const patched2 = "} catch (error) {\n          if (error.code !== 'ENOENT') console.error(error);\n        }";
  if (src.includes(original)) {
    fs.writeFileSync(serverPath, src.replace(original, patched2));
    console.log('patch-metro: metro/src/Server.js ENOENT symbolication patch applied.');
  } else {
    console.log('patch-metro: Server.js already patched or structure changed.');
  }
}
