resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'

ui_page 'html/ui.html'

client_scripts {
	'config.lua',
	'client.lua'
}

server_scripts {
	'server.lua'
}

files {
  'html/ui.html',
  'html/script.js',
  'html/js/ArrayUtils.js',
  'html/js/AudioFile.js',
  'html/js/DoubleOrNothing.js',
  'html/js/SlotMachine.js',
  'html/design.css',
  -- Images
  'html/img/black.png',
  'html/img/item1.png',
  'html/img/item2.png',
  'html/img/item3.png',
  'html/img/item4.png',
  'html/img/item5.png',
  'html/img/item6.png',
  'html/img/item7.png',
  'html/img/red.png',
  -- Audio
  'html/audio/alarm.ogg',
  'html/audio/buttonNoise.ogg',
  'html/audio/changeBet.ogg',
  'html/audio/collect.ogg',
  'html/audio/spinNoise.ogg',
  'html/audio/startSlotMachine.ogg',
  'html/audio/winDouble.ogg',
  'html/audio/winLine.ogg'
}
