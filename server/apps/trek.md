#Trek - temp
## Commands from original
**0**: WARP ENGINE CONTROL (warp, course)
**1**: SHORT RANGE SENSOR SCAN
**2**: LONG RANGE SENSOR SCAN
**3**: PHASER CONTROL (power, coord)
**4**: PHOTON TORPEDO CONTROL (course)
**5**: SHIELD CONTROL (power)
**6**: DAMAGE CONTROL REPORT
**7**: LIBRARY COMPUTER (0: Known Galactic map, 1: Mission status, 2: Targeting)

## Coordinates
{lat:0,lon:0} is the top-left corner.
{lat:8,lon:8} is the bottom-right corner.
- Pos {rlat:[0..1), rlon:[0..1)} - real coordinates within the current sector
- Sector {lat:[1..8], lon:[1..8]} - int coordinates of sector within current quadrant
- Quadrant {lat:[1..8], lon:[1..8]} - int coordinate of quadrant of the galaxy

Notes:
- Pos is added to support real-time rather than turn-based movement.
- Warp 1 moves 1 sector every 10 seconds (also to support real-time movement.)

## Courses
     4 3 2
    5  s  1
     6 7 8
 
    course  lat lon
    1 0 1.0
    2 -0.71  0.71
    3 -1.0  0
    ...
    8 0.71  0.71


a = 2*PI*(d-1)/8
lat = -1/sin(a)
lon = 1/cos(a)