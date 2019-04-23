import React, { Component } from 'react';
import Moment from 'react-moment';
import * as d3 from 'd3';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentWillMount() {
    fetch('/historical_data.json')
        .then(rsp => rsp.json())
        .then(data => this.setState({data: data}, () => this.generateChart()));
  }

  generateChart = () => {
    let data = this.state.data,
        width = window.innerWidth - 50,
        height = 300,
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
    let parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(function(d) {
      d.values.forEach(function(d) {
        d.date = parseDate(d.date);
        d.production = +d.production;
      });
    });

    /* Scale */
    let xScale = d3.scaleTime()
        .domain(d3.extent(data[0].values, d => d.date))
        .range([0, width-margin]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data[0].values, d => d.production)])
        .range([height-margin, 0]);

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    /* Add SVG */
    let svg = d3.select("#chart").append("svg")
        .attr("width", (width+margin)+"px")
        .attr("height", (height+margin)+"px")
        .append('g')
        .attr("transform", `translate(${margin}, ${margin})`);


    /* Add line into SVG */
    let line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.production));

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
              .text(`${d.production}`)
              .attr("x", d => xScale(d.date) + 5)
              .attr("y", d => yScale(d.production) - 10);
        })
        .on("mouseout", function(d) {
          d3.select(this)
              .style("cursor", "none")
              .transition()
              .duration(duration)
              .selectAll(".text").remove();
        })
        .append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.production))
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
      <div className="Home">
        <div className="siteBar">
          Global Overview
        </div>
        <div id="chart" />
        <div className="content">
          {
            this.state.data.map((item, i) => {
              return(<div key={i} className="prodColumn">
                <h3>{item.name}</h3>
                {
                  item.values.map((val, i) => {
                    return(<div className="row" key={i}>
                      <div className="date"><Moment format="MM/DD/YYYY">{val.date}</Moment></div>
                      <div className="prod">{val.production}</div>
                    </div>);
                  })
                }
              </div>);
            })
          }
        </div>
      </div>
    );
  }
}

export default Home;
