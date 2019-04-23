import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import * as d3 from 'd3';
import MapDevice from './MapDevice.js';

class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: [],
            center: {
                lat: 36.7633, // Center on Site coords
                lng: -95.4861
            },
            zoom: 11,
            popItem: {},
            pop: false
        };
        this.getPop = this.getPop.bind(this);
    }

    componentWillMount() {
        fetch('/devices.json')
            .then(rsp => rsp.json())
            .then(data => this.setState({ devices: data.devices }));
    }
    
    getPop = (item) => {
        this.setState({ popItem: item, pop: true });
        d3.select("#chart svg").remove();
        let remainder = item.total_volume - (item.oil_level + item.water_level);
        let data = [
            {name: "Water", value: item.water_level},
            {name: "Oil", value: item.oil_level},
            {name: "Available", value: remainder}
        ],
            text = "";
        const width = 380,
            height = 260,
            thickness = 40;

        let radius = Math.min(width, height) / 2;
        let color = d3.scaleOrdinal()
            .range(["#3ec9ef", "#c9b00c", "#CCCCCC"]);

        let svg = d3.select("#chart")
            .append('svg')
            .attr('class', 'pie')
            .attr('width', width)
            .attr('height', height);

        let g = svg.append('g')
            .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

        let arc = d3.arc()
            .innerRadius(radius - thickness)
            .outerRadius(radius);

        let pie = d3.pie()
            .value(function(d) { return d.value; })
            .startAngle(-90 * (Math.PI/180))
            .endAngle(90 * (Math.PI/180))
            .sort(null);

        let path = g.selectAll('path')
            .data(pie(data))
            .enter()
            .append("g")
            .on("mouseover", function(d) {
                let g = d3.select(this)
                    .style("cursor", "pointer")
                    .append("g")
                    .attr("class", "text-group");

                g.append("text")
                    .attr("class", "name-text")
                    .text(`${d.data.name}`)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '-3em');

                g.append("text")
                    .attr("class", "value-text")
                    .text(`${d.data.value}`)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '-1.8em');
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .style("cursor", "none")
                    .select(".text-group").remove();
            })
            .append('path')
            .attr('d', arc)
            .attr('fill', (d,i) => color(i))
            .on("mouseover", function(d) {
                d3.select(this)
                    .style("cursor", "pointer")
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .style("cursor", "none")
            })
            .each(function(d, i) { this._current = i; });


        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .text(text);
    };

    render() {
    return (
      <div className="Map">
          <div className={this.state.pop ? 'pop active' : 'pop'} onClick={() => this.setState({ pop: false })}>
              <button type="button" onClick={() => this.setState({ pop: false })}>
                  <FontAwesomeIcon icon={faTimes} />
              </button>
              <div className="popContainer">
                  <h3>{this.state.popItem.id}</h3>
                  <b className={this.state.popItem.status}>Status: {this.state.popItem.status}</b>
                  <div id="chart" />
                  <div className="values">
                      <div className="water">
                          <h4>Water</h4>
                          {this.state.popItem.water_level}
                      </div>
                      <div className="oil">
                          <h4>Oil</h4>
                          {this.state.popItem.oil_level}
                      </div>
                      <div className="available">
                          <h4>Available</h4>
                          {this.state.popItem.total_volume - (this.state.popItem.water_level + this.state.popItem.oil_level)}
                      </div>
                  </div>
              </div>
          </div>
          <GoogleMapReact
              bootstrapURLKeys={{ key: 'AIzaSyAuDagnocohBbjI35Cef4xNn28uSaDt7U0'}}
              defaultCenter={this.state.center}
              defaultZoom={this.state.zoom}
          >
          {
              this.state.devices.map((item, i) => <MapDevice
                  lat={item.lat}
                  lng={item.lng}
                  pop={this.getPop}
                  props={item}
                  key={i} />)
          }
          </GoogleMapReact>
      </div>
    );
  }
}

export default Map;
