// title      : The Kasimir Bar Cart
// author     : Frank Johnson
// license    : MIT License
// revision   : 1.0
// tags       : barcart, furniture, steel, wood
// file       : kasimir-barcart-.jscad

// function getParameterDefinitions() {
//     return [
//         { name: 'length', type: 'int', initial: 16, caption: 'Length: ' },
//         { name: 'width', type: 'int', initial: 10, caption: 'Width: ' },
//         { name: 'height', type: 'int', initial: 22, caption: 'Height: ' }
//     ];
// }

function main () {
  // const woodColor = [0.95,0.75,0.6]
  // const steelColor = [0.7,0.7,0.7]
  // const wheelColor = [0.95,0.95,0.95]
  // const numLegs = 4
  // const wheelRadius = 0.8
  // const wheelDepth = 1.25
  // var width = params.width
  // var length = params.length
  // var height = params.height;
  // var tubingSize = 0.5
  // // const plyThickness = 0.75
  //  const legRail = cube({center: [0,0,0], size: [tubingSize, tubingSize, height]})
  // const crossBar = cube({center: [0,0,0], size: [width, tubingSize, tubingSize]}).translate([0,0,5])
  // const stretcher = cube({center: [0,0,0], size: [tubingSize, length+tubingSize, tubingSize]}).translate([0,0,5])
  // const bottomShelf = cube({center: [0,0,0], size: [width+tubingSize, length+tubingSize, plyThickness]}).translate([0,0,-plyThickness]).setColor(woodColor)
  // const wheel = cylinder({start: [0,wheelRadius*2, -wheelRadius], end: [wheelDepth,wheelRadius*2, -wheelRadius], radius: wheelRadius, resolution: 24})
  // const lengthTriangle = CAG.fromPoints([[0,0],[3,0],[0,6.75]]).extrude({offset: [0,0,plyThickness]}).rotateY(90).translate([width-tubingSize, tubingSize, 5])
  // const widthTriangle = CAG.fromPoints([[0,0],[-5,0],[0,-3]]).extrude({offset: [0,0,plyThickness]}).rotateX(90).translate([width, plyThickness, 5])
  // const triangleGroup = union(lengthTriangle, widthTriangle).setColor(woodColor)
  //
  // const legPair = union(legRail,legRail.translate([width, 0, 0]), crossBar, crossBar.translate([0,0,height-5]))
  // const legGroup = union(legPair, legPair.translate([0, length, 0])).setColor(steelColor)
  //
  // const stretchPair = union(stretcher, stretcher.translate([0,0,height-5]))
  // const stretcherGroup = union(stretchPair, stretchPair.translate([width, 0, 0])).setColor(steelColor)
  //
  // const wheelPair = union(wheel, wheel.translate([width-wheelDepth/2,0,0]))
  // const wheelGroup = union(wheelPair, wheelPair.translate([0,length-wheelRadius*3,0])).translate([0,0, -plyThickness]).setColor(wheelColor)
  //
  // const trayBox = cube({center: [0,0,0], size: [width+tubingSize, length+tubingSize, 6]})
  // const trayVoid = cube({center: [0,0,0], size: [width-plyThickness, length-plyThickness, 6]}).translate([plyThickness, plyThickness, plyThickness])
  // const cartTray = difference(trayBox, trayVoid, triangleGroup.translate([tubingSize,0,plyThickness+tubingSize])).translate([0,0,height+tubingSize]).setColor(woodColor)
  //
  // const cornerSteel = difference(union(crossBar.translate([0, 0, height-5+6]), stretcher.translate([width, 0, height-5+6]), legRail.translate([width, 0, 6])), cartTray).setColor(steelColor)
  return cube({center: [1, 2, 3], size: [1, 2, 3]})
  // return union(legGroup, stretcherGroup, triangleGroup, bottomShelf, wheelGroup, cartTray, cornerSteel).translate([0,0,wheelRadius*2+plyThickness])
  // return difference(trayBox, trayVoid,)
}
