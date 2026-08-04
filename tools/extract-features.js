// Run this with: node tools/extract-features.js
// It reads script.lua and generates the features data for the website
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'script.lua');
const outputPath = path.join(__dirname, '..', 'js', 'features-data.js');

const lua = fs.readFileSync(scriptPath, 'utf8');
const lines = lua.split('\n');

// Parse all controls
const sections = {};
let currentTab = null;

// Map section variable names to display info
const tabMap = {
    'AimTab': { tab: 'combat', subtab: 'Aimbot', side: 'left', section: 'Aimbot' },
    'SilentTab': { tab: 'combat', subtab: 'Silent', side: 'left', section: 'Silent Aim' },
    'MainR': { tab: 'combat', subtab: 'Aimbot', side: 'right', section: 'Target / Main' },
    'AimPlusSec': { tab: 'combat', subtab: 'Aimbot+', side: 'left', section: 'Settings' },
    'SettingsSec': { tab: 'combat', subtab: 'Aimbot+', side: 'left', section: 'Aimbot Settings' },
    'EspTab': { tab: 'visuals', subtab: 'ESP/Chams', side: 'left', section: 'ESP' },
    'ChamsTab': { tab: 'visuals', subtab: 'ESP/Chams', side: 'right', section: 'Chams' },
    'LightTab': { tab: 'visuals', subtab: 'World', side: 'left', section: 'Lighting' },
    'WeatherTab': { tab: 'visuals', subtab: 'World', side: 'left', section: 'Weather' },
    'SkyTab': { tab: 'visuals', subtab: 'World', side: 'right', section: 'Skybox' },
    'MatTab': { tab: 'visuals', subtab: 'World', side: 'right', section: 'Materials' },
    'MiscTab': { tab: 'misc', subtab: 'Misc', side: 'left', section: 'Movement' },
    'TrigTab': { tab: 'misc', subtab: 'Misc', side: 'right', section: 'Triggerbot / Skins' },
    'AvatarTab': { tab: 'misc', subtab: 'Misc', side: 'right', section: 'Avatar' },
    'PlTab': { tab: 'misc', subtab: 'Playerlist', side: 'left', section: 'Player List' },
    'ActTab': { tab: 'misc', subtab: 'Playerlist', side: 'right', section: 'Actions' },
    'CfgTab': { tab: 'settings', subtab: 'Main', side: 'left', section: 'Configs' },
    'MenuTab': { tab: 'settings', subtab: 'Main', side: 'right', section: 'Menu' },
    'NotifTab': { tab: 'settings', subtab: 'Main', side: 'right', section: 'Notifications' },
    'ThemeTab': { tab: 'settings', subtab: 'Main', side: 'right', section: 'Themes' },
};

// Regex patterns
const toggleRe = /:Toggle\(\{\s*Name\s*=\s*"([^"]+)".*?(?:Default\s*=\s*(true|false))?/;
const sliderRe = /:Slider\(\{\s*Name\s*=\s*"([^"]+)".*?Min\s*=\s*(-?\d+).*?Max\s*=\s*(\d+).*?Default\s*=\s*(-?\d+)/;
const dropdownRe = /:Dropdown\(\{\s*Name\s*=\s*"([^"]+)".*?Items\s*=\s*\{([^}]+)\}.*?Default\s*=\s*(?:"([^"]+)"|\{([^}]*)\})/;
const keybindRe = /:Keybind\(\{\s*(?:Name\s*=\s*"([^"]+)")?.*?Flag\s*=\s*"([^"]+)"/;

const controls = [];

for (const line of lines) {
    // Try to identify which tab variable is being used
    let tabVar = null;
    for (const key of Object.keys(tabMap)) {
        if (line.includes(key + ':') || line.includes(key + '.')) {
            tabVar = key;
            break;
        }
    }

    // Also check for generic patterns with known prefixes
    const varPrefixes = ['EspTab', 'ChamsTab', 'AimTab', 'SilentTab', 'MainR', 'AimPlusSec', 'SettingsSec'];
    if (!tabVar) {
        for (const p of varPrefixes) {
            if (line.includes(p)) { tabVar = p; break; }
        }
    }

    if (!tabVar) continue;

    const mapping = tabMap[tabVar];
    if (!mapping) continue;

    let match;
    if (match = line.match(toggleRe)) {
        controls.push({ ...mapping, type: 'check', name: match[1], on: match[2] === 'true' });
    } else if (match = line.match(sliderRe)) {
        controls.push({ ...mapping, type: 'slider', name: match[1], min: parseInt(match[2]), max: parseInt(match[3]), val: parseInt(match[4]) });
    } else if (match = line.match(dropdownRe)) {
        const val = match[3] || (match[4] ? match[4].split(',')[0]?.replace(/"/g,'').trim() : '');
        controls.push({ ...mapping, type: 'drop', name: match[1], val });
    }
}

console.log(`Extracted ${controls.length} controls`);

// Group by tab > subtab > side > section
const grouped = {};
for (const c of controls) {
    if (!grouped[c.tab]) grouped[c.tab] = {};
    if (!grouped[c.tab][c.subtab]) grouped[c.tab][c.subtab] = { left: {}, right: {} };
    const side = grouped[c.tab][c.subtab][c.side];
    if (!side[c.section]) side[c.section] = [];
    const ctrl = { t: c.type, l: c.name };
    if (c.type === 'check') ctrl.on = c.on || false;
    if (c.type === 'slider') { ctrl.v = c.val; ctrl.m = c.max; }
    if (c.type === 'drop') ctrl.v = c.val;
    side[c.section].push(ctrl);
}

// Generate JS output
let output = '// Auto-generated from script.lua - do not edit manually\n';
output += '// Run: node tools/extract-features.js\n';
output += 'const FEATURES_DATA = ' + JSON.stringify(grouped, null, 2) + ';\n';

fs.writeFileSync(outputPath, output);
console.log(`Written to ${outputPath}`);
