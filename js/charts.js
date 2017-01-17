var blockSimulation, bottomOffset, barwidth, barmargin, blockwidth, divwidth, divheight, divdimension
var twopi = 2*Math.PI
var mydata
var update = true
var count = 0
var blocks
var last_update_time
var update_tolerance = 1800000 // half an hour

color = d3.scaleOrdinal(d3.schemePaired)
  
function triangle(){
  d3.select('#onecircle').transition().duration(500).attr('opacity',0)
   
  blockSimulation.stop()
  blockSimulation.alpha(1)
    .force('x',d3.forceX()
           .x(function(d){
                return divdimension*Math.cos(twopi*_.indexOf(segments,d.segment)/segments.length)/3+ divwidth/2
                }).strength(0.3))
    .force("y", d3.forceY()
           .y(function(d){
              return divdimension*Math.sin(twopi*_.indexOf(segments,d.segment)/segments.length)/3 + divheight/2
              })
           .strength(0.3))
    .force("center", function(){return 0})
  
  d3.select('#threecircle').transition().duration(500)
    .attr('opacity',1)
    .on('end',function(){
      blockSimulation.restart().on('end',squareUp)//.on('end',function(){console.log('finished triangling')})//
    }) 
//   blockSimulation.restart().on('end',function(){console.log('finished triangling')})//.on('end',squareUp)//
}

function squareUp(){
  
  blocks = d3.selectAll('.block')
  nblocks = blocks.size()
  n= nblocks
  side = Math.ceil(Math.sqrt(nblocks))
  
  origin = {
    x:(divwidth - blockwidth*side)/2,
    y:(divheight - blockwidth*side)/2
  }
  
  d3.select('#threecircle').transition().duration(500).attr('opacity',0)
  d3.select('#square').transition().duration(500).attr('opacity',1)
  
  blocks.transition().duration(1000).delay(function(d,i){return i*100})
    .attr('transform', function(d,i){
        x = origin.x + blockwidth*(Math.floor(i/side)+(1-Math.sqrt(d.size))/2)  
        y = origin.y + blockwidth*((i%side)+(1-Math.sqrt(d.size))/2) 
        return 'translate('+x+','+y+')'
    })
    .transition().duration(1000)
      .attr('rx',0)
      .attr('ry',0)
      .attr('stroke','black')
      .on('end', function(){
        if(n==1){
          d3.select('#square').transition().duration(500).attr('opacity',0)
          d3.select('#bars').transition().duration(500).attr('opacity',1)
          n= nblocks
          blocks.transition().duration(1000)
            .attr('transform', function(d){return 'translate('+d.block_x+','+d.block_y+')'})
            .on('end',function(){
              
              if(n == 1){update_data()} else {n--}})}
//            if(n == 1){} else {n--}})}
          else {n--}})
  
}


function update_data(){
  
  if(update){
    
    last_update_time = new Date()
    update = (Math.random()>0.8)
    d3.selectAll('.background').transition().duration(500).attr('fill','gainsboro')
    
    //    generate data 
    data = concatenateData(data_gen(mydata[count%6]))
    
    count += 1
 
    _.map(data, function(d){
      d.block_x = d.ndex%3 * blockwidth + _.indexOf(segments, d.segment)*(barwidth+barmargin) + (divwidth-(barwidth+barmargin)*segments.length)/2
      d.block_y = divheight - (blockwidth*(Math.floor(d.ndex/3)+Math.sqrt(d.size))+bottomOffset)
      d.x = d.block_x
      d.y = d.block_y
      })
  
    blockSimulation.nodes(data)
    
    var blocks = d3.select('#display').selectAll('.block').data(data, function(d){return(d.ndex+d.segment)})
    
    var nblocks = blocks.enter().size()+blocks.size()
    
    blocks.exit().transition().duration(2000)
      .attr('width', 0)
      .attr('height', 0)
      .remove() 
    
    blocks1 = blocks.enter()
      .append('rect')
      .classed('block',true)
      .attr('width', 0)
      .attr('height', 0)
      .attr('stroke','black')
      .attr('transform', function(d){return 'translate('+d.block_x+','+d.block_y+')'})
    .merge(blocks).transition().duration(2000)
      .attr('width', function(d){return Math.sqrt(d.size)*blockwidth})
      .attr('height', function(d){return Math.sqrt(d.size)*blockwidth})
      .attr('fill', function(d){return color(d.segment)})
      .attr('transform', function(d){return 'translate('+d.block_x+','+d.block_y+')'})
      .on('end', function(){if(nblocks==1){blob()} else {nblocks--}})
          
  }
  else 
  {
  if (new Date()-last_update_time > update_tolerance){
    d3.selectAll('.background').transition().duration(500).attr('fill','#f2dbdb')
  }
  update = (Math.random()>0.2)
  setTimeout(blob,2000)
  }
  
  console.log('update = ',update)
}

