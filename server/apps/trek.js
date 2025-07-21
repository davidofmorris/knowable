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
    // lat,lon in [1 .. 8]
    const coord = Coord(lat,lon);
    return {
      coord: coord,
      quadrant: quadrant
    }
  }

  function Quadrant(lat, lon) {
    // lat,lon in [1 .. 8]
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
        const sector = Sector(xlat,xlon, quadrant);
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

  function Location(rlat,rlon) {
    // A location is uniquely defined by its real coordinates (rlat,rlon),
    // where rlat and rlon are floats within [0.0 .. 8*8.0).
    // (0,0) is the (top,left) corner of the map.
    // Locations are broken down into quadrant, sector, and position.
    // # whole location [0 .. 64)
    // wlat = floor(rlat)   wlon = floor(rlon)
    const wlat = Math.min(63, Math.floor(rlat));
    const wlon = Math.min(63, Math.floor(rlon));

    // # position [0 .. 1.0)
    // plat = rlat - wlat   plon = rlon - wlon
    const plat = rlat - wlat;
    const plon = rlon - wlon;

    // # sector
    // slat = 1 + wlat % 8   slon = 1 + wlon % 8
    const slat = 1 + wlat % 8;
    const slon = 1 + wlon % 8;

    // # quadrant
    // qlat = 1 + floor(wlat / 8)    qlon = 1 + floor(wlon / 8)
    const qlat = 1 + Math.floor(wlat / 8);
    const qlon = 1 + Math.floor(wlon / 8);

    const quadrant = quadrantMap[Coord(qlat,qlon).key];
    const sector = quadrant.sectorMap[Coord(slat,slon).key];

    return {
      rlat: rlat, rlon: rlon,
      quadrant: quadrant,
      sector: sector,
      position: {rlat: plat, rlon: plon}
    }
  }

  return {
    quadrantMap: quadrantMap,
    Location: Location
  }
}

const Ship = function(galaxy) {
  const course = {dir:1, warp:0.01};

  const rlat = Math.random() * 64;
  const rlon = Math.random() * 64;

  var location = galaxy.Location(rlat,rlon);

  function setLocation(loc) {
    location = loc;
  }

  function status() {
    const q = location.quadrant;
    const s = location.sector;
    const p = location.position;
    return `Quadrant: ${q.coord.name}; Sector: ${s.coord.name}; Position: [${Math.floor(1000 * p.rlat)},${Math.floor(1000 * p.rlon)}]`;
  }

  function moveShip() {
    // move ship
    if (course.warp > 0) {
      // a = angle in radians
      const a = 2 * Math.PI * (course.dir-1) / 8;
      // at warp=1, ship moves 1 sector in 10 ticks (1sec each)
      const sin_a = Math.sin(a);
      const cos_a = Math.cos(a);
      const ulat = -0.1 * sin_a; 
      const ulon =  0.1 * cos_a;
      var rlat1 = location.rlat + ulat * course.warp;
      var rlon1 = location.rlon + ulon * course.warp;
      if (rlat1 < 0) { rlat1 = 0; }
      else if (rlat1 >= 64) { rlat1 = 63.9999; }
      if (rlon1 < 0) { rlon1 = 0; }
      else if (rlon1 >= 64) { rlon1 = 63.9999; }
      const newLocation = galaxy.Location(rlat1,rlon1);
      setLocation(newLocation);
    }
  }

  function onTick() {
    // console.log(">>> t i c k <<<");
    moveShip();
  }

  return {
    status: status,
    onTick: onTick,
    course: course,
    setCourse: function(c) {Object.assign(course,c);}
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
  "show-app": onShowTrekApp,  // Override default show-app for trek
  "set-course": onSetCourse,  // w=warp [0..8];d=direction [0..9)
};

function onSetCourse(req) {
  const ship = req.appState.state.ship;
  const {dir,warp} = req.data;
  ship.setCourse({dir:dir, warp:warp});
}

// show-app
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

// trek-start
function onTrekStart(req) {
  const commands = [];
  const state = req.appState.state;

  initGame(req, state);
  
  // Initialize trek state
  
  commands.push(logTrekAction("trek-start", req.data));
  
  return commands;
}

// trek-status
function onTrekStatus(req) {
  const commands = [];
  const state = req.appState.state;
  
  commands.push({
    command: "show-trek-info",
    isActive: state.isActive || false,
    stardate: state.stardate || null,
    status: state.ship.status() || null,
    stardate: state.stardate.formattedElapsedSeconds(),
    course: state.ship.course
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