// 1:1 features data extracted from script.lua
const FEATURES_DATA = {
combat: {
  subtabs: ['Aimbot','Silent','Aimbot+'],
  content: {
    'Aimbot': {
      left: [{ title:'Aimbot', controls:[
        {t:'check',l:'Enabled',on:false},{t:'drop',l:'Lock Method',v:'Camera'},
        {t:'drop',l:'Target Mode',v:'FOV'},{t:'drop',l:'Ground Part',v:'Head'},
        {t:'check',l:'Advanced Parts'},{t:'drop',l:'Jump Part',v:'HumanoidRootPart'},
        {t:'drop',l:'Fall Part',v:'LowerTorso'},{t:'check',l:'Ignore Fall State'},
        {t:'drop',l:'Checks',v:'Enemy,Wall'},{t:'check',l:'Stay on Deadspot'},
        {t:'slider',l:'Deadspot Time',v:300,m:3000},{t:'check',l:'Sticky Aim'},
        {t:'check',l:'Auto Stop on Death'},{t:'check',l:'Stay on Death Pos'},
        {t:'slider',l:'Death Pos Smooth',v:10,m:100},{t:'check',l:'Lock Target'},
        {t:'check',l:'Spectate Target'},{t:'check',l:'Use FOV'},
        {t:'check',l:'Draw FOV'},{t:'slider',l:'FOV Size',v:60,m:500},
        {t:'check',l:'Macro'}
      ]}],
      right: [{ title:'Target / Main', controls:[
        {t:'check',l:'Target HUD',on:false},{t:'check',l:'Avatar Display',on:true},
        {t:'check',l:'Target Tracer'},{t:'slider',l:'Tracer Fill Alpha',v:100,m:100},
        {t:'slider',l:'Tracer Outline Alpha',v:100,m:100},
        {t:'drop',l:'Tracer Start',v:'Bottom'},{t:'drop',l:'Tracer End',v:'Feet'}
      ]}]
    },
    'Silent': {
      left: [{ title:'Silent Aim', controls:[
        {t:'check',l:'Enabled'},{t:'drop',l:'Hit Part',v:'Head'},
        {t:'drop',l:'Checks',v:'Team,Dead'},{t:'check',l:'Target Lock'},
        {t:'check',l:'Sync with Aimbot'},{t:'drop',l:'Aim Type',v:'Cursor'},
        {t:'check',l:'Hit Chance'},{t:'slider',l:'Hit Chance %',v:100,m:100},
        {t:'check',l:'Use FOV'},{t:'slider',l:'FOV Size',v:100,m:500},
        {t:'check',l:'Draw FOV'}
      ]}],
      right: [{ title:'Settings', controls:[]}]
    },
    'Aimbot+': {
      left: [{ title:'Smoothing', controls:[
        {t:'check',l:'Smoothing'},{t:'slider',l:'X Smoothing',v:2,m:100},
        {t:'slider',l:'Y Smoothing',v:2,m:100},{t:'check',l:'Advanced Smoothing'},
        {t:'slider',l:'Right Smoothing',v:2,m:100},{t:'slider',l:'Left Smoothing',v:2,m:100},
        {t:'slider',l:'Air X Smoothing',v:2,m:100}
      ]},{ title:'Prediction', controls:[
        {t:'check',l:'Prediction'},{t:'drop',l:'Pred Style',v:'Classic'},
        {t:'slider',l:'Ground X/Z Prediction',v:3,m:150},
        {t:'slider',l:'Air X/Z Prediction',v:2,m:150},
        {t:'check',l:'Advanced Prediction'},
        {t:'slider',l:'Ground Pred Right',v:12,m:150},
        {t:'slider',l:'Ground Pred Left',v:12,m:150},
        {t:'check',l:'Deadzone'},{t:'slider',l:'Deadzone Radius',v:80,m:300},
        {t:'check',l:'Auto Offset'},{t:'slider',l:'Ground Offset',v:6,m:30},
        {t:'slider',l:'Air Up Offset',v:18,m:40}
      ]}],
      right: [{ title:'Settings', controls:[
        {t:'check',l:'Use Offsets'},{t:'slider',l:'Offset Up',v:0,m:100},
        {t:'slider',l:'Offset Down',v:0,m:100},{t:'slider',l:'Offset Left',v:0,m:100},
        {t:'slider',l:'Offset Right',v:0,m:100},{t:'check',l:'Air Offset'},
        {t:'slider',l:'Air Offset Value',v:0,m:100},
        {t:'slider',l:'Air Offset Smoothness',v:2,m:100},
        {t:'slider',l:'Lock Time',v:0,m:1000},{t:'check',l:'Delay Jump'},
        {t:'slider',l:'Jump Delay',v:50,m:500},{t:'check',l:'Fall Delay'},
        {t:'slider',l:'Fall Delay (ms)',v:50,m:1000},{t:'check',l:'Unlock Delay'},
        {t:'slider',l:'Unlock Delay (ms)',v:100,m:1000},
        {t:'slider',l:'Miss Chance',v:0,m:100},{t:'check',l:'Use Easing'},
        {t:'drop',l:'Easing Style',v:'Quad'}
      ]}]
    }
  }
},
visuals: {
  subtabs: ['ESP/Chams','World'],
  content: {
    'ESP/Chams': {
      left: [{ title:'ESP', controls:[
        {t:'check',l:'Enable ESP'},{t:'drop',l:'Show On',v:'Enemy,NPC'},
        {t:'slider',l:'Max Distance',v:3000,m:10000},{t:'drop',l:'ESP Font',v:'ProggyClean'},
        {t:'slider',l:'Text Size',v:11,m:20},{t:'check',l:'Text Outline',on:true},
        {t:'check',l:'Box ESP'},{t:'drop',l:'Box Shape',v:'Full'},
        {t:'drop',l:'Text Position',v:'Top'},{t:'check',l:'Box Fill'},
        {t:'slider',l:'Fill Transparency 1',v:100,m:100},
        {t:'slider',l:'Fill Transparency 2',v:65,m:100},
        {t:'check',l:'Box Glow'},{t:'slider',l:'Glow Amount',v:65,m:100},
        {t:'check',l:'Name ESP'},{t:'drop',l:'Name Type',v:'Display Name'},
        {t:'check',l:'Distance ESP'},{t:'drop',l:'Distance Type',v:'Studs'},
        {t:'check',l:'Health Bar'},{t:'check',l:'Health Bar Gradient'},
        {t:'check',l:'Health Text'},{t:'check',l:'Hide Health If Full'},
        {t:'check',l:'Armor Bar'},{t:'check',l:'Tracer ESP'},
        {t:'drop',l:'Tracer Origin',v:'Bottom'},
        {t:'slider',l:'Tracer Neon Amount',v:0,m:100},
        {t:'check',l:'Weapon ESP'},{t:'check',l:'State Flags'},
        {t:'check',l:'Tool Icon'},{t:'slider',l:'Tool Icon Size',v:16,m:64},
        {t:'slider',l:'Tool Icon X Offset',v:0,m:100},
        {t:'slider',l:'Tool Icon Y Offset',v:0,m:100},
        {t:'slider',l:'Tool Icon Transparency',v:0,m:100}
      ]}],
      right: [{ title:'Chams', controls:[
        {t:'check',l:'Player Chams'},{t:'drop',l:'Targets',v:'Player'},
        {t:'slider',l:'Fill Transparency',v:50,m:100},
        {t:'slider',l:'Outline Transparency',v:0,m:100},
        {t:'check',l:'RGB Mode'},{t:'slider',l:'RGB Speed',v:5,m:20},
        {t:'drop',l:'Texture',v:'None'},
        {t:'drop',l:'Checks',v:'Dead,Wall'},
        {t:'check',l:'Tool Chams'},{t:'drop',l:'Tool Targets',v:'Player'},
        {t:'slider',l:'Tool Fill Transparency',v:0,m:100},
        {t:'slider',l:'Tool Outline Transparency',v:0,m:100},
        {t:'check',l:'Tool RGB Mode'},{t:'slider',l:'Tool RGB Speed',v:5,m:20}
      ]}]
    },
    'World': {
      left: [{ title:'Lighting', controls:[
        {t:'check',l:'Custom Lighting'},{t:'slider',l:'Brightness',v:2,m:10},
        {t:'slider',l:'Clock Time',v:14,m:24},{t:'check',l:'Fullbright'},
        {t:'check',l:'No Fog'},{t:'check',l:'No Atmosphere'},
        {t:'slider',l:'Ambient R',v:128,m:255},{t:'slider',l:'Ambient G',v:128,m:255},
        {t:'slider',l:'Ambient B',v:128,m:255}
      ]},{ title:'Weather', controls:[
        {t:'check',l:'Custom Weather'},{t:'drop',l:'Weather Type',v:'None'},
        {t:'check',l:'Remove Game Weather'},{t:'slider',l:'Rain Rate',v:300,m:500},
        {t:'slider',l:'Rain Speed',v:120,m:200},{t:'slider',l:'Snow Rate',v:200,m:400},
        {t:'slider',l:'Snow Speed',v:25,m:100}
      ]}],
      right: [{ title:'Skybox', controls:[
        {t:'check',l:'Custom Skybox'},
        {t:'drop',l:'Skybox',v:'Space'},
        {t:'check',l:'Remove Sun Rays'},{t:'check',l:'Remove Stars'}
      ]},{ title:'Materials', controls:[
        {t:'check',l:'Character Material'},
        {t:'drop',l:'Char Material',v:'ForceField'},
        {t:'check',l:'Tool Material'},
        {t:'drop',l:'Tool Material Type',v:'ForceField'},
        {t:'check',l:'Self Material'},
        {t:'drop',l:'Self Material Type',v:'Neon'}
      ]}]
    }
  }
},
misc: {
  subtabs: ['Misc','Playerlist'],
  content: {
    'Misc': {
      left: [{ title:'Movement', controls:[
        {t:'check',l:'Speed Boost'},{t:'slider',l:'Walk Speed',v:16,m:100},
        {t:'check',l:'Fly'},{t:'slider',l:'Fly Speed',v:50,m:200},
        {t:'check',l:'No Clip'},{t:'check',l:'Infinite Jump'},
        {t:'slider',l:'Jump Power',v:50,m:200},
        {t:'check',l:'Anti Void'},{t:'check',l:'Anti Ragdoll'},
        {t:'check',l:'Auto Stomp'},{t:'check',l:'Anti Slow'},
        {t:'check',l:'CFrame Speed'},{t:'slider',l:'CFrame Value',v:1,m:5}
      ]}],
      right: [{ title:'Triggerbot / Skins', controls:[
        {t:'check',l:'Triggerbot'},{t:'slider',l:'Delay (ms)',v:50,m:500},
        {t:'drop',l:'Trig Mode',v:'Hold'},
        {t:'check',l:'Custom Skins'},
        {t:'drop',l:'Skin',v:'Purple'},
        {t:'check',l:'Skin Particles'},{t:'check',l:'Scroll Texture'},
        {t:'check',l:'Animated Skin'}
      ]},{ title:'Avatar', controls:[
        {t:'check',l:'China Hat'},{t:'slider',l:'Hat Size',v:5,m:10},
        {t:'check',l:'Hat Light'},{t:'check',l:'Spin Hat'},
        {t:'check',l:'Custom Avatar'},{t:'check',l:'Anti Backstab'}
      ]}]
    },
    'Playerlist': {
      left: [{ title:'Player List', controls:[
        {t:'check',l:'Show Player List'},{t:'check',l:'Show Health',on:true},
        {t:'check',l:'Show Distance',on:true},{t:'check',l:'Show Weapon'},
        {t:'check',l:'Show Kill Count'}
      ]}],
      right: [{ title:'Actions', controls:[
        {t:'check',l:'Teleport'},{t:'check',l:'Spectate'},
        {t:'check',l:'Whitelist'},{t:'check',l:'Target'},
        {t:'check',l:'Copy Username'}
      ]}]
    }
  }
},
settings: {
  subtabs: ['Main'],
  content: {
    'Main': {
      left: [{ title:'Configs', controls:[
        {t:'drop',l:'Config',v:'default'},
        {t:'check',l:'Auto-Load'},{t:'check',l:'Auto-Save'}
      ]},{ title:'Menu', controls:[
        {t:'key',l:'Toggle Menu',v:'Insert'},
        {t:'check',l:'Watermark',on:true},{t:'check',l:'Keybind List',on:true},
        {t:'check',l:'Target HUD',on:true},{t:'check',l:'Player List'},
        {t:'check',l:'Loading Screen',on:true},
        {t:'slider',l:'UI Scale',v:100,m:150}
      ]}],
      right: [{ title:'Notifications', controls:[
        {t:'check',l:'Enabled',on:true},{t:'drop',l:'Type',v:'Full'},
        {t:'drop',l:'Animation',v:'Slide'},{t:'drop',l:'Position',v:'Top Right'},
        {t:'slider',l:'Duration',v:3,m:10}
      ]},{ title:'Themes', controls:[
        {t:'drop',l:'Theme Preset',v:'Default'},
        {t:'check',l:'Custom Accent'},{t:'check',l:'Custom Background'},
        {t:'check',l:'Custom Text'},{t:'check',l:'Custom Elements'}
      ]}]
    }
  }
}
};