function blob(){
  d3.select('#bars').transition().duration(500).attr('opacity',0)
  d3.select('#onecircle').transition().duration(500).attr('opacity',1)
  blocks = d3.selectAll('.block')
  
  nblocks = blocks.size()
    blocks
      .transition().duration(1000).delay(function(d){return 1000})
      .attr('rx',function(d){return blockwidth*Math.sqrt(d.size)/2})
      .attr('ry',function(d){return blockwidth*Math.sqrt(d.size)/2})
      .attr('stroke',function(d){return color(d.segment)})
      .on('end',function(){
            if(nblocks==1){

              blockSimulation
                .alpha(1)
                .alphaMin(0.0001)
                .force("x", d3.forceX().x(function(){return divwidth/2}).strength(0.3))
                .force("y", d3.forceY().y(function(){return divheight/2}).strength(0.3))
                .force("collide", d3.forceCollide().radius(function(d){return (blockwidth+5)*Math.sqrt(d.size)/2}).iterations(5).strength(0.99))
                .on("end",triangle)
                .restart();
            }
            else { nblocks--}
          })          
  }

function data_gen(data0){
  data = _.map(data0,function(v,k){
    v.segment=k
    return v})
  
  _.map(data, function(d){
    d.blockscale = d3.scaleLinear().domain([0,d.goal]).range([0,27])
    nballs =  d.blockscale(d.current_plus_discretionary)
    d.balls = _.map(_.range(Math.floor(nballs)),function(n){return {ndex:n,size:1,segment:d.segment}})
    leftover = nballs - Math.floor(nballs)
    length = d.balls.length
    if (leftover > 0){d.balls.push({ndex:length,size:leftover,segment:d.segment})}
  })
  
  return data
}  

function concatenateData(data){
  return data.reduce(function(a,b){return a.concat(b.balls)},[])  
} 

function initialise_layout(){
 
  // get sizes
  
  svg = d3.select('#blocks')
  divsize = d3.select('body').node().getBoundingClientRect()
  divwidth = divsize.width
  divheight = divsize.height
  divdimension = Math.min(divwidth,divheight)
  
  blockwidth = divheight/19
  barwidth = blockwidth*3
  barmargin = blockwidth/2
  bottomOffset = 1.5*blockwidth
  
  
  segments = _.unique(_.pluck(data,'segment'))
  
  
  //setup svg
  
  svg.attr('width',divwidth).attr('height',divheight)
  
  // setup underlays
  
  d3.selectAll('.underlay')
    .attr('opacity',0)
    .each(function(){
      d3.select(this)
        .append('rect')
        .classed('background',true)
        .attr('height', divheight)
        .attr('width', divwidth)
        .attr('fill','gainsboro')

    })
  
  d3.select('#bars').attr('opacity',1)
    .selectAll('.background_bars').data(segments)
    .enter().append('rect')
    .classed('background_bars',true)
    .attr('height', 9*blockwidth)
    .attr('width', 3*blockwidth)
    .attr('fill','white')
    .attr('stroke','#989898')
    .attr('transform',function(d,i){
      x= i*(barwidth+barmargin) + (divwidth-(barwidth+barmargin)*segments.length)/2
      y = divheight-(blockwidth*9 + bottomOffset)
      return 'translate('+x+','+y+')'
    })
  
  d3.select('#onecircle').append('circle')
    .attr('r', blockwidth*Math.sqrt(81/Math.PI))
    .attr('fill','white')
    .attr('stroke','#989898')
    .attr('transform','translate('+divwidth/2+','+divheight/2+')')
  
  d3.select('#threecircle').selectAll('.background_circle').data(segments)
    .enter().append('circle')
    .classed('background_circle',true)
    .attr('r', blockwidth*Math.sqrt(27/Math.PI))
    .attr('fill','white')
    .attr('stroke','#989898')
    .attr('transform',function(d,i){
      x = divdimension*Math.cos(twopi*i/segments.length)/3+ divwidth/2
      y = divdimension*Math.sin(twopi*i/segments.length)/3+ divheight/2
      return'translate('+x+','+y+')'
    })
  
  d3.select('#square').append('rect')
    .attr('height', blockwidth*9)
    .attr('width', blockwidth*9)
    .attr('fill','white')
    .attr('stroke','#989898')
    .attr('transform',function(){
      x=(divwidth -  blockwidth*9)/2
      y=(divheight  -  blockwidth*9)/2
      return'translate('+x+','+ y +')'
      })
  
  //setup gooey filter
  
  d3.select('#display')
    .style('opacity',0.8)
    .style("filter", "url(#gooey)") //Set the filter on the container g
  var defs = svg.append('defs')
  var filter = defs.append('filter').attr('id','gooey');
	filter.append('feGaussianBlur')
		.attr('in','SourceGraphic')
		.attr('stdDeviation','10')
		.attr('result','blur');
	filter.append('feColorMatrix')
		.attr('in','blur')
		.attr('mode','matrix')
		.attr('values','1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7')
		.attr('result','gooey');
	filter.append('feBlend')
		.attr('in','SourceGraphic')
		.attr('in2','gooey');
  
  
  //setup force layout
  
  blockSimulation = d3.forceSimulation()
    .velocityDecay(.8)
    .force("collide", d3.forceCollide().radius(function(d){return (blockwidth+5)*Math.sqrt(d.size)/2}).iterations(5).strength(0.99))
    .on("tick", blockTick)
    .stop();
  
  function blockTick(){
     blocks.attr('transform',function(d){
       return 'translate('+(d.x-blockwidth/2)+','+(d.y-blockwidth/2)+')'
     })
  }
  
}


d3.queue()
    .defer(d3.json, 'data/data.json')
    .await(display);

function display(_err, _data){
  mydata = _data
  
  data = data_gen(mydata[0])
  initialise_layout()
  
  update_data()
  
} 