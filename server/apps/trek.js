// stardate is the game's clock
const Stardate = function() {
  const basis = new Date();
  const startTimeDebug = basis.toISOString();
  const startSeconds = Math.floor(basis.getTime() / 1000);
  const tickListeners = [];
  var elapsedSeconds = 0;

  function addTickListener(period, handler) {
    var nextElapsed = period;

    function onTick(elapsed) {
      const ready = nextElapsed < elapsed;
      if (ready) {
        while (nextElapsed < elapsed) {
          nextElapsed += period;
        }
        handler();
      }
    }

    tickListeners.push(onTick);
  }

  function tick() {
    elapsedSeconds += 1;
    for (const listener of tickListeners) {
        listener(elapsedSeconds);
    }
  }

  function formattedElapsedSeconds() {
    function pad2(i) {return String(i).padStart(2, '0')}
    const hr = Math.floor(elapsedSeconds / 3600);
    const min = Math.floor((elapsedSeconds - hr * 3600) / 60);
    const sec = elapsedSeconds - (hr * 3600) - (min * 60);
    return `${pad2(hr)}:${pad2(min)}:${pad2(sec)}`;
  }

  return {
    basis: basis,
    startTimeDebug: startTimeDebug,
    startSeconds: startSeconds,
    formattedElapsedSeconds: formattedElapsedSeconds,
    tick: tick,
    addTickListener: addTickListener
  }
};

// coord is for both quadrants and sectors
const Coord = function(lat, lon) {
  // min,max for all coords, both quadrants and sectors
  const MIN_LAT = 1;
  const MIN_LON = 1;
  const MAX_LAT = 8;
  const MAX_LON = 8;

  if (lat < MIN_LAT || lat > MAX_LAT) { throw `lat ${lat} is out of range.`; }
  if (lon < MIN_LON || lon > MAX_LON) { throw `lat ${lon} is out of range.`; }

  const name = `[${lat},${lon}]`;
  const key = (lat-1) * 8 + (lon-1);

  return {
    lat: lat,
    lon: lon,
    name: name,
    key: key
  }
}

const Galaxy = function() {
  // The Galaxy is divided into 64 quadrants aranged in 8 rows of 8 columns.
  // Each quadrant is likewise divided into 64 sectors.
  
  function Sector(lat, lon, quadrant) {
    const coord = Coord(lat,lon);
    return {
      coord: coord,
      quadrant: quadrant
    }
  }

  function Quadrant(lat, lon) {
    const coord = Coord(lat,lon);
    const sectorMap = {};
   
    return {
      coord: coord,
      sectorMap: sectorMap
    }
  }

  function initSectorMap(quadrant) {
    for (var xlat = 1; xlat <= 8; xlat++) {
      for (var xlon = 1; xlon <= 8; xlon++) {
        const sector = Sector(xlat,xlon, );
        quadrant.sectorMap[sector.coord.key] = sector;
      }
    }
  }

  const quadrantMap = {};

  for (var xlat = 1; xlat <= 8; xlat++) {
    for (var xlon = 1; xlon <= 8; xlon++) {
      const quadrant = Quadrant(xlat,xlon);
      initSectorMap(quadrant);
      quadrantMap[quadrant.coord.key] = quadrant;
    }
  }

  return {
    quadrantMap: quadrantMap
  }
}

const Ship = function(galaxy) {
  var quadrant = galaxy.quadrantMap[Coord(4,5).key];
  var sector = quadrant.sectorMap[Coord(5,2).key];

  function status() {
    return `Quadrant: ${quadrant.coord.name}; Sector: ${sector.coord.name}`;
  }

  function onTick() {
    console.log(">>> t i c k <<<");
  }

  return {
    status: status,
    onTick: onTick
  }
}

const Game = function() {

}

function initGame(req, state) {
  state.isActive = true;
  const stardate = Stardate();
  const galaxy = Galaxy();
  const ship = Ship(galaxy);

  state.stardate = stardate;
  state.galaxy = galaxy;
  state.ship = ship;
  state.currentLocation = ship.status();

  stardate.addTickListener(1, ship.onTick);

  const intervalId = setInterval(stardate.tick, 1000);
  state.onShutdown = function () {
    clearInterval(intervalId);
  }
}

// Trek-specific action handlers
const handlers = {
  "trek-start": onTrekStart,
  "trek-status": onTrekStatus,
  "show-app": onShowTrekApp  // Override default show-app for trek
};

function onTrekStart(req) {
  const commands = [];
  const state = req.appState.state;

  initGame(req, state);
  
  // Initialize trek state
  
  commands.push(logTrekAction("trek-start", req.data));
  
  return commands;
}

function onTrekStatus(req) {
  const commands = [];
  const state = req.appState.state;
  
  commands.push({
    command: "show-trek-info",
    isActive: state.isActive || false,
    stardate: state.stardate || null,
    currentLocation: state.currentLocation || null,
    stardate: state.stardate.formattedElapsedSeconds()
  });
  
  return commands;
}

function onShowTrekApp(req) {
  if (req.appState.state.onShutdown) {
    req.appState.state.onShutdown();
  }
  const commands = [];
  commands.push({
    command: "show-trek-welcome",
    message: "Welcome to Trek! Use trek-start to begin your journey."
  });
  return commands;
}

// Trek-specific command factories

function logTrekAction(action, data) {
  return {
    command: "log",
    message: `Trek app: ${action} with data: ${JSON.stringify(data)}`
  };
}

module.exports = {
  handlers: handlers
};