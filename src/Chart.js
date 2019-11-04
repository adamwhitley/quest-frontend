import React, { Component } from 'react';
import * as d3 from 'd3';

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentWillMount() {
    fetch('http://100.26.154.72/get_measurements.php')
        .then(rsp => rsp.json())
        .then(data => {
            let newObj = [
                {
                    "name": "UpperLevel",
                    "values": []
                },
                {
                    "name": "InterfaceLevel",
                    "values": []
                },
                {
                    "name": "BottomLevel",
                    "values": []
                },
                {
                    "name": "TotalVolume",
                    "values": []
                },
                {
                    "name": "OilVolume",
                    "values": []
                },
                {
                    "name": "WaterVolume",
                    "values": []
                },
                {
                    "name": "Temperature",
                    "values": []
                }
            ];
            data.map((item) => {
                // console.log(item);
                if (item != null) {
                    // if (item[0].time > (Math.floor(Date.now() / 1000) - 43200)) {
                        newObj[0].values.push(item[7]);
                        newObj[1].values.push(item[8]);
                        newObj[2].values.push(item[9]);
                        newObj[3].values.push(item[10]);
                        newObj[4].values.push(item[11]);
                        newObj[5].values.push(item[12]);
                        newObj[6].values.push(item[13]);
                    // }
                }
                return true;
            });
            this.setState({data: newObj}, () => this.generateChart());
        });
  }

  generateChart = () => {
      let height = 250;
      if (window.innerWidth < 500) {
          height = 150;
      }
      // console.log(this.state.data);
    let data = this.state.data,
        width = window.innerWidth - 50,
        margin = 50,
        duration = 250,
        lineOpacity = "0.25",
        lineOpacityHover = "0.85",
        otherLinesOpacityHover = "0.1",
        lineStroke = "1.5px",
        lineStrokeHover = "2.5px",
        circleOpacity = '0.85',
        circleOpacityOnLineHover = "0.25",
        circleRadius = 3,
        circleRadiusHover = 6;

    /* Format Data */
    data.forEach(function(d) {
      d.values.forEach(function(d) {
        d.time = new Date(d.time * 1000);
        d.value = +d.value;
      });
    });

    // let timeFormat = d3.timeFormat("%I:%c");

    /* Scale */
    let xScale = d3.scaleTime()
        .domain(d3.extent(data[0].values, d => d.time))
        .range([0, width-margin]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data[0].values, d => d.value)])
        .range([height-margin, 0]);

    let color = d3.scaleOrdinal().range(["#0ea2f2", "#16f729", "#888888", "#ffb200", "#3ec9ef", "#c9b00c", "#ff1900"]);

    /* Add SVG */
    let svg = d3.select("#chart").append("svg")
        .attr("width", (width+margin)+"px")
        .attr("height", (height+margin)+"px")
        .append('g')
        .attr("transform", `translate(${margin}, ${margin})`);


    /* Add line into SVG */
    let line = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.value));

    let lines = svg.append('g')
        .attr('class', 'lines');

    lines.selectAll('.line-group')
        .data(data).enter()
        .append('g')
        .attr('class', 'line-group')
        .on("mouseover", function(d, i) {
          svg.append("text")
              .attr("class", "title-text")
              .style("fill", color(i))
              .text(d.name)
              .attr("text-anchor", "middle")
              .attr("x", (width-margin)/2)
              .attr("y", 5);
        })
        .on("mouseout", function(d) {
          svg.select(".title-text").remove();
        })
        .append('path')
        .attr('class', 'line')
        .attr('d', d => line(d.values))
        .style('stroke', (d, i) => color(i))
        .style('opacity', lineOpacity)
        .on("mouseover", function(d) {
          d3.selectAll('.line')
              .style('opacity', otherLinesOpacityHover);
          d3.selectAll('.circle')
              .style('opacity', circleOpacityOnLineHover);
          d3.select(this)
              .style('opacity', lineOpacityHover)
              .style("stroke-width", lineStrokeHover)
              .style("cursor", "pointer");
        })
        .on("mouseout", function(d) {
          d3.selectAll(".line")
              .style('opacity', lineOpacity);
          d3.selectAll('.circle')
              .style('opacity', circleOpacity);
          d3.select(this)
              .style("stroke-width", lineStroke)
              .style("cursor", "none");
        });


    /* Add circles in the line */
    lines.selectAll("circle-group")
        .data(data).enter()
        .append("g")
        .style("fill", (d, i) => color(i))
        .selectAll("circle")
        .data(d => d.values).enter()
        .append("g")
        .attr("class", "circle")
        .on("mouseover", function(d) {
          d3.select(this)
              .style("cursor", "pointer")
              .append("text")
              .attr("class", "text")
              .text(`${d.value}`)
              .attr("x", d => xScale(d.time) + 5)
              .attr("y", d => yScale(d.value) - 10);
        })
        .on("mouseout", function(d) {
          d3.select(this)
              .style("cursor", "none")
              .transition()
              .duration(duration)
              .selectAll(".text").remove();
        })
        .append("circle")
        .attr("cx", d => xScale(d.time))
        .attr("cy", d => yScale(d.value))
        .attr("r", circleRadius)
        .style('opacity', circleOpacity)
        .on("mouseover", function(d) {
          d3.select(this)
              .transition()
              .duration(duration)
              .attr("r", circleRadiusHover);
        })
        .on("mouseout", function(d) {
          d3.select(this)
              .transition()
              .duration(duration)
              .attr("r", circleRadius);
        });


    /* Add Axis into SVG */
    let xAxis = d3.axisBottom(xScale).ticks(5);
    let yAxis = d3.axisLeft(yScale).ticks(5);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height-margin})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append('text')
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000")
  };

  render() {
    return (
      <div className="Chart">
        <div id="chart" />
          <div className="deviceChartLegend">
              <div className="tags UpperLevel" /> Upper Level
              <div className="tags InterfaceLevel" /> Interface Level
              <div className="tags BottomLevel" /> Bottom Level
              <div className="tags TotalVolume" /> Total Volume
              <div className="tags OilVolume" /> Oil Volume
              <div className="tags WaterVolume" /> Water Volume
              <div className="tags Temperature" /> Temperature
          </div>
      </div>
    );
  }
}

export default Chart;
