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
            devices: this.props.data,
            center: this.props.center,
            zoom: this.props.zoom,
            popItem: {},
            pop: false
        };
        this.getPop = this.getPop.bind(this);
    }

    getPop = (item) => {
        this.setState({ popItem: item, pop: true });
        d3.select("#chart svg").remove();
        let remainder = 55 - (24 + 12);
        let data = [
            {name: "Water", value: 12},
            {name: "Oil", value: 24},
            {name: "Available", value: remainder}
        ],
            text = "";
        let width = window.innerWidth * 0.35,
            height = 260,
            thickness = 40;

        if (window.innerWidth < 500) {
            height = 130;
        }
        else {
            height = 260;
        }

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
                  <h3>{this.state.popItem.name}</h3>
                  <b className={this.state.popItem.state === 1 ? 'Online' : 'Offline'}>
                      Status: {this.state.popItem.state === 1 ? 'Online' : 'Offline'}
                  </b>
                  <div id="chart" />
                  <div className="values">
                      <div className="water">
                          <h4>Water</h4>
                          {/*{this.state.popItem.water_level}*/}
                          12
                      </div>
                      <div className="oil">
                          <h4>Oil</h4>
                          {/*{this.state.popItem.oil_level}*/}
                          24
                      </div>
                      <div className="available">
                          <h4>Available</h4>
                          {/*{this.state.popItem.total_volume - (this.state.popItem.water_level + this.state.popItem.oil_level)}*/}
                          19
                      </div>
                  </div>
              </div>
          </div>
          <GoogleMapReact
              bootstrapURLKeys={{ key: 'AIzaSyAuDagnocohBbjI35Cef4xNn28uSaDt7U0'}}
              defaultCenter={this.state.center}
              center={this.props.center}
              defaultZoom={this.state.zoom}
              zoom={this.props.zoom}
          >
          {
              this.state.devices.map((item, i) => <MapDevice
                  // lat={JSON.parse(item.infoRaw).location.type.GPS.latitude}
                  // lng={JSON.parse(item.infoRaw).location.type.GPS.longitude}
                  lat={this.props.center.lat}
                  lng={this.props.center.lng}
                  pop={this.getPop}
                  iconClick={this.props.iconClick}
                  props={item}
                  key={i} />)
          }
          </GoogleMapReact>
      </div>
    );
  }
}

export default Map;
